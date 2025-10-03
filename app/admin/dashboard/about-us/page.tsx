"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AxiosError } from "axios";
import apiClient, { AboutUs } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { toast } from "sonner";

export default function AdminAboutUsPage() {
  const [about, setAbout] = useState<AboutUs | null>(null);
  const [description, setDescription] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Helper: extract file name from URL
  const extractFileNameFromUrl = (url: string): string | null => {
    try {
      const urlPath = new URL(url).pathname;
      const fileName = urlPath.split("/").pop();
      return fileName || null;
    } catch {
      return url.split("/").pop() || null;
    }
  };

  const loadAbout = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const res = await apiClient.admin.aboutUs.get();
      // res may be undefined/null if not created
      if (res) {
        setAbout(res);
        setDescription(res.description || "");
        setCurrentImageUrl(res.imageUrl || null);
      } else {
        setAbout(null);
        setDescription("");
        setCurrentImageUrl(null);
      }
    } catch (err) {
      console.error("Failed to load about us", err);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    loadAbout();
  }, [loadAbout]);

  const isEditMode = useMemo(() => Boolean(about?.id), [about]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setImagePreview(URL.createObjectURL(f));
    else setImagePreview(null);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
              if (deleteRes.success) oldImageDeleted = true;
            } catch (deleteErr) {
              console.warn("Error deleting old image:", deleteErr);
            }
          }
        }
      }

      const payload = {
        description: description,
        imageUrl,
      };

      if (isEditMode && about?.id) {
        const updated = await apiClient.admin.aboutUs.update(about.id, payload);
        setAbout(updated);
        setCurrentImageUrl(updated.imageUrl || null);
        toast.success(
          oldImageDeleted
            ? "About Us updated (old image removed)"
            : "About Us updated successfully"
        );
      } else {
        const created = await apiClient.admin.aboutUs.create(payload);
        setAbout(created);
        setCurrentImageUrl(created.imageUrl || null);
        toast.success("About Us created successfully");
      }

      form.reset();
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        toast.error(String(err.response?.data?.error || "Failed to save"));
      } else {
        toast.error(String((err as Error)?.message || "Failed to save"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen p-6">
      <header className="px-5 py-2 border-b flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold ml-7">About Us</h1>
        {/* Optional reload button */}
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => loadAbout()}
          disabled={loadingInitial}
        >
          Refresh
        </Button>
      </header>

      {loadingInitial ? (
        <div className=" flex items-center justify-center h-[calc(100vh-240px)]">
          <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-purple-500"></div>
          <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-red-500 ml-3"></div>
          <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-blue-500 ml-3"></div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="max-w-3xl mx-auto space-y-5">
          <div>
            <label className="block text-sm font-medium">Description</label>
            <RichTextEditor
              placeholder="Write about your company..."
              value={description}
              onChange={(v) => setDescription(v)}
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

            {!imagePreview && currentImageUrl && (
              <div className="mt-3 inline-flex items-center gap-3 rounded-md border p-2 bg-muted/20">
                <Image
                  src={currentImageUrl}
                  alt="current image"
                  className="max-h-40 rounded"
                  width={220}
                  height={220}
                />
              </div>
            )}

            {imagePreview && (
              <div className="mt-3 flex flex-col items-center gap-3 rounded-md border p-2 bg-muted/20">
                <Image
                  src={imagePreview}
                  alt="preview"
                  className="max-h-40 rounded"
                  width={220}
                  height={220}
                  unoptimized
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
