import { NextResponse } from "next/server";
import Imap from "node-imap";
import { simpleParser } from "mailparser";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  if (!uid) {
    return NextResponse.json({ error: "Missing UID" }, { status: 400 });
  }

  return new Promise<NextResponse>((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password,
      host: process.env.IMAP_HOST,
      port: Number(process.env.IMAP_PORT) || 993,
      tls: true,
    });

    imap.once("ready", () => {
      imap.openBox("INBOX", true, (err) => {
        if (err) return reject(err);

        const f = imap.fetch([Number(uid)], { bodies: "", struct: true });

        let buffer = "";
        let messageFound = false;

        f.on("message", (msg) => {
          messageFound = true;

          msg.on("body", (stream) => {
            stream.on("data", (chunk) => {
              buffer += chunk.toString("utf8");
            });
          });

          msg.once("end", async () => {
            try {
              const parsed = await simpleParser(buffer);

              const from =
                (Array.isArray(parsed.from)
                  ? parsed.from.map((f) => f.text).join(", ")
                  : parsed.from?.text) ?? "(Unknown Sender)";

              const to =
                (Array.isArray(parsed.to)
                  ? parsed.to.map((t) => t.text).join(", ")
                  : parsed.to?.text) ?? "";

              const attachments = parsed.attachments?.map((att) => ({
                filename: att.filename,
                contentType: att.contentType,
                size: att.size,
              }));

              resolve(
                NextResponse.json({
                  uid: Number(uid),
                  subject: parsed.subject ?? "(No Subject)",
                  from,
                  to,
                  date: parsed.date?.toISOString() ?? "",
                  bodyText: parsed.text ?? "",
                  bodyHtml: parsed.html ?? "",
                  attachments: attachments || [],
                })
              );
            } catch (parseErr) {
              console.error("Mail parse error:", parseErr);
              reject(parseErr);
            }
          });
        });

        f.once("error", (fetchErr) => reject(fetchErr));

        f.once("end", () => {
          if (!messageFound) {
            resolve(
              NextResponse.json(
                { error: `No message found for UID ${uid}` },
                { status: 404 }
              )
            );
          }
          imap.end();
        });
      });
    });

    imap.once("error", (err) => {
      console.error("IMAP error:", err);
      reject(err);
    });

    imap.connect();
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ uid: number }> }
) {
  const { uid } = await params;
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password." },
      { status: 400 }
    );
  }

  return new Promise<NextResponse>((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password: password,
      host: process.env.IMAP_HOST,
      port: Number(process.env.IMAP_PORT) || 993,
      tls: true,
    });

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err) => {
        if (err) {
          imap.end();
          return reject(err);
        }

        imap.move(uid, "[Gmail]/Trash", (err) => {
          imap.end();
          if (err) {
            return reject(err);
          } else {
            return resolve(
              NextResponse.json({ success: true, movedTo: "Trash", uid })
            );
          }
        });
      });
    });

    imap.once("error", (err) => {
      console.error("IMAP error:", err);
      reject(err);
    });

    imap.connect();
  });
}
