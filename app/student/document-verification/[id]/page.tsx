"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import apiClient, { studentVerificationRequestsApi } from "@/lib/api";
import type {
  DocumentVerificationRequest,
  StudentDocument,
  DocumentRequirement,
} from "@/types";
import { Paperclip, UploadCloud, ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";

export default function StudentVerificationDetailPage() {
  type DetailRequest = DocumentVerificationRequest & {
    documents?: (StudentDocument & { requirement?: DocumentRequirement })[];
    country?: { id: string; title: string };
  };
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [item, setItem] = useState<DetailRequest | null>(null);
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [resubmitSupported, setResubmitSupported] = useState(true);

  const fetchItem = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      try {
        const res = await studentVerificationRequestsApi.getById(id);
        setItem(res.request || null);
        return;
      } catch {
        const list = await studentVerificationRequestsApi.list({
          page: 1,
          limit: 50,
        });
        const found = (list.requests || []).find((r) => r.id === id) || null;
        if (!found) throw new Error("not-found");
        setItem({ ...(found as DocumentVerificationRequest) } as DetailRequest);
        return;
      }
    } catch {
      toast.error("Request not found");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const header = useMemo(() => {
    if (!item) return null;
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            Verification Details
          </h2>
          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
            <span>
              Country:{" "}
              <span className="font-medium">
                {item.country?.title || item.countryId}
              </span>
            </span>
            <span>•</span>
            <span>
              Created:{" "}
              {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
            </span>
          </div>
        </div>
        <Badge
          variant={
            item.status === "COMPLETED"
              ? "default"
              : item.status === "REJECTED"
              ? "destructive"
              : "secondary"
          }
        >
          {item.status}
        </Badge>
      </div>
    );
  }, [item]);

  async function handleResubmit(doc: StudentDocument) {
    try {
      const file = files[doc.id];
      if (!file) {
        toast.error("Please choose a file to resubmit");
        return;
      }
      setUploadingId(doc.id);
      const up = await apiClient.images.upload(file);
      if (!up.url || !up.fileName) throw new Error("Upload failed");
      if (!item) return;
      const res = await studentVerificationRequestsApi.addDocument(item.id, {
        requirementId: doc.requirementId,
        parentDocumentId: doc.id,
        fileUrl: up.url,
        originalName: file.name,
        fileName: up.fileName,
        fileSize: file.size,
        mimeType: file.type,
      });
      setItem((prev) =>
        prev
          ? {
              ...prev,
              documents: (prev.documents || []).map((d) =>
                d.id === doc.id
                  ? ({
                      ...d,
                      ...(res.document as StudentDocument),
                    } as StudentDocument & {
                      requirement?: DocumentRequirement;
                    })
                  : d
              ),
            }
          : prev
      );
      toast.success("Document resubmitted");
      setFiles((p) => ({ ...p, [doc.id]: undefined }));
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (err as any)?.response?.status;
      if (status === 404) {
        setResubmitSupported(false);
        toast.error("Resubmission is not available right now.");
      } else {
        toast.error("Failed to resubmit document");
      }
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Card>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        </div>
      ) : item ? (
        <>
          {header}

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Your Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(item.documents || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No documents attached.
                </div>
              ) : (
                (
                  (item.documents || []) as (StudentDocument & {
                    requirement?: DocumentRequirement;
                  })[]
                ).map((doc) => {
                  const canResubmit =
                    doc.status === "REJECTED" ||
                    doc.status === "RESUBMISSION_REQUIRED";
                  return (
                    <div
                      key={doc.id}
                      className="border rounded-md p-3 md:p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium break-words">
                              {doc.requirement?.title || doc.originalName}
                            </span>
                            <Badge
                              variant={
                                doc.status === "APPROVED"
                                  ? "default"
                                  : doc.status === "REJECTED"
                                  ? "destructive"
                                  : doc.status === "RESUBMISSION_REQUIRED"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {doc.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                            <span>
                              {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                            </span>
                            <span>•</span>
                            <span>{doc.mimeType}</span>
                            <span>•</span>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 hover:underline"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          {(doc.reviewNotes || doc.rejectionReason) && (
                            <div className="text-xs text-muted-foreground space-y-1">
                              {doc.reviewNotes && (
                                <div>
                                  <span className="font-medium">Notes:</span>{" "}
                                  {doc.reviewNotes}
                                </div>
                              )}
                              {doc.rejectionReason && (
                                <div>
                                  <span className="font-medium">Reason:</span>{" "}
                                  {doc.rejectionReason}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {canResubmit && resubmitSupported && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end">
                          <label className="inline-flex items-center justify-center px-3 py-2 rounded-md border bg-background hover:bg-accent cursor-pointer text-sm">
                            <UploadCloud className="h-4 w-4 mr-2" />
                            {files[doc.id] ? "Change file" : "Choose file"}
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) =>
                                setFiles((p) => ({
                                  ...p,
                                  [doc.id]: e.target.files?.[0],
                                }))
                              }
                            />
                          </label>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleResubmit(doc)}
                            disabled={!files[doc.id] || uploadingId === doc.id}
                            aria-busy={uploadingId === doc.id}
                            className="cursor-pointer"
                          >
                            {uploadingId === doc.id
                              ? `Uploading${
                                  files[doc.id]
                                    ? `: ${files[doc.id]!.name}`
                                    : "..."
                                }`
                              : "Resubmit"}
                          </Button>
                          {uploadingId === doc.id && files[doc.id] && (
                            <div className="text-xs text-muted-foreground">
                              Uploading{" "}
                              <span className="font-medium">
                                {files[doc.id]!.name}
                              </span>{" "}
                              for{" "}
                              <span className="font-medium">
                                {doc.requirement?.title || doc.originalName}
                              </span>
                              ...
                            </div>
                          )}
                        </div>
                      )}
                      {canResubmit && !resubmitSupported && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 text-amber-800 text-xs p-3">
                          Resubmission isn&apos;t available at the moment.
                          Please try again later.
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">
            Request not found
          </CardContent>
        </Card>
      )}
    </div>
  );
}
