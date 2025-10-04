"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialogSmall";
import { toast } from "sonner";

export default function CreateFaqDialog({
  trigger,
  onSaved,
  faqId,
}: {
  trigger?: React.ReactNode;
  onSaved?: () => void;
  faqId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [loadingFaq, setLoadingFaq] = useState(false);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const isEditMode = Boolean(faqId);

  const fetchFaqData = useCallback(async () => {
    if (!faqId) return;

    try {
      setLoadingFaq(true);
      const response = await apiClient.admin.faq.getById(faqId);

      const faq = response;

      setQuestion(faq.question || "");
      setAnswer(faq.answer || "");
    } catch (err) {
      console.error("Failed to fetch faq data:", err);
      toast.error("Failed to load faq data");
    } finally {
      setLoadingFaq(false);
    }
  }, [faqId]);

  useEffect(() => {
    if (!open) {
      setQuestion("");
      setAnswer("");
    } else if (open) {
      if (isEditMode && faqId) {
        fetchFaqData();
      } else {
        setQuestion("");
        setAnswer("");
      }
    }
  }, [open, isEditMode, faqId, fetchFaqData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      setLoading(true);
      const payload = {
        question: String(fd.get("question") || ""),
        answer: String(fd.get("answer") || ""),
      };

      if (isEditMode && faqId) {
        await apiClient.admin.faq.update(faqId, payload);
        toast.success("Faq updated successfully");
      } else {
        await apiClient.admin.faq.create(payload);
        toast.success("Faq created successfully");
      }

      form.reset();
      setOpen(false);
      setQuestion("");
      setAnswer("");
      onSaved?.();
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        toast.error(
          String(
            err.response?.data?.error ||
              `Failed to ${isEditMode ? "update" : "create"} faq`
          )
        );
      } else {
        toast.error(
          String(
            (err as Error)?.message ||
              `Failed to ${isEditMode ? "update" : "create"} faq`
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Faq" : "Create Faq"}</DialogTitle>
        </DialogHeader>
        {loadingFaq ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading why choose us data...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Question</label>
              <textarea
                name="question"
                className="border p-2 w-full"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Answer</label>
              <textarea
                name="answer"
                className="border p-2 w-full"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                }}
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={loading}
                className="cursor-pointer"
              >
                {loading
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update"
                  : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
