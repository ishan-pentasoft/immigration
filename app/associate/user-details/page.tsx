"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssociateAuth } from "@/hooks/useAssociateAuth";
import apiClient from "@/lib/api";
import type { UserDetails, UserDetailField } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialogSmall";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function Page() {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const { associate } = useAssociateAuth();
  const [staff, setStaff] = useState<Array<{ id: string; username: string }>>(
    []
  );
  const [selectedAssociateId, setSelectedAssociateId] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [fields, setFields] = useState<UserDetailField[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const fieldMap = useMemo(() => {
    const m = new Map<string, UserDetailField>();
    fields.forEach((f) => m.set(f.name, f));
    return m;
  }, [fields]);

  useEffect(() => {
    if (!associate?.id) return;
    const fetchUsers = async () => {
      const { data, total, totalPages } =
        await apiClient.userDetails.listByAssociate(associate.id, {
          page,
          limit: pageSize,
          search,
          associateId:
            associate.role?.toUpperCase() === "DIRECTOR" &&
            selectedAssociateId !== "ALL"
              ? selectedAssociateId
              : undefined,
        });
      setUsers(data);
      setTotal(total);
      setTotalPages(totalPages);
    };
    fetchUsers();
  }, [
    associate?.id,
    associate?.role,
    page,
    pageSize,
    search,
    selectedAssociateId,
    refreshTrigger,
  ]);

  useEffect(() => {
    if (!associate?.id) return;
    if (associate.role?.toUpperCase() !== "DIRECTOR") return;
    (async () => {
      try {
        const list = await apiClient.associate.staff.list();
        setStaff(list.map((s) => ({ id: s.id, username: s.username })));
      } catch {
        // ignore
      }
    })();
  }, [associate?.id, associate?.role]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.userDetailsFields.listPublic();
        if (!active) return;
        const list = Array.isArray(res.fields) ? res.fields : [];
        setFields(
          list.filter((f) => f.active).sort((a, b) => a.order - b.order)
        );
      } catch {
        // optional: dynamic fields might not exist
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.userDetails.remove(id);
      toast.success("User details deleted successfully");
      setRefreshTrigger((t) => t + 1);
    } catch {
      toast.error("Failed to delete user details");
    }
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      setApprovingId(id);
      const res = await apiClient.userDetails.approve(id);
      const pwd = res?.generatedPassword;
      toast.success(
        pwd
          ? `Student approved. Temp password for ${name}: ${pwd}`
          : `Student approved.`
      );
      setRefreshTrigger((t) => t + 1);
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message || "Failed to approve";
      toast.error(msg);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="p-4 min-h-screen">
      <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
        <h1 className="text-primary font-bold text-2xl tracking-wider">
          User Details
        </h1>
        {associate?.role?.toUpperCase() === "DIRECTOR" && (
          <div className="mt-3 flex justify-end">
            <Link href="/associate/user-details/fields" className="inline-flex">
              <Button type="button" className="cursor-pointer">
                Manage Fields
              </Button>
            </Link>
          </div>
        )}
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          {associate?.role?.toUpperCase() === "DIRECTOR" && (
            <Select
              value={selectedAssociateId}
              onValueChange={(v) => setSelectedAssociateId(v)}
            >
              <SelectTrigger className="w-full md:w-64 cursor-pointer">
                <SelectValue placeholder="Filter by associate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="cursor-pointer">
                  All Associates
                </SelectItem>
                {staff.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={s.id}
                    className="cursor-pointer"
                  >
                    {s.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input
            placeholder="Search by name, email, phone, nationality, citizenship"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <p className="mt-3 font-medium text-sm text-muted-foreground">
          Total Users - {total}
        </p>

        <div className="border border-border shadow-2xl bg-background mt-5 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-accent">
              <TableRow>
                <TableHead className="font-bold">Id</TableHead>
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Phone</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    {user.approved ? (
                      <div className="text-green-600 text-sm font-medium">
                        Approved
                        {user.approvedAt
                          ? ` · ${new Date(user.approvedAt).toLocaleString()}`
                          : ""}
                      </div>
                    ) : (
                      <div className="text-amber-600 text-sm font-medium">
                        Pending
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Dialog
                      open={openId === user.id}
                      onOpenChange={(open) => setOpenId(open ? user.id : null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                        >
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Details - {user.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Gender
                              </div>
                              <div className="text-sm">{user.gender}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                DOB
                              </div>
                              <div className="text-sm">
                                {new Date(user.dob).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Email
                              </div>
                              <div className="text-sm">{user.email}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Phone
                              </div>
                              <div className="text-sm">{user.phone}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Nationality
                              </div>
                              <div className="text-sm">{user.nationality}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Citizenship
                              </div>
                              <div className="text-sm">{user.citizenship}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Country Preference
                              </div>
                              <div className="text-sm">
                                {user.countryPreference}
                              </div>
                            </div>
                          </div>
                          <div className="pt-2">
                            <div className="font-semibold mb-2">
                              Additional Information
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {fields.map((f) => {
                                const key = f.name;
                                const extra =
                                  (
                                    user as unknown as {
                                      extra?: Record<string, unknown>;
                                    }
                                  ).extra || {};
                                const value = extra[key];
                                if (
                                  value === undefined ||
                                  value === null ||
                                  value === ""
                                )
                                  return null;
                                const display = Array.isArray(value)
                                  ? value.join(", ")
                                  : String(value);
                                return (
                                  <div key={f.id}>
                                    <div className="text-xs text-muted-foreground">
                                      {f.label}
                                    </div>
                                    <div className="text-sm break-words">
                                      {display}
                                    </div>
                                  </div>
                                );
                              })}
                              {(() => {
                                const extra =
                                  (
                                    user as unknown as {
                                      extra?: Record<string, unknown>;
                                    }
                                  ).extra || {};
                                const unknowns = Object.keys(extra).filter(
                                  (k) => !fieldMap.has(k)
                                );
                                return unknowns.map((k) => (
                                  <div key={k}>
                                    <div className="text-xs text-muted-foreground">
                                      {k}
                                    </div>
                                    <div className="text-sm break-words">
                                      {(() => {
                                        const val = (
                                          extra as Record<string, unknown>
                                        )[k];
                                        return Array.isArray(val)
                                          ? val.join(", ")
                                          : String(val);
                                      })()}
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      type="button"
                      size="sm"
                      className="cursor-pointer"
                      disabled={!!user.approved || approvingId === user.id}
                      onClick={() => handleApprove(user.id, user.name)}
                    >
                      {approvingId === user.id
                        ? "Approving..."
                        : user.approved
                        ? "Approved"
                        : "Approve"}
                    </Button>
                    <ConfirmDialog
                      title="Delete User Details"
                      description="Are you sure you want to delete this user details?"
                      trigger={
                        <Button
                          size="sm"
                          variant="destructive"
                          className="cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      confirmText="Delete"
                      onConfirm={() => handleDelete(user.id)}
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
              onValueChange={(v) => setPageSize(Number(v))}
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
      </div>
    </div>
  );
}
