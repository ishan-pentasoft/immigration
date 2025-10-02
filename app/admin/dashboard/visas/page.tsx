"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function AdminVisasPage() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      setLoading(true);
      let imageUrl = fd.get("imageUrl") as string | null;
      const file = (fd.get("image") as File | null) || null;
      if (file) {
        const imgFd = new FormData();
        imgFd.append("file", file);
        const upRes = await fetch("/api/images", {
          method: "POST",
          body: imgFd,
        });
        const upJson = (await upRes.json()) as {
          url?: string;
          fileName?: string;
          error?: string;
        };
        if (!upRes.ok) throw new Error(upJson?.error || "Image upload failed");
        imageUrl = upJson?.url || null;
      }
      const payload = {
        title: fd.get("title"),
        description: fd.get("description"),
        slug: fd.get("slug"),
        imageUrl,
      };

      const res = await fetch("/api/admin/visas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Create failed");

      alert("Visa created");
      form.reset();
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      alert(String(err));
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
    <main className="container mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create Visa</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" className="border p-2 w-full" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input
            name="slug"
            className="border p-2 w-full"
            required
            placeholder="study-in-canada"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            className="border p-2 w-full min-h-[120px]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={onFileChange}
          />
          {imagePreview && (
            <Image
              src={imagePreview}
              alt="preview"
              className="mt-2 max-h-48"
              width={200}
              height={200}
            />
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Create"}
        </button>
      </form>
    </main>
  );
}
