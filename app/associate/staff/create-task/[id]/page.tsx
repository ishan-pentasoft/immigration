"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const associateId = params?.id as string;

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associateId) return;
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    try {
      setSubmitting(true);

      let fileUrl: string | undefined = undefined;
      if (file) {
        const up = await apiClient.images.upload(file);
        if (up?.url) fileUrl = up.url;
        else {
          toast.error(up?.error || "Failed to upload file");
          setSubmitting(false);
          return;
        }
      }

      await apiClient.associate.staffTasks.create(associateId, {
        date: format(date, "yyyy-MM-dd"),
        title,
        description,
        status,
        file: fileUrl,
      });

      toast.success("Task created");
      router.push("/associate/staff");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-10">
      <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl max-w-2xl">
        <h1 className="text-primary font-bold text-2xl tracking-wider">
          Create Task
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    `w-full pl-3 text-left font-normal justify-start`,
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "PPP") : <span>Pick a Date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d: Date) =>
                    d < new Date() || d < new Date("1900-01-01")
                  }
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="status"
              type="checkbox"
              className="h-4 w-4"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
            />
            <Label htmlFor="status">Completed?</Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="file">Optional File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Task"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/associate/staff")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
