"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import CreateCollegeDialog from "@/components/admin/CreateCollegeDialog";
import apiClient from "@/lib/api";
import { College, Country, ListCollegesResponse } from "@/types";
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
  const [colleges, setColleges] = useState<(College & { country?: Country })[]>(
    []
  );
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

  const fetchColleges = useCallback(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data: ListCollegesResponse = await apiClient.admin.colleges.list({
          page,
          limit: 10,
          search,
          signal: controller.signal,
        });
        if (cancelled) return;
        setColleges(data.colleges);
        setTotalPages(Math.max(1, data.totalPages));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        if (cancelled) return;
        setError(err?.response?.data?.error || "Failed to load colleges");
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
    const cleanup = fetchColleges();
    return cleanup;
  }, [fetchColleges]);

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
      const college = await apiClient.admin.colleges.getBySlug(slug);

      if (college.imageUrl) {
        const fileName = college.imageUrl.split("/").pop();
        if (fileName) {
          try {
            await apiClient.images.delete(fileName);
          } catch (imageErr) {
            console.warn("Failed to delete image:", imageErr);
          }
        }
      }

      const res = await apiClient.admin.colleges.remove(slug);
      if (res.success) {
        fetchColleges();
        toast.success("College deleted successfully");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete college");
    }
  };

  return (
    <>
      <header className="px-5 py-2 border-b flex items-center justify-between">
        <h1 className="text-2xl font-semibold ml-7">Colleges</h1>
        <CreateCollegeDialog
          trigger={
            <Button className="font-bold shadow-lg cursor-pointer text-md">
              Add College
            </Button>
          }
          onSaved={() => {
            fetchColleges();
          }}
        />
      </header>

      <section className="px-5 py-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or slug..."
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
          {!loading && !error && colleges.length === 0 && (
            <div className="text-sm text-muted-foreground flex items-center justify-center h-[calc(100vh-200px)]">
              No College Created Yet.
            </div>
          )}
          {!loading && !error && colleges.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="max-w-[250px]">Name</TableHead>
                  <TableHead className="max-w-[250px]">Slug</TableHead>
                  <TableHead className="max-w-[250px]">Country</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colleges.map((college, i) => (
                  <TableRow key={college.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Image
                        src={college.imageUrl || ""}
                        alt={college.name}
                        width={30}
                        height={30}
                        className="rounded-xl"
                      />
                    </TableCell>
                    <TableCell className="truncate">{college.name}</TableCell>
                    <TableCell className="truncate">{college.slug}</TableCell>
                    <TableCell className="truncate">
                      {college?.country?.title}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <IconEye
                        onClick={() =>
                          router.push(
                            `/admin/dashboard/colleges/${college.slug}`
                          )
                        }
                        className="cursor-pointer stroke-primary"
                      />
                      <CreateCollegeDialog
                        collegeSlug={college.slug}
                        trigger={
                          <IconEdit className="cursor-pointer stroke-primary" />
                        }
                        onSaved={() => {
                          fetchColleges();
                        }}
                      />
                      <ConfirmDialog
                        title="Delete College"
                        description="Are you sure you want to delete this college?"
                        trigger={
                          <IconTrash className="cursor-pointer stroke-primary" />
                        }
                        confirmText="Delete"
                        onConfirm={() => handleDelete(college.slug)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {!loading && !error && colleges.length > 0 && (
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
