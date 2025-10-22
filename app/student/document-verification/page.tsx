"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import apiClient, {
  userCountriesApi,
  studentDocumentRequirementsApi,
  studentVerificationRequestsApi,
} from "@/lib/api";
import type {
  DocumentVerificationRequest,
  CreateDocumentVerificationRequestInput,
} from "@/types";
import { useStudentAuth } from "@/hooks/useStudentAuth";
import { Paperclip, UploadCloud, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Country = { id: string; title: string };

type Requirement = {
  id: string;
  countryId: string;
  documentType: string;
  title: string;
  description?: string | null;
  required: boolean;
  maxFileSize: number;
  allowedTypes: string[];
  order: number;
  active: boolean;
};

type LocalDoc = {
  file?: File;
  uploaded?: boolean;
  uploading?: boolean;
  error?: string | null;
  previewUrl?: string | null;
  fileUrl?: string;
  originalName?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
};

type StatusItem = DocumentVerificationRequest;

export default function StudentDocumentVerificationPage() {
  const { student, requireAuth } = useStudentAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryId, setCountryId] = useState<string>("");
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocs] = useState<Record<string, LocalDoc>>({});
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (!requireAuth()) return;
  }, [requireAuth]);

  const fetchCountries = useCallback(async () => {
    try {
      const { countries } = await userCountriesApi.list();
      setCountries(countries || []);
    } catch {
      toast.error("Failed to load countries");
    }
  }, []);

  const fetchRequirements = useCallback(async (cid: string) => {
    if (!cid) return;
    try {
      setLoadingReqs(true);
      const { requirements } =
        await studentDocumentRequirementsApi.listByCountry(cid);
      setRequirements(requirements || []);
      // init docs map for requirements
      const init: Record<string, LocalDoc> = {};
      (requirements || []).forEach((r) => (init[r.id] = {}));
      setDocs(init);
    } catch {
      toast.error("Failed to load requirements");
    } finally {
      setLoadingReqs(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      setLoadingStatus(true);
      const res = await studentVerificationRequestsApi.list({
        page: 1,
        limit: 10,
      });
      setStatusItems(res.requests || []);
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
    fetchStatus();
  }, [fetchCountries, fetchStatus]);

  useEffect(() => {
    if (countryId) fetchRequirements(countryId);
  }, [countryId, fetchRequirements]);

  const requiredMissing = useMemo(() => {
    const missing: string[] = [];
    requirements.forEach((r) => {
      if (r.required) {
        const d = docs[r.id];
        if (!d || !(d.file || d.uploaded)) missing.push(r.id);
      }
    });
    return missing;
  }, [requirements, docs]);

  const uploadedCount = useMemo(() => {
    return requirements.reduce((acc, r) => {
      const d = docs[r.id];
      return acc + (d && (d.uploaded || !!d.fileUrl) ? 1 : 0);
    }, 0);
  }, [requirements, docs]);

  const missingTitles = useMemo(() => {
    if (requiredMissing.length === 0) return [] as string[];
    const set = new Set(requiredMissing);
    return requirements.filter((r) => set.has(r.id)).map((r) => r.title);
  }, [requiredMissing, requirements]);

  function onFileChange(requirementId: string, file?: File) {
    setDocs((prev) => ({
      ...prev,
      [requirementId]: {
        ...prev[requirementId],
        file,
        uploaded: false,
        error: undefined,
        previewUrl:
          file && file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null,
      },
    }));
  }

  async function uploadSingle(requirement: Requirement) {
    const entry = docs[requirement.id];
    if (!entry?.file) return;

    // validate
    const ext = entry.file.name.split(".").pop()?.toLowerCase();
    if (!ext || !requirement.allowedTypes.includes(ext)) {
      setDocs((p) => ({
        ...p,
        [requirement.id]: {
          ...p[requirement.id],
          error: `File type .${ext} not allowed`,
        },
      }));
      return;
    }
    if (entry.file.size > requirement.maxFileSize) {
      setDocs((p) => ({
        ...p,
        [requirement.id]: {
          ...p[requirement.id],
          error: `File too large. Max ${(
            requirement.maxFileSize /
            (1024 * 1024)
          ).toFixed(1)} MB`,
        },
      }));
      return;
    }

    try {
      setDocs((p) => ({
        ...p,
        [requirement.id]: {
          ...p[requirement.id],
          uploading: true,
          error: null,
        },
      }));
      const res = await apiClient.images.upload(entry.file);
      if (!res.url || !res.fileName) throw new Error("Upload failed");
      setDocs((p) => ({
        ...p,
        [requirement.id]: {
          ...p[requirement.id],
          uploading: false,
          uploaded: true,
          fileUrl: res.url,
          originalName: entry.file!.name,
          fileName: res.fileName,
          fileSize: entry.file!.size,
          mimeType: entry.file!.type,
        },
      }));
    } catch {
      setDocs((p) => ({
        ...p,
        [requirement.id]: {
          ...p[requirement.id],
          uploading: false,
          error: "Upload failed",
        },
      }));
    }
  }

  async function handleSubmit() {
    if (!student) return;
    if (!countryId) {
      toast.error("Please select a country");
      return;
    }
    if (requiredMissing.length > 0) {
      toast.error("Please provide all required documents");
      return;
    }

    try {
      setSubmitting(true);
      for (const r of requirements) {
        const d = docs[r.id];
        if (d?.file && !d.uploaded) {
          await uploadSingle(r);
        }
      }

      const payload: CreateDocumentVerificationRequestInput = {
        countryId,
        documents: requirements
          .map((r) => ({ r, d: docs[r.id] }))
          .filter(({ d }) =>
            Boolean(
              d &&
                d.fileUrl &&
                d.originalName &&
                d.fileName &&
                typeof d.fileSize === "number" &&
                d.mimeType
            )
          )
          .map(({ r, d }) => ({
            requirementId: r.id,
            fileUrl: d!.fileUrl as string,
            originalName: d!.originalName as string,
            fileName: d!.fileName as string,
            fileSize: d!.fileSize as number,
            mimeType: d!.mimeType as string,
          })),
      };

      await studentVerificationRequestsApi.create(payload);
      toast.success("Verification request submitted");
      setCountryId("");
      setRequirements([]);
      setDocs({});
      fetchStatus();
    } catch {
      toast.error("Failed to submit verification request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">
          Document Verification
        </h2>
        <p className="text-muted-foreground">
          Select a country and upload required documents.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Select Country
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <Select value={countryId} onValueChange={setCountryId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loadingReqs ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : requirements.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {missingTitles.length > 0 && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm p-3">
                <div className="font-medium mb-1">
                  Missing required documents:
                </div>
                <ul className="list-disc pl-5">
                  {missingTitles.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {requirements.map((r) => {
              const d = docs[r.id] || {};
              return (
                <div key={r.id} className="border rounded-md p-3 md:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{r.title}</span>
                        <Badge variant={r.required ? "default" : "secondary"}>
                          {r.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                      {r.description && (
                        <p className="text-sm text-muted-foreground break-words">
                          {r.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Allowed: {r.allowedTypes.join(", ")} • Max{" "}
                        {(r.maxFileSize / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-[200px]">
                      <label className="inline-flex items-center justify-center px-3 py-2 rounded-md border bg-background hover:bg-accent cursor-pointer text-sm">
                        <UploadCloud className="h-4 w-4 mr-2" />
                        {d.file ? "Change file" : "Choose file"}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) =>
                            onFileChange(r.id, e.target.files?.[0])
                          }
                        />
                      </label>
                      {d.file && (
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Paperclip className="h-3 w-3" /> {d.file.name} (
                          {(d.file.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                      {d.previewUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.previewUrl}
                          alt="preview"
                          className="w-28 h-20 object-cover rounded-md border"
                        />
                      )}
                      {d.error && (
                        <p className="text-xs text-destructive">{d.error}</p>
                      )}
                      {d.uploaded && !d.error && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Uploaded
                        </span>
                      )}
                      {!d.uploaded && d.file && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => uploadSingle(r)}
                          disabled={d.uploading}
                          aria-busy={d.uploading}
                          className="cursor-pointer"
                        >
                          {d.uploading ? "Uploading..." : "Upload"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  requiredMissing.length > 0 ||
                  uploadedCount === 0
                }
                aria-busy={submitting}
                className="cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : countryId ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No active requirements for this country.
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Recent Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingStatus ? (
            <Skeleton className="h-4 w-1/3" />
          ) : statusItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No verification requests yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {statusItems.map((it) => (
                <Link
                  key={it.id}
                  href={`/student/document-verification/${it.id}`}
                  className="border rounded-md p-3 flex items-center justify-between cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {countries.find((c) => c.id === it.countryId)?.title ||
                        it.countryId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {it.createdAt
                        ? new Date(it.createdAt).toLocaleString()
                        : "-"}
                    </div>
                  </div>
                  <Badge
                    variant={
                      it.status === "COMPLETED"
                        ? "default"
                        : it.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {it.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
