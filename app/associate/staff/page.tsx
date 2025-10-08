"use client";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiClient from "@/lib/api";
import { Associate } from "@/types";
import { Edit2, Trash, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const [staff, setStaff] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.associate.staff.list();
        setStaff(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiClient.associate.staff.remove(id);
      const data = await apiClient.associate.staff.list();
      toast.success("Staff deleted successfully");
      setStaff(data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete staff");
    }
  };

  if (loading)
    return (
      <div className=" flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-purple-500"></div>
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-red-500 ml-3"></div>
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-blue-500 ml-3"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-10 min-h-screen">
      <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
        <h1 className="text-primary font-bold text-2xl tracking-wider">
          Staff List
        </h1>
        <div className="border border-border shadow-2xl bg-background mt-5 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-accent">
              <TableRow>
                <TableHead className="font-bold">Id</TableHead>
                <TableHead className="font-bold">UserName</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Role</TableHead>
                <TableHead className="font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((associate, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{associate.username}</TableCell>
                  <TableCell>{associate.email}</TableCell>
                  <TableCell>{associate.role}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant={"link"}>
                      <Link
                        href={`/associate/staff/edit-staff/${associate.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant={"link"}
                          className="cursor-pointer p-0 h-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      confirmText="Delete"
                      title="Delete Staff"
                      description="Are you sure you want to delete this staff?"
                      onConfirm={() => handleDelete(associate.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Page;
