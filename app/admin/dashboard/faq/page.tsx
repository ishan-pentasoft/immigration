"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { Faq } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import CreateFaqDialog from "@/components/admin/CreateFaqDialog";

export default function Page() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.admin.faq.getAll();
      setFaqs(res);
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await apiClient.admin.faq.remove(id);
      if (res.success) {
        fetchFaqs();
        toast.success("Faq deleted successfully");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete Faq");
    }
  };

  return (
    <>
      <header className="px-5 py-2 border-b flex items-center justify-between">
        <h1 className="text-2xl font-semibold ml-7">FAQ</h1>
        <CreateFaqDialog
          trigger={
            <Button className="font-bold shadow-lg cursor-pointer text-md">
              Add New
            </Button>
          }
          onSaved={() => {
            fetchFaqs();
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
          {!loading && !error && faqs.length === 0 && (
            <div className="text-sm text-muted-foreground flex items-center justify-center h-[calc(100vh-200px)]">
              No Faq Created Yet.
            </div>
          )}
          {!loading && !error && faqs.length > 0 && (
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead className="w-1/3">Question</TableHead>
                  <TableHead className="w-1/3">Answer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq, i) => (
                  <TableRow key={faq.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <div className="max-w-[400px] truncate">
                        {faq.question}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[400px] truncate">{faq.answer}</div>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <CreateFaqDialog
                        faqId={faq.id}
                        trigger={
                          <IconEdit className="cursor-pointer stroke-primary" />
                        }
                        onSaved={() => {
                          fetchFaqs();
                        }}
                      />
                      <ConfirmDialog
                        title="Delete Faq"
                        description="Are you sure you want to delete this Faq?"
                        trigger={
                          <IconTrash className="cursor-pointer stroke-primary" />
                        }
                        confirmText="Delete"
                        onConfirm={() => handleDelete(faq.id)}
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
