"use client";

import apiClient from "@/lib/api";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EmailsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(1, Number(searchParams.get("limit") || 10));

  const [loading, setLoading] = useState(true);
  const [hasService, setHasService] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Array<{
    subject: string;
    from: string;
    date: string;
    body: string;
  }> | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setHasService(null);
        const { emailService } = await apiClient.associate.emailService.get();
        if (!emailService?.email || !emailService?.password) {
          setHasService(false);
          setMessages([]);
          setTotal(0);
          setTotalPages(1);
          return;
        }
        setHasService(true);
        const res = await apiClient.associate.imap.list({
          email: emailService.email,
          password: emailService.password,
          page,
          limit,
          signal: controller.signal,
        });
        setMessages(res.messages || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
        if (res?.totalPages && page > res.totalPages) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", String(Math.max(1, res.totalPages)));
          router.replace(`?${params.toString()}`);
        }
      } catch (err) {
        if ((err as Error)?.name === "CanceledError") return;
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [page, limit, router, searchParams]);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(Math.max(1, Math.min(totalPages, p))));
    params.set("limit", String(limit));
    router.push(`?${params.toString()}`);
  };

  const formatDate = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const openEmail = (m: {
    subject: string;
    from: string;
    date: string;
    body: string;
  }) => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("selectedEmail", JSON.stringify(m));
      }
    } catch (e) {
      console.warn("Failed to cache selected email", e);
    }
    router.push("/associate/emails/view");
  };

  if (hasService === false) {
    return (
      <div className="flex flex-col gap-5 items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">No email service configured</p>
        <Button
          onClick={() => router.push("/associate/email-service")}
          className="cursor-pointer"
        >
          Configure
        </Button>
      </div>
    );
  }
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inbox</h2>
        <p className="text-muted-foreground">{total} emails</p>
      </div>

      <div className="grid gap-4">
        {loading || messages === null ? (
          Array.from({ length: Math.min(limit, 2) }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-accent rounded" />
                  <div className="h-3 w-1/2 bg-accent rounded" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-2">No emails found</h3>
              <p className="text-muted-foreground text-center">
                {total === 0
                  ? "Your inbox is empty."
                  : "No emails on this page."}
              </p>
            </CardContent>
          </Card>
        ) : (
          messages.map((m, idx) => (
            <Card
              key={`${m.date}-${idx}`}
              className="hover:shadow-md transition-shadow cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={() => openEmail(m)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openEmail(m);
              }}
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-semibold break-words line-clamp-1">
                      {m.subject || "(No Subject)"}
                    </div>
                    <div className="text-sm text-muted-foreground break-words line-clamp-1">
                      {m.from}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(m.date)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || loading}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmailsPage;
