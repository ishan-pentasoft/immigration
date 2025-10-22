"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { associateDocumentsApi } from "@/lib/api";
import { FileText, ExternalLink } from "lucide-react";
import type { StudentDocument, DocumentRequirement } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "APPROVED"
      ? "default"
      : status === "REJECTED"
      ? "destructive"
      : status === "RESUBMISSION_REQUIRED"
      ? "secondary"
      : "outline";
  return (
    <Badge variant={variant} className="uppercase tracking-wide text-[10px]">
      {status}
    </Badge>
  );
}

export default function DocumentReviewPanel({
  document,
  onReviewed,
}: {
  document: StudentDocument & { requirement?: DocumentRequirement };
  onReviewed: (updated: StudentDocument) => Promise<void> | void;
}) {
  const [notes, setNotes] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");
  const [loading, setLoading] = React.useState<string | null>(null);
  const isActionable = document.status === "PENDING";

  async function act(
    status: "APPROVED" | "REJECTED" | "RESUBMISSION_REQUIRED"
  ) {
    try {
      setLoading(status);
      await associateDocumentsApi.review(document.id, {
        status,
        reviewNotes: notes?.trim() || undefined,
        rejectionReason:
          status === "REJECTED" || status === "RESUBMISSION_REQUIRED"
            ? reason?.trim() || undefined
            : undefined,
      });
      toast.success(`Document ${status.toLowerCase().replaceAll("_", " ")}`);
      await onReviewed({ ...document, status });
      setNotes("");
      setReason("");
    } catch {
      toast.error("Failed to update document status");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="border rounded-md p-3 md:p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium break-words">
              {document.requirement?.title || document.originalName}
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>{(document.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
            <span>•</span>
            <span>{document.mimeType}</span>
            <span>•</span>
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          <StatusBadge status={document.status} />
        </div>
      </div>

      <div className="grid gap-3">
        <div className="grid gap-1">
          <Label htmlFor={`notes-${document.id}`}>Reviewer Notes</Label>
          <Textarea
            id={`notes-${document.id}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for the student"
          />
        </div>

        <div className="grid gap-1">
          <Label htmlFor={`reason-${document.id}`}>
            Rejection/Resubmission Reason
          </Label>
          <Textarea
            id={`reason-${document.id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Required when rejecting or asking resubmission"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end">
        <Button
          variant="outline"
          onClick={() => act("RESUBMISSION_REQUIRED")}
          disabled={loading !== null || !isActionable}
        >
          {loading === "RESUBMISSION_REQUIRED"
            ? "Requesting..."
            : "Request Resubmission"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => act("REJECTED")}
          disabled={loading !== null || !isActionable}
        >
          {loading === "REJECTED" ? "Rejecting..." : "Reject"}
        </Button>
        <Button
          onClick={() => act("APPROVED")}
          disabled={loading !== null || !isActionable}
        >
          {loading === "APPROVED" ? "Approving..." : "Approve"}
        </Button>
      </div>
    </div>
  );
}
