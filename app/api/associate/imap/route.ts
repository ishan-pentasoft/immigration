import { NextResponse } from "next/server";
import Imap from "node-imap";
import { simpleParser } from "mailparser";

type Message = {
  uid: number;
  subject: string;
  from: string;
  date: string;
  body: string;
};

async function handleImap({
  email,
  password,
  page,
  limit,
}: {
  email?: string;
  password?: string;
  page?: number | string | null;
  limit?: number | string | null;
}) {
  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  const messages: Message[] = [];
  let totalCount = 0;
  const safeLimit = Math.max(1, Number(limit) || 10);
  const safePage = Math.max(1, Number(page) || 1);

  return new Promise<NextResponse>((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password: password,
      host: process.env.IMAP_HOST,
      port: Number(process.env.IMAP_PORT) || 993,
      tls: true,
    });

    imap.once("ready", () => {
      imap.openBox("INBOX", true, (err, box) => {
        if (err) return reject(err);
        totalCount = box?.messages?.total ?? 0;

        if (totalCount === 0) {
          imap.end();
          return resolve(
            NextResponse.json({
              messages: [],
              page: safePage,
              limit: safeLimit,
              total: 0,
              totalPages: 0,
            })
          );
        }

        const startIndex = (safePage - 1) * safeLimit;
        if (startIndex >= totalCount) {
          imap.end();
          return resolve(
            NextResponse.json({
              messages: [],
              page: safePage,
              limit: safeLimit,
              total: totalCount,
              totalPages: Math.max(1, Math.ceil(totalCount / safeLimit)),
            })
          );
        }

        const endSeq = totalCount - startIndex;
        const startSeq = Math.max(1, endSeq - safeLimit + 1);

        const f = imap.seq.fetch(`${startSeq}:${endSeq}`, { bodies: "" });

        f.on("message", (msg) => {
          let buffer = "";
          let uid = 0;

          msg.on("attributes", (attrs) => {
            uid = attrs.uid;
          });

          msg.on("body", (stream) => {
            stream.on("data", (chunk) => {
              buffer += chunk.toString("utf8");
            });
          });

          msg.once("end", async () => {
            try {
              const parsed = await simpleParser(buffer);
              messages.push({
                uid,
                subject: parsed.subject ?? "(No Subject)",
                from: parsed.from?.text ?? "(Unknown Sender)",
                date: parsed.date?.toISOString() ?? "",
                body: parsed.text || parsed.html || "(No content found)",
              });
            } catch (parseErr) {
              console.error("Mail parse error:", parseErr);
            }
          });
        });

        f.once("error", (fetchErr) => reject(fetchErr));

        f.once("end", () => {
          imap.end();
        });
      });
    });

    imap.once("error", (err) => {
      console.error("IMAP error:", err);
      reject(err);
    });

    imap.once("end", () => {
      const sorted = messages.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      resolve(
        NextResponse.json({
          messages: sorted,
          page: safePage,
          limit: safeLimit,
          total: totalCount,
          totalPages: Math.max(1, Math.ceil(totalCount / safeLimit)),
        })
      );
    });

    imap.connect();
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || undefined;
  const password = searchParams.get("password") || undefined;
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  return handleImap({ email, password, page, limit });
}

export async function POST(req: Request) {
  const { email, password, page, limit } = (await req
    .json()
    .catch(() => ({}))) as {
    email?: string;
    password?: string;
    page?: number;
    limit?: number;
  };
  return handleImap({ email, password, page, limit });
}
