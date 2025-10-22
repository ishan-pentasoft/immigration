"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { associateVerificationRequestsApi } from "@/lib/api";
import type {
  DocumentVerificationRequest,
  Student,
  Country,
  StudentDocument,
  DocumentRequirement,
} from "@/types";
import Link from "next/link";
import DocumentReviewPanel from "@/components/associate/DocumentReviewPanel";

export default function AssociateVerificationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<
    | (DocumentVerificationRequest & {
        student?: Student;
        country?: Country;
        documents?: (StudentDocument & { requirement?: DocumentRequirement })[];
      })
    | null
  >(null);
  const id = params.id;

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      const res = await associateVerificationRequestsApi.getById(id);
      setItem(res.request || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const header = useMemo(() => {
    if (loading || !item) return null;
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            Verification #{item.id.slice(0, 8)}
          </h2>
          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
            <span>
              Student:{" "}
              <span className="font-medium">
                {item.student?.name || item.studentId}
              </span>
            </span>
            <span>•</span>
            <span>
              Country:{" "}
              <span className="font-medium">
                {item.country?.title || item.countryId}
              </span>
            </span>
            <span>•</span>
            <span>
              Created: {new Date(item?.createdAt || "").toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
          <Link href="/associate/document-verification">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </div>
    );
  }, [item, loading]);

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
              <CardTitle className="text-base font-medium">Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.documents?.length ? (
                item.documents.map((doc) => (
                  <DocumentReviewPanel
                    key={doc.id}
                    document={doc}
                    onReviewed={(updated) =>
                      setItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              documents:
                                prev.documents?.map((d) =>
                                  d.id === updated.id ? { ...d, ...updated } : d
                                ) || [],
                            }
                          : prev
                      )
                    }
                  />
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No documents attached.
                </div>
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
