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
import apiClient, { type UserDetails } from "@/lib/api";
import React, { useEffect, useState } from "react";
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

  return (
    <div className="p-4 md:p-10 min-h-screen">
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
            placeholder="Search by name, nationality, citizenship, occupation"
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
                <TableHead className="font-bold">Gender</TableHead>
                <TableHead className="font-bold">DOB</TableHead>
                <TableHead className="font-bold">POB</TableHead>
                <TableHead className="font-bold">Nationality</TableHead>
                <TableHead className="font-bold">Citizenship</TableHead>
                <TableHead className="font-bold">Occupation</TableHead>
                <TableHead className="font-bold">Appointment</TableHead>
                <TableHead className="font-bold">Country Preference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>
                    {new Date(user.dob).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{user.pob}</TableCell>
                  <TableCell>{user.nationality}</TableCell>
                  <TableCell>{user.citizenship}</TableCell>
                  <TableCell>{user.occupation}</TableCell>
                  <TableCell>{user.appointment ? "Yes" : "No"}</TableCell>
                  <TableCell>{user.countryPreference}</TableCell>
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
