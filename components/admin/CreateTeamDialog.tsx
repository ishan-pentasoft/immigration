"use client";

import React, { useCallback, useEffect, useState } from "react";
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
} from "@/components/ui/dialogSmall";
import { toast } from "sonner";

export default function CreateTeamDialog({
  trigger,
  onSaved,
  teamId,
}: {
  trigger?: React.ReactNode;
  onSaved?: () => void;
  teamId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isEditMode = Boolean(teamId);

  const extractFileNameFromUrl = (url: string): string | null => {
    try {
      const urlPath = new URL(url).pathname;
      const fileName = urlPath.split("/").pop();
      return fileName || null;
    } catch {
      return url.split("/").pop() || null;
    }
  };

  const fetchTeamData = useCallback(async () => {
    if (!teamId) return;
    try {
      setLoadingTeam(true);
      const team = await apiClient.admin.team.getById(teamId);
      setName(team.name || "");
      setTitle(team.title || "");
      setCurrentImageUrl(team.imageUrl || null);
    } catch (err) {
      console.error("Failed to fetch team data:", err);
      toast.error("Failed to load team data");
    } finally {
      setLoadingTeam(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (!open) {
      setName("");
      setTitle("");
      setCurrentImageUrl(null);
      setImagePreview(null);
      setLoadingTeam(false);
    } else if (open) {
      if (isEditMode && teamId) {
        fetchTeamData();
      } else {
        setName("");
        setTitle("");
        setCurrentImageUrl(null);
        setImagePreview(null);
      }
    }
  }, [open, isEditMode, teamId, fetchTeamData]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setImagePreview(URL.createObjectURL(f));
    } else {
      setImagePreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      setLoading(true);
      let imageUrl = currentImageUrl as string | null;
      const file = (fd.get("image") as File | null) || null;
      let oldImageDeleted = false;

      // For create, image is required by API
      if (!isEditMode && !file) {
        toast.error("Image is required");
        return;
      }

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
        name: String(fd.get("name") || ""),
        title: String(fd.get("title") || ""),
        imageUrl,
      };

      if (isEditMode && teamId) {
        await apiClient.admin.team.update(teamId, payload);
        const successMessage = oldImageDeleted
          ? "Team updated successfully (old image removed)"
          : "Team updated successfully";
        toast.success(successMessage);
      } else {
        await apiClient.admin.team.create(payload);
        toast.success("Team member created successfully");
      }

      form.reset();
      setImagePreview(null);
      setOpen(false);
      setName("");
      setTitle("");
      setCurrentImageUrl(null);
      onSaved?.();
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        toast.error(
          String(
            err.response?.data?.error ||
              `Failed to ${isEditMode ? "update" : "create"} team member`
          )
        );
      } else {
        toast.error(
          String(
            (err as Error)?.message ||
              `Failed to ${isEditMode ? "update" : "create"} team member`
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
            {isEditMode ? "Edit Team Member" : "Create Team Member"}
          </DialogTitle>
        </DialogHeader>
        {loadingTeam ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading team data...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <Input
                name="name"
                className="border p-2 w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Title</label>
              <Input
                name="title"
                className="border p-2 w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
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
                </div>
              )}
              {imagePreview && (
                <div className="mt-2 inline-flex items-center gap-3 rounded-md border p-2 bg-muted/20">
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
                disabled={loading || loadingTeam}
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
