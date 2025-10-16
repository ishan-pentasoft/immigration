"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Link from "next/link";
import { View, Trash2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import type { Student, ListStudentsResponse } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolTip } from "@/components/ToolTip";

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        const res: ListStudentsResponse =
          await apiClient.associate.students.list({
            page,
            limit: pageSize,
            search,
            signal: controller.signal,
          });
        setStudents(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((e as any)?.name !== "CanceledError") {
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [page, pageSize, search, refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.associate.students.remove(id);
      toast.success("Student deleted");
      setRefreshTrigger((t) => t + 1);
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete student");
    }
  };

  return (
    <div className="p-4">
      <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
        <h1 className="text-primary font-bold text-2xl tracking-wider">
          Students
        </h1>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <p className="mt-3 font-medium text-sm text-muted-foreground">
          Total Students - {total}
        </p>

        {loading ? (
          <div>
            <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="border border-border shadow-2xl bg-background mt-5 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-accent">
                  <TableRow>
                    <TableHead className="font-bold">#</TableHead>
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Phone</TableHead>
                    <TableHead className="font-bold">Associate</TableHead>
                    <TableHead className="font-bold">Approved</TableHead>
                    <TableHead className="font-bold">At</TableHead>
                    <TableHead className="font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s, i) => (
                    <TableRow key={s.id}>
                      <TableCell>{(page - 1) * pageSize + i + 1}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell>{s.associate?.username}</TableCell>
                      <TableCell>{s.approvedBy?.username}</TableCell>
                      <TableCell>
                        {s.approvedAt
                          ? new Date(s.approvedAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <ToolTip content="View details">
                          <Link href={`/associate/students/${s.id}`}>
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="cursor-pointer stroke-2"
                            >
                              <View />
                            </Button>
                          </Link>
                        </ToolTip>
                        <ConfirmDialog
                          title="Delete Student"
                          description="Are you sure you want to delete this student?"
                          trigger={
                            <ToolTip content="Delete">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </ToolTip>
                          }
                          confirmText="Delete"
                          onConfirm={() => handleDelete(s.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Rows per page:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-24 cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10" className="cursor-pointer">
                      10
                    </SelectItem>
                    <SelectItem value="20" className="cursor-pointer">
                      20
                    </SelectItem>
                    <SelectItem value="50" className="cursor-pointer">
                      50
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                  {page} of {totalPages}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
