"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

export default function CreateVisaDialog({
  trigger,
  onSaved,
  visaId,
}: {
  trigger?: React.ReactNode;
  onSaved?: () => void;
  visaId?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [loadingVisa, setLoadingVisa] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const isEditMode = Boolean(visaId);

  // Helper function to extract filename from image URL
  const extractFileNameFromUrl = (url: string): string | null => {
    try {
      const urlPath = new URL(url).pathname;
      const fileName = urlPath.split("/").pop();
      return fileName || null;
    } catch {
      // If it's not a full URL, assume it's already a filename
      return url.split("/").pop() || null;
    }
  };

  const fetchVisaData = useCallback(async () => {
    if (!visaId) return;

    try {
      setLoadingVisa(true);
      const response = await apiClient.admin.visas.getById(visaId);

      const visa = response;

      setTitle(visa.title || "");
      setSlug(visa.slug || "");
      setDescription(visa.description || "");
      setCurrentImageUrl(visa.imageUrl || null);
      setSlugEdited(true);
    } catch (err) {
      console.error("Failed to fetch visa data:", err);
      toast.error("Failed to load visa data");
    } finally {
      setLoadingVisa(false);
    }
  }, [visaId]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setSlug("");
      setDescription("");
      setSlugEdited(false);
      setImagePreview(null);
      setCurrentImageUrl(null);
      setLoadingVisa(false);
    } else if (open) {
      if (isEditMode && visaId) {
        fetchVisaData();
      } else {
        setTitle("");
        setSlug("");
        setDescription("");
        setSlugEdited(false);
        setImagePreview(null);
        setCurrentImageUrl(null);
      }
    }
  }, [open, isEditMode, visaId, fetchVisaData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      setLoading(true);
      let imageUrl = currentImageUrl;
      const file = (fd.get("image") as File | null) || null;
      let oldImageDeleted = false;
      if (file && file.size > 0 && file.name && file.name.trim() !== "") {
        const upRes = await apiClient.images.upload(file);
        if (upRes?.error) throw new Error(upRes.error || "Image upload failed");
        imageUrl = upRes?.url || null;

        if (isEditMode && currentImageUrl && currentImageUrl !== imageUrl) {
          const oldFileName = extractFileNameFromUrl(currentImageUrl);
          if (oldFileName) {
            try {
              const deleteRes = await apiClient.images.delete(oldFileName);
              if (deleteRes.success) {
                oldImageDeleted = true;
              } else {
                console.warn("Failed to delete old image:", deleteRes.error);
              }
            } catch (deleteErr) {
              console.warn("Error deleting old image:", deleteErr);
            }
          }
        }
      }

      const payload = {
        title: String(fd.get("title") || ""),
        description: String(fd.get("description") || ""),
        slug: String(fd.get("slug") || ""),
        imageUrl,
      };

      if (isEditMode && visaId) {
        await apiClient.admin.visas.update(visaId, payload);
        const successMessage = oldImageDeleted
          ? "Visa updated successfully (old image removed)"
          : "Visa updated successfully";
        toast.success(successMessage);
      } else {
        await apiClient.admin.visas.create(payload);
        toast.success("Visa created successfully");
      }

      form.reset();
      setImagePreview(null);
      setOpen(false);
      setTitle("");
      setSlug("");
      setDescription("");
      setCurrentImageUrl(null);
      setSlugEdited(false);
      onSaved?.();
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        toast.error(
          String(
            err.response?.data?.error ||
              `Failed to ${isEditMode ? "update" : "create"} visa`
          )
        );
      } else {
        toast.error(
          String(
            (err as Error)?.message ||
              `Failed to ${isEditMode ? "update" : "create"} visa`
          )
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setImagePreview(URL.createObjectURL(f));
    } else {
      setImagePreview(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Visa" : "Create Visa"}</DialogTitle>
        </DialogHeader>
        {loadingVisa ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading visa data...
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
                  const val = e.target.value;
                  setTitle(val);
                  if (!slugEdited) {
                    setSlug(slugify(val));
                  }
                }}
                onBlur={() => {
                  if (!slugEdited && title && !slug) setSlug(slugify(title));
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Slug</label>
              <Input
                name="slug"
                className="border p-2 w-full"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
                onBlur={() => setSlug((s) => slugify(s))}
                required
                placeholder="study-in-canada"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write the visa description..."
                required
                className="border p-2 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Image</label>
              <Input
                type="file"
                name="image"
                accept="image/*"
                onChange={onFileChange}
                className="mt-1"
              />
              {!imagePreview && currentImageUrl && isEditMode && (
                <div className="mt-2 inline-flex items-center gap-3 rounded-md border p-2 bg-muted/20">
                  <Image
                    src={currentImageUrl}
                    alt="current image"
                    className="max-h-40 rounded"
                    width={200}
                    height={200}
                  />
                  <span className="text-sm text-muted-foreground">
                    Current image
                  </span>
                </div>
              )}
              {imagePreview && (
                <div className="mt-2 flex flex-col items-center gap-3 rounded-md border p-2 bg-muted/20">
                  <Image
                    src={imagePreview}
                    alt="preview"
                    className="max-h-40 rounded"
                    width={200}
                    height={200}
                    unoptimized
                  />
                </div>
              )}
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
                disabled={loading || loadingVisa}
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
