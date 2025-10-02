import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function sanitizeFileName(name: string) {
  // remove path separators and unsafe chars
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function ensureUploadsDir() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch {
    // ignore if exists
  }
  return uploadDir;
}

export async function GET() {
  try {
    const uploadsDir = await ensureUploadsDir();
    const entries = await fs.readdir(uploadsDir, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile()).map((e) => e.name);
    // Optional: sort by mtime desc
    const stats = await Promise.all(
      files.map(async (name) => {
        const full = path.join(uploadsDir, name);
        const s = await fs.stat(full);
        return { fileName: name, url: `/api/images/${name}`, mtime: s.mtimeMs };
      })
    );
    stats.sort((a, b) => b.mtime - a.mtime);
    return NextResponse.json({
      images: stats.map(({ fileName, url }) => ({ fileName, url })),
    });
  } catch (err) {
    console.error("GET /api/images error", err);
    return NextResponse.json(
      { error: "Failed to list images" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "Missing 'file' in form-data" },
        { status: 400 }
      );
    }

    const uploadsDir = await ensureUploadsDir();

    const originalName =
      file && typeof (file as File).name === "string"
        ? String((file as File).name)
        : "upload";
    const safeOriginal = sanitizeFileName(originalName);
    const extFromName = path.extname(safeOriginal);
    const extFromType =
      file.type && file.type.includes("/") ? `.${file.type.split("/")[1]}` : "";
    const chosenExt = (extFromName || extFromType || "").toLowerCase();
    const uniq = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fileName = sanitizeFileName(`${uniq}${chosenExt}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    const url = `/api/images/${fileName}`;

    return NextResponse.json({ url, fileName }, { status: 201 });
  } catch (err) {
    console.error("POST /api/images error", err);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
