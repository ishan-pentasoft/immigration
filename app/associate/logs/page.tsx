"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import apiClient, {
  AssociateLoginLog,
  ListAssociateLogsResponse,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAssociateAuth } from "@/hooks/useAssociateAuth";

export default function Page() {
  const { associate, isLoading } = useAssociateAuth();
  const [logs, setLogs] = useState<AssociateLoginLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchLogs = useCallback(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data: ListAssociateLogsResponse =
          await apiClient.associate.logs.list({
            page,
            limit: 10,
            search,
            signal: controller.signal,
          });
        if (cancelled) return;
        setLogs(data.logs);
        setTotalPages(Math.max(1, data.totalPages));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        if (cancelled) return;
        setError(err?.response?.data?.error || "Failed to load logs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [page, search]);

  useEffect(() => {
    if (!associate || associate.role !== "DIRECTOR") return;
    const cleanup = fetchLogs();
    return cleanup;
  }, [fetchLogs, associate]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxToShow = 5;
    let start = Math.max(1, page - Math.floor(maxToShow / 2));
    const end = Math.min(totalPages, start + maxToShow - 1);
    start = Math.max(1, Math.min(start, Math.max(1, end - maxToShow + 1)));
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  if (isLoading) {
    return (
      <div className=" flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-purple-500"></div>
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-red-500 ml-3"></div>
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-blue-500 ml-3"></div>
      </div>
    );
  }

  if (!associate || associate.role !== "DIRECTOR") {
    return (
      <div className="p-4 md:p-10 min-h-screen">
        <div className="h-full w-full bg-muted rounded-lg p-6 border border-border shadow-2xl">
          <h1 className="text-primary font-bold text-2xl tracking-wider">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only directors can view login logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 min-h-screen">
      <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-primary font-bold text-2xl tracking-wider">
            Associate Login Logs
          </h1>
        </div>

        <div className="mt-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by username, IP, user agent, message..."
            className="max-w-md"
          />
        </div>

        <div className="border border-border shadow-2xl bg-background mt-5 rounded-xl overflow-hidden">
          {loading && (
            <div className=" flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-purple-500"></div>
              <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-red-500 ml-3"></div>
              <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-blue-500 ml-3"></div>
            </div>
          )}
          {error && !loading && (
            <div className="text-sm flex items-center justify-center h-[calc(100vh-200px)] text-red-600">
              {error}
            </div>
          )}
          {!loading && !error && logs.length === 0 && (
            <div className="text-sm text-muted-foreground flex items-center justify-center h-[calc(100vh-200px)]">
              No logs found.
            </div>
          )}
          {!loading && !error && logs.length > 0 && (
            <Table>
              <TableHeader className="bg-accent">
                <TableRow>
                  <TableHead className="font-bold">#</TableHead>
                  <TableHead className="font-bold">Time</TableHead>
                  <TableHead className="font-bold">Username</TableHead>
                  <TableHead className="font-bold">Email</TableHead>
                  <TableHead className="font-bold">IP</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, i) => (
                  <TableRow key={log.id}>
                    <TableCell>{(page - 1) * 10 + (i + 1)}</TableCell>
                    <TableCell>
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : ""}
                    </TableCell>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>{log.associate?.email || "-"}</TableCell>
                    <TableCell className="truncate max-w-[160px]">
                      {log.ip || "-"}
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <Badge variant="default">Success</Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!loading && !error && logs.length > 0 && (
          <Pagination className="mt-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(page - 1);
                  }}
                  aria-disabled={page <= 1}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {pageNumbers.map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={n === page}
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(n);
                    }}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(page + 1);
                  }}
                  aria-disabled={page >= totalPages}
                  className={
                    page >= totalPages
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
