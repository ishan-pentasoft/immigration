"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import CreateVisaDialog from "@/components/admin/CreateVisaDialog";
import apiClient from "@/lib/api";
import { ListVisasResponse, Visa } from "@/types";
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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useRouter } from "next/navigation";

export default function Page() {
  const [visas, setVisas] = useState<Visa[]>([]);
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

  const fetchVisas = useCallback(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data: ListVisasResponse = await apiClient.admin.visas.list({
          page,
          limit: 10,
          search,
          signal: controller.signal,
        });
        if (cancelled) return;
        setVisas(data.visas);
        setTotalPages(Math.max(1, data.totalPages));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        if (cancelled) return;
        setError(err?.response?.data?.error || "Failed to load visas");
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
    const cleanup = fetchVisas();
    return cleanup;
  }, [fetchVisas]);

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

  const handleDelete = async (slug: string) => {
    try {
      const visa = await apiClient.admin.visas.getBySlug(slug);

      if (visa.imageUrl) {
        const fileName = visa.imageUrl.split("/").pop();
        if (fileName) {
          try {
            await apiClient.images.delete(fileName);
          } catch (imageErr) {
            console.warn("Failed to delete image:", imageErr);
          }
        }
      }

      // Delete the visa record
      const res = await apiClient.admin.visas.remove(slug);
      if (res.success) {
        fetchVisas();
        toast.success("Visa deleted successfully");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete visa");
    }
  };

  return (
    <>
      <header className="px-5 py-2 border-b flex items-center justify-between">
        <h1 className="text-2xl font-semibold ml-7">Visas</h1>
        <CreateVisaDialog
          trigger={
            <Button className="font-bold shadow-lg cursor-pointer text-md">
              Add Visa
            </Button>
          }
          onSaved={() => {
            fetchVisas();
          }}
        />
      </header>

      <section className="px-5 py-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title or slug..."
            className="max-w-md"
          />
        </div>

        {/* Placeholder list view until table is added */}
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
          {!loading && !error && visas.length === 0 && (
            <div className="text-sm text-muted-foreground flex items-center justify-center h-[calc(100vh-200px)]">
              No Visa Created Yet.
            </div>
          )}
          {!loading && !error && visas.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="max-w-[250px]">Title</TableHead>
                  <TableHead className="max-w-[250px]">Slug</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visas.map((visa, i) => (
                  <TableRow key={visa.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Image
                        src={visa.imageUrl || ""}
                        alt={visa.title}
                        width={50}
                        height={50}
                      />
                    </TableCell>
                    <TableCell className="truncate">{visa.title}</TableCell>
                    <TableCell className="truncate">{visa.slug}</TableCell>
                    <TableCell className="flex items-center justify-center gap-2">
                      <IconEye
                        onClick={() =>
                          router.push(`/admin/dashboard/visas/${visa.slug}`)
                        }
                        className="cursor-pointer stroke-primary"
                      />
                      <CreateVisaDialog
                        visaId={visa.slug}
                        trigger={
                          <IconEdit className="cursor-pointer stroke-primary" />
                        }
                        onSaved={() => {
                          fetchVisas();
                        }}
                      />
                      <ConfirmDialog
                        title="Delete Visa"
                        description="Are you sure you want to delete this visa?"
                        trigger={
                          <IconTrash className="cursor-pointer stroke-primary" />
                        }
                        confirmText="Delete"
                        onConfirm={() => handleDelete(visa.slug)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && visas.length > 0 && (
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
