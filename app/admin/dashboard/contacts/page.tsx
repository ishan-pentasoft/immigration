"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import apiClient, { Contact, ListContactsResponse } from "@/lib/api";
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
import { IconEye, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useRouter } from "next/navigation";

export default function Page() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchContacts = useCallback(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data: ListContactsResponse = await apiClient.admin.contacts.list({
          page,
          limit: 10,
          search,
          signal: controller.signal,
        });
        if (cancelled) return;
        setContacts(data.contacts);
        setTotalPages(Math.max(1, data.totalPages));
      } catch (err: unknown) {
        const e = err as {
          name?: string;
          response?: { data?: { error?: string } };
        };
        if (e?.name === "CanceledError") return;
        if (cancelled) return;
        setError(e?.response?.data?.error || "Failed to load contacts");
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
    const cleanup = fetchContacts();
    return cleanup;
  }, [fetchContacts]);

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

  const handleDelete = async (id: string) => {
    try {
      const res = await apiClient.admin.contacts.remove(id);
      if (res?.success ?? true) {
        fetchContacts();
        toast.success("Contact deleted successfully");
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error || "Failed to delete contact");
    }
  };

  return (
    <>
      <header className="px-5 py-2 border-b flex items-center justify-between">
        <h1 className="text-2xl font-semibold ml-7">Contacts</h1>
      </header>

      <section className="px-5 py-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="max-w-md"
          />
        </div>

        <div className="border rounded-md divide-y">
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
          {!loading && !error && contacts.length === 0 && (
            <div className="text-sm text-muted-foreground flex items-center justify-center h-[calc(100vh-200px)]">
              No Contacts yet.
            </div>
          )}
          {!loading && !error && contacts.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead className="max-w-[220px]">Name</TableHead>
                  <TableHead className="max-w-[220px]">Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Visa Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c, i) => (
                  <TableRow key={c.id}>
                    <TableCell>{i + 1 + (page - 1) * 10}</TableCell>
                    <TableCell className="truncate">{c.name}</TableCell>
                    <TableCell className="truncate">{c.email}</TableCell>
                    <TableCell className="truncate">{c.phone}</TableCell>
                    <TableCell className="truncate">{c.visaType}</TableCell>
                    <TableCell>
                      {new Date(c.createdAt || "").toLocaleString()}
                    </TableCell>
                    <TableCell className="flex items-center justify-center gap-2">
                      <IconEye
                        onClick={() =>
                          router.push(`/admin/dashboard/contacts/${c.id}`)
                        }
                        className="cursor-pointer stroke-primary"
                      />
                      <ConfirmDialog
                        title="Delete Contact"
                        description="Are you sure you want to delete this contact?"
                        trigger={
                          <IconTrash className="cursor-pointer stroke-primary" />
                        }
                        confirmText="Delete"
                        onConfirm={() => handleDelete(c.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!loading && !error && contacts.length > 0 && (
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
      </section>
    </>
  );
}
