"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/api";
import { useAssociateAuth } from "@/hooks/useAssociateAuth";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional().default(""),
});

export default function Page() {
  const { associate, isLoading } = useAssociateAuth();
  const [loadingNotice, setLoadingNotice] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const isDirector = useMemo(() => associate?.role === "DIRECTOR", [associate]);

  useEffect(() => {
    let aborted = false;
    async function load() {
      setLoadingNotice(true);
      try {
        const notice = await apiClient.associate.notice.get();
        if (!aborted && notice) {
          form.reset({
            title: notice.title || "",
            description: notice.description || "",
          });
        }
      } catch (e) {
        console.error("Failed to load notice", e);
        if (!aborted) toast.error("Failed to load notice");
      } finally {
        if (!aborted) setLoadingNotice(false);
      }
    }
    load();
    return () => {
      aborted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: z.input<typeof formSchema>) {
    try {
      setSaving(true);
      const updated = await apiClient.associate.notice.update({
        title: values.title,
        description: values.description ?? "",
      });
      form.reset({
        title: updated.title || "",
        description: updated.description || "",
      });
      toast.success("Notice updated successfully");
    } catch (e) {
      console.error("Failed to update notice", e);
      toast.error("Failed to update notice");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || loadingNotice) {
    return (
      <section className="p-4 md:p-10 min-h-screen w-full">
        <div className="bg-muted border border-border shadow-2xl p-4 md:p-10 rounded-xl h-full w-full">
          <h1 className="text-xl font-bold text-primary">Notice</h1>
          <p className="text-sm mt-4">Loading...</p>
        </div>
      </section>
    );
  }

  if (!isDirector) {
    return (
      <section className="p-4 md:p-10 min-h-screen w-full">
        <div className="bg-muted border border-border shadow-2xl p-4 md:p-10 rounded-xl h-full w-full">
          <h1 className="text-xl font-bold text-primary">Notice</h1>
          <p className="text-sm mt-4">
            You do not have permission to access this page.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 md:p-10 min-h-screen w-full">
      <div className="bg-muted border border-border shadow-2xl p-4 md:p-10 rounded-xl h-full w-full">
        <h1 className="text-xl font-bold text-primary">Manage Notice</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-6 w-full mt-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter notice title"
                      className="bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notice description"
                      {...field}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="cursor-pointer font-bold text-sm tracking-wider"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
