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
import RichTextEditor from "../ui/rich-text-editor";
import type { Country } from "@/types";
import Select, {
  components,
  SingleValueProps,
  OptionProps,
} from "react-select";

export default function CreateCollegeDialog({
  trigger,
  onSaved,
  collegeSlug,
}: {
  trigger?: React.ReactNode;
  onSaved?: () => void;
  collegeSlug?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [loadingCollege, setLoadingCollege] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [countryId, setCountryId] = useState("");

  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const isEditMode = Boolean(collegeSlug);

  const extractFileNameFromUrl = (url: string): string | null => {
    try {
      const urlPath = new URL(url).pathname;
      const fileName = urlPath.split("/").pop();
      return fileName || null;
    } catch {
      return url.split("/").pop() || null;
    }
  };

  const fetchCountries = useCallback(async () => {
    try {
      setLoadingCountries(true);
      const res = await apiClient.admin.countries.list({
        page: 1,
        limit: 1000,
      });
      setCountries(res.countries || []);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
      toast.error("Failed to load countries");
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  const fetchCollegeData = useCallback(async () => {
    if (!collegeSlug) return;
    try {
      setLoadingCollege(true);
      const college = await apiClient.admin.colleges.getBySlug(collegeSlug);
      setName(college.name || "");
      setSlug(college.slug || "");
      setDescription(college.description || "");
      setCurrentImageUrl(college.imageUrl || null);
      setCountryId(college.countryId || "");
      setSlugEdited(true);
    } catch (err) {
      console.error("Failed to fetch college data:", err);
      toast.error("Failed to load college data");
    } finally {
      setLoadingCollege(false);
    }
  }, [collegeSlug]);

  useEffect(() => {
    if (open) fetchCountries();
  }, [open, fetchCountries]);

  useEffect(() => {
    if (!open) {
      setName("");
      setSlug("");
      setDescription("");
      setSlugEdited(false);
      setImagePreview(null);
      setCurrentImageUrl(null);
      setLoadingCollege(false);
      setCountryId("");
    } else if (open) {
      if (isEditMode && collegeSlug) {
        fetchCollegeData();
      } else {
        setName("");
        setSlug("");
        setDescription("");
        setSlugEdited(false);
        setImagePreview(null);
        setCurrentImageUrl(null);
        setCountryId("");
      }
    }
  }, [open, isEditMode, collegeSlug, fetchCollegeData]);

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
              if (!deleteRes.success) {
                console.warn("Failed to delete old image:", deleteRes.error);
              } else {
                oldImageDeleted = true;
              }
            } catch (deleteErr) {
              console.warn("Error deleting old image:", deleteErr);
            }
          }
        }
      }

      const payload = {
        name: String(fd.get("name") || ""),
        description: description,
        slug: String(fd.get("slug") || ""),
        imageUrl,
        countryId: countryId,
      };

      if (!payload.countryId) {
        toast.error("Please select a country");
        return;
      }

      if (isEditMode && collegeSlug) {
        await apiClient.admin.colleges.update(collegeSlug, payload);
        const successMessage = oldImageDeleted
          ? "College updated successfully (old image removed)"
          : "College updated successfully";
        toast.success(successMessage);
      } else {
        await apiClient.admin.colleges.create(payload);
        toast.success("College created successfully");
      }

      form.reset();
      setImagePreview(null);
      setOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      setCurrentImageUrl(null);
      setSlugEdited(false);
      setCountryId("");
      onSaved?.();
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        toast.error(
          String(
            err.response?.data?.error ||
              `Failed to ${isEditMode ? "update" : "create"} college`
          )
        );
      } else {
        toast.error(
          String(
            (err as Error)?.message ||
              `Failed to ${isEditMode ? "update" : "create"} college`
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
          <DialogTitle>
            {isEditMode ? "Edit College" : "Create College"}
          </DialogTitle>
        </DialogHeader>
        {loadingCollege ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading college data...
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
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  if (!slugEdited) {
                    setSlug(slugify(val));
                  }
                }}
                onBlur={() => {
                  if (!slugEdited && name && !slug) setSlug(slugify(name));
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
                placeholder="abc-college"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <div>
                <RichTextEditor
                  placeholder="Write the college description..."
                  value={description}
                  onChange={(e) => setDescription(e)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Country</label>
              <CountrySelect
                countries={countries}
                loading={loadingCountries}
                value={countryId}
                onChange={(val) => setCountryId(val)}
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
                disabled={loading || loadingCollege}
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

type CountryOption = { value: string; label: string; imageUrl?: string | null };

function CountrySelect({
  countries,
  loading,
  value,
  onChange,
}: {
  countries: Country[];
  loading: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const options: CountryOption[] = countries.map((c) => ({
    value: c.id,
    label: c.title,
    imageUrl: c.imageUrl || undefined,
  }));

  const selected = options.find((o) => o.value === value) || null;

  const Option = (props: OptionProps<CountryOption>) => (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        {props.data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.data.imageUrl}
            alt={props.data.label}
            className="h-5 w-5 rounded object-cover"
          />
        ) : (
          <div className="h-5 w-5 rounded bg-muted" />
        )}
        <span>{props.data.label}</span>
      </div>
    </components.Option>
  );

  const SingleValue = (props: SingleValueProps<CountryOption>) => (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        {props.data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.data.imageUrl}
            alt={props.data.label}
            className="h-5 w-5 rounded object-contain"
          />
        ) : (
          <div className="h-5 w-5 rounded bg-muted" />
        )}
        <span>{props.data.label}</span>
      </div>
    </components.SingleValue>
  );

  return (
    <Select
      inputId="countryId"
      isLoading={loading}
      options={options}
      value={selected}
      onChange={(opt) => onChange((opt as CountryOption | null)?.value || "")}
      placeholder={loading ? "Loading countries..." : "Select a country"}
      components={{ Option, SingleValue }}
      classNamePrefix="rs"
      styles={{
        control: (base) => ({ ...base, backgroundColor: "var(--background)" }),
        menu: (base) => ({ ...base, zIndex: 50 }),
      }}
    />
  );
}
