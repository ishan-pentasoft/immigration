"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Email = {
  subject: string;
  from: string;
  date: string;
  body: string;
};

const EmailViewPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<Email | null>(null);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? sessionStorage.getItem("selectedEmail")
          : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Email;
        setEmail(parsed);
      }
    } catch (e) {
      console.error("Failed to load selected email", e);
    }
  }, []);

  const formattedDate = useMemo(() => {
    if (!email?.date) return "";
    try {
      return new Date(email.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return email?.date || "";
    }
  }, [email?.date]);

  const srcDoc = useMemo(() => {
    const body = email?.body || "";
    const looksHtml = /<[^>]+>/.test(body);
    const safeHtml = looksHtml
      ? body
      : `<pre style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;">${body.replace(
          /[&<>"']/g,
          (c) =>
            ((
              {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
              } as Record<string, string>
            )[c] || c)
        )}</pre>`;
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body>${safeHtml}</body></html>`;
  }, [email?.body]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          Back
        </Button>
        <div style={{ width: 80 }} />
      </div>

      {!email ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-6 w-48 bg-accent rounded mb-2" />
                <div className="h-4 w-64 bg-accent rounded" />
              </div>
            </div>
            <div className="mt-4 h-64 bg-accent rounded" />
            <div className="mt-4 text-sm text-muted-foreground">
              No email selected. Go back to Inbox.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="space-y-1">
              <div className="text-xl font-semibold break-words">
                {email.subject || "(No Subject)"}
              </div>
              <div className="text-sm text-muted-foreground break-words">
                From: {email.from}
              </div>
              <div className="text-xs text-muted-foreground">
                {formattedDate}
              </div>
            </div>
            <div
              className="border rounded overflow-hidden"
              style={{ height: "70vh" }}
            >
              <iframe
                title="Email Body"
                sandbox="allow-same-origin"
                referrerPolicy="no-referrer"
                srcDoc={srcDoc}
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailViewPage;
