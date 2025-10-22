"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import Link from "next/link";
import { useAssociateAuth } from "@/hooks/useAssociateAuth";
import { userCountriesApi, associateVerificationRequestsApi } from "@/lib/api";
import type { DocumentVerificationRequest, VerificationStatus } from "@/types";
import { toast } from "sonner";
import { Filter, Globe } from "lucide-react";

export default function AssociateVerificationListPage() {
  const { associate } = useAssociateAuth();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<
    (DocumentVerificationRequest & {
      student?: { id: string; name?: string };
      country?: { id: string; title?: string };
    })[]
  >([]);
  const [countries, setCountries] = useState<{ id: string; title: string }[]>(
    []
  );

  const [status, setStatus] = useState<string>("ALL");
  const [countryId, setCountryId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await userCountriesApi.list();
      setCountries(res.countries || []);
    } catch {
      toast.error("Failed to load countries");
    }
  }, []);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const allowed: VerificationStatus[] = [
        "PENDING",
        "IN_REVIEW",
        "COMPLETED",
        "REJECTED",
      ];
      const statusParam = (allowed as string[]).includes(status)
        ? (status as VerificationStatus)
        : undefined;
      const res = await associateVerificationRequestsApi.list({
        page,
        limit: 10,
        status: statusParam,
        countryId: countryId || undefined,
        assignedToId:
          associate?.role === "DIRECTOR" ? undefined : associate?.id,
      });
      setItems(res.requests || []);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  }, [page, status, countryId, associate?.id, associate?.role]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const header = useMemo(
    () => (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Verification Requests
          </h2>
          <p className="text-muted-foreground">
            Review and manage student document verification requests
          </p>
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {header}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Select
            value={status || "ALL"}
            onValueChange={(v) => setStatus(v === "ALL" ? "" : v)}
          >
            <SelectTrigger className="pl-8 w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_REVIEW">In Review</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Select
            value={countryId || "ALL"}
            onValueChange={(v) => setCountryId(v === "ALL" ? "" : v)}
          >
            <SelectTrigger className="pl-8 w-full">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No requests found
            </CardContent>
          </Card>
        ) : (
          items.map((it) => (
            <Card key={it.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-lg break-words">
                        {it.student?.name || it.studentId}
                      </h3>
                      <Badge
                        variant={
                          it.status === "COMPLETED"
                            ? "default"
                            : it.status === "REJECTED"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {it.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {it.documents?.length || 0} document(s) •{" "}
                      {it.country?.title ||
                        countries.find((c) => c.id === it.countryId)?.title ||
                        it.countryId}
                    </p>

                    <div className="text-xs text-muted-foreground">
                      Created:{" "}
                      {it.createdAt
                        ? new Date(it.createdAt).toLocaleString()
                        : "-"}
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col lg:items-end gap-2">
                    <Link href={`/associate/document-verification/${it.id}`}>
                      <Button size="sm" className="cursor-pointer">
                        Open
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-busy={loading}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-busy={loading}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
