import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function getFilePath(fileName: string) {
  return path.join(process.cwd(), "public", "uploads", fileName);
}

export async function GET(_req: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const filePath = getFilePath(id);
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = await fs.readFile(filePath);
    const ext = path.extname(id).toLowerCase().replace(/^\./, "");
    const contentType =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "png"
        ? "image/png"
        : ext === "gif"
        ? "image/gif"
        : ext === "webp"
        ? "image/webp"
        : ext === "avif"
        ? "image/avif"
        : ext === "svg"
        ? "image/svg+xml"
        : "application/octet-stream";
    const body = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("GET /api/images/[id] error", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const filePath = getFilePath(id);
    try {
      await fs.unlink(filePath);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      throw err;
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/images/[id] error", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
