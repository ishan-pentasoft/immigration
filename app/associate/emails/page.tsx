"use client";

import apiClient from "@/lib/api";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { IconTrash, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

const EmailsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(1, Number(searchParams.get("limit") || 10));

  const [loading, setLoading] = useState(true);
  const [hasService, setHasService] = useState<boolean | null>(null);
  const [emailCreds, setEmailCreds] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [messages, setMessages] = useState<Array<{
    uid: number;
    subject: string;
    from: string;
    date: string;
    seen: boolean;
    body: string;
  }> | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [deletingUid, setDeletingUid] = useState<number | null>(null);

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
        setEmailCreds({
          email: emailService.email,
          password: emailService.password,
        });
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

  const handleDelete = async (uid: number) => {
    if (!emailCreds || !messages) return;
    const prevMessages = messages;
    setDeletingUid(uid);
    setMessages((msgs) => (msgs ? msgs.filter((m) => m.uid !== uid) : msgs));
    setTotal((t) => Math.max(0, t - 1));

    const promise = apiClient.associate.imap.remove({
      uid,
      email: emailCreds.email,
      password: emailCreds.password,
    });

    toast.promise(promise, {
      loading: "Deleting email...",
      success: "Email moved to Trash",
      error: "Failed to delete email",
    });

    try {
      await promise;
    } catch (e) {
      setMessages(prevMessages);
      setTotal((t) => t + 1);
      console.error("Failed to delete email", e);
    } finally {
      setDeletingUid(null);
    }
  };

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
              className={`${m.seen ? "bg-muted/50" : ""}`}
              role="button"
              tabIndex={0}
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div
                    className="min-w-0 cursor-pointer"
                    onClick={() => router.push(`/associate/emails/${m.uid}`)}
                  >
                    <div
                      className={`sm:text-lg font-semibold break-words ${
                        m.seen ? "text-muted-foreground line-clamp-2" : ""
                      }`}
                    >
                      {m.subject || "(No Subject)"}
                    </div>
                    <div className="text-sm text-muted-foreground break-words line-clamp-1">
                      {m.from}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(m.date)}
                    </div>
                    <ConfirmDialog
                      title="Move to Trash?"
                      description="This email will be moved to Trash."
                      confirmText="Delete"
                      onConfirm={() => handleDelete(m.uid)}
                      trigger={
                        <Button
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer"
                          disabled={deletingUid === m.uid}
                        >
                          {deletingUid === m.uid ? (
                            <IconLoader2 className="animate-spin" />
                          ) : (
                            <IconTrash />
                          )}
                        </Button>
                      }
                    />
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
