"use client";

import React, { useEffect, useState } from "react";
import apiClient, { WhyChooseUs } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useRouter } from "next/navigation";
import CreateWhyChooseUsDialog from "@/components/admin/CreateWhyChooseUsDialog";

export default function Page() {
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchWhyChooseUs = async () => {
    const res = await apiClient.admin.whyChooseUs.getAll();
    setWhyChooseUs(res);
  };

  useEffect(() => {
    try {
      setLoading(true);
      fetchWhyChooseUs();
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await apiClient.admin.whyChooseUs.remove(id);
      if (res.success) {
        fetchWhyChooseUs();
        toast.success("Why Choose Us deleted successfully");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || "Failed to delete Why Choose Us"
      );
    }
  };

  return (
    <>
      <header className="px-5 py-2 border-b flex items-center justify-between">
        <h1 className="text-2xl font-semibold ml-7">Why Choose Us</h1>
        <CreateWhyChooseUsDialog
          trigger={
            <Button className="font-bold shadow-lg cursor-pointer text-md">
              Add New
            </Button>
          }
          onSaved={() => {
            fetchWhyChooseUs();
          }}
        />
      </header>

      <section className="px-5 py-4 space-y-4">
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
          {!loading && !error && whyChooseUs.length === 0 && (
            <div className="text-sm text-muted-foreground flex items-center justify-center h-[calc(100vh-200px)]">
              No Why Choose Us Created Yet.
            </div>
          )}
          {!loading && !error && whyChooseUs.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead className="max-w-[250px]">Title</TableHead>
                  <TableHead className="max-w-[250px]">Link</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {whyChooseUs.map((whyChoose, i) => (
                  <TableRow key={whyChoose.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="truncate">
                      {whyChoose.title}
                    </TableCell>
                    <TableCell className="truncate">{whyChoose.link}</TableCell>
                    <TableCell className="flex items-center justify-center gap-2">
                      <IconEye
                        onClick={() =>
                          router.push(
                            `/admin/dashboard/why-choose-us/${whyChoose.id}`
                          )
                        }
                        className="cursor-pointer stroke-primary"
                      />
                      <CreateWhyChooseUsDialog
                        whyChooseUsId={whyChoose.id}
                        trigger={
                          <IconEdit className="cursor-pointer stroke-primary" />
                        }
                        onSaved={() => {
                          fetchWhyChooseUs();
                        }}
                      />
                      <ConfirmDialog
                        title="Delete Why Choose Us"
                        description="Are you sure you want to delete this Why Choose Us?"
                        trigger={
                          <IconTrash className="cursor-pointer stroke-primary" />
                        }
                        confirmText="Delete"
                        onConfirm={() => handleDelete(whyChoose.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </>
  );
}
