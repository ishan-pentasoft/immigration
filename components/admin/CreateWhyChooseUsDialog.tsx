"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AxiosError } from "axios";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function CreateWhyChooseUsDialog({
  trigger,
  onSaved,
  whyChooseUsId,
}: {
  trigger?: React.ReactNode;
  onSaved?: () => void;
  whyChooseUsId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [loadingWhyChooseUs, setLoadingWhyChooseUs] = useState(false);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  const isEditMode = Boolean(whyChooseUsId);

  const fetchWhyChooseUsData = useCallback(async () => {
    if (!whyChooseUsId) return;

    try {
      setLoadingWhyChooseUs(true);
      const response = await apiClient.admin.whyChooseUs.getById(whyChooseUsId);

      const whyChooseUs = response;

      setTitle(whyChooseUs.title || "");
      setDescription(whyChooseUs.description || "");
      setLink(whyChooseUs.link || "");
    } catch (err) {
      console.error("Failed to fetch visa data:", err);
      toast.error("Failed to load visa data");
    } finally {
      setLoadingWhyChooseUs(false);
    }
  }, [whyChooseUsId]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setLink("");
    } else if (open) {
      if (isEditMode && whyChooseUsId) {
        fetchWhyChooseUsData();
      } else {
        setTitle("");
        setDescription("");
        setLink("");
      }
    }
  }, [open, isEditMode, whyChooseUsId, fetchWhyChooseUsData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      setLoading(true);
      const payload = {
        title: String(fd.get("title") || ""),
        description: description,
        link: String(fd.get("link") || ""),
      };

      if (isEditMode && whyChooseUsId) {
        await apiClient.admin.whyChooseUs.update(whyChooseUsId, payload);
        toast.success("Why Choose Us updated successfully");
      } else {
        await apiClient.admin.whyChooseUs.create(payload);
        toast.success("Why Choose Us created successfully");
      }

      form.reset();
      setOpen(false);
      setTitle("");
      setDescription("");
      setLink("");
      onSaved?.();
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        toast.error(
          String(
            err.response?.data?.error ||
              `Failed to ${isEditMode ? "update" : "create"} why choose us`
          )
        );
      } else {
        toast.error(
          String(
            (err as Error)?.message ||
              `Failed to ${isEditMode ? "update" : "create"} why choose us`
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
          <DialogTitle>
            {isEditMode ? "Edit Why Choose Us" : "Create Why Choose Us"}
          </DialogTitle>
        </DialogHeader>
        {loadingWhyChooseUs ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading why choose us data...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <Input
                name="title"
                className="border p-2 w-full"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Link</label>
              <Input
                name="link"
                className="border p-2 w-full"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                className="border p-2 w-full"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
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
