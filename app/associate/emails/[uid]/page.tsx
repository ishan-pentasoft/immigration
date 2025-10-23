"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AxiosError } from "axios";

type MessageDetail = {
  uid: number;
  subject: string;
  from: string;
  to: string;
  date: string;
  bodyText: string;
  bodyHtml: string;
  attachments: { filename?: string; contentType?: string; size?: number }[];
};

const EmailDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ uid: string }>();
  const { uid } = params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { emailService } = await apiClient.associate.emailService.get();
        if (!emailService?.email || !emailService?.password) {
          setError("No email service configured");
          return;
        }
        const res = await apiClient.associate.imap.getByUid({
          uid,
          email: emailService.email,
          password: emailService.password,
          signal: controller.signal,
        });
        setMessage(res);
        setIframeLoaded(false);
      } catch (e: unknown) {
        if ((e as Error)?.name === "CanceledError") return;
        console.error(e);
        const status = (e as AxiosError)?.response?.status as
          | number
          | undefined;
        if (status === 404) {
          setError("Email not found");
        } else {
          setError("Failed to load email");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [uid]);

  useEffect(() => {
    setIframeLoaded(false);
  }, [message?.uid, message?.bodyHtml, message?.bodyText]);

  const formattedDate = useMemo(() => {
    if (!message?.date) return "";
    try {
      return new Date(message.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return message?.date || "";
    }
  }, [message?.date]);

  const srcDoc = useMemo(() => {
    const html = message?.bodyHtml?.trim();
    const text = message?.bodyText || "";
    const content =
      html && /<[^>]+>/.test(html)
        ? html
        : `<pre style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${text.replace(
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
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body>${content}</body></html>`;
  }, [message?.bodyHtml, message?.bodyText]);

  const showSkeleton = loading && !message;

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

      {showSkeleton ? (
        <Card>
          <CardContent className="p-6">
            <div className="h-6 w-48 bg-accent rounded mb-2" />
            <div className="h-4 w-64 bg-accent rounded" />
            <div className="mt-4 h-64 bg-accent rounded" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600 text-sm">{error}</div>
          </CardContent>
        </Card>
      ) : message ? (
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="space-y-1">
              <div className="text-xl font-semibold break-words">
                {message?.subject || "(No Subject)"}
              </div>
              <div className="text-sm text-muted-foreground break-words">
                From: {message?.from}
              </div>
              {message?.to && (
                <div className="text-sm text-muted-foreground break-words">
                  To: {message?.to}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {formattedDate}
              </div>
            </div>

            {message?.attachments?.length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1">Attachments</div>
                <ul className="list-disc ml-5 space-y-1">
                  {message?.attachments?.map((a, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      {a.filename || "Unnamed"}
                      {a.size ? ` • ${(a.size / 1024).toFixed(1)} KB` : ""}
                      {a.contentType ? ` • ${a.contentType}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              className="relative border rounded overflow-hidden"
              style={{ height: "70vh" }}
            >
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <div className="text-sm text-muted-foreground">
                    Rendering…
                  </div>
                </div>
              )}
              <iframe
                title="Email Body"
                sandbox="allow-same-origin"
                referrerPolicy="no-referrer"
                srcDoc={srcDoc}
                className="w-full h-full"
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default EmailDetailPage;
