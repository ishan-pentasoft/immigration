"use client";
import React, { useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/stateful-button";
import apiClient, { Visa } from "@/lib/api";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const { slug } = useParams();

  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    email: "",
    visaType: "",
    message: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [visa, setVisa] = React.useState<Visa | null>(null);
  const [loading, setLoading] = React.useState(true);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.phone ||
      !form.email ||
      !form.visaType ||
      !form.message
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.contact.submit({
        name: form.name,
        phone: form.phone,
        email: form.email,
        visaType: form.visaType,
        message: form.message,
      });
      toast.success("Your enquiry has been submitted. We'll contact you soon.");
      setForm({ name: "", phone: "", email: "", visaType: "", message: "" });
    } catch (err: unknown) {
      const msg =
        (typeof err === "object" &&
          err &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (err as any)?.response?.data?.error) ||
        (err instanceof Error
          ? err.message
          : "Failed to submit. Please try again.");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchVisa = async () => {
      try {
        setLoading(true);
        const res = await apiClient.user.visas.getBySlug(slug as string);
        if (res) setVisa(res);
      } catch (err) {
        console.error("Failed to fetch visa:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisa();
  }, [slug]);

  return (
    <>
      <PageHeader text="Visa" />
      <section className="py-10 px-3 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="pt-0 overflow-hidden col-span-2">
          <CardHeader className="p-0">
            {loading ? (
              <Skeleton className="h-full w-full aspect-[16/9]" />
            ) : visa?.imageUrl ? (
              <Image
                src={visa.imageUrl}
                alt={visa.title || "Visa"}
                width={500}
                height={500}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full aspect-[16/9] bg-muted flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </CardHeader>
          <CardTitle className="px-5 md:text-4xl text-2xl truncate text-primary font-semibold">
            {loading ? <Skeleton className="h-8 w-2/3" /> : visa?.title || ""}
          </CardTitle>
          <CardDescription className="px-2">
            {loading ? (
              <div className="ql-editor w-full max-w-5xl mx-auto space-y-3 py-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : (
              <div
                className="ql-editor w-full max-w-5xl mx-auto"
                dangerouslySetInnerHTML={{ __html: visa?.description || "" }}
              />
            )}
          </CardDescription>
        </Card>
        <div className="col-span-1">
          <Card className="p-4 md:p-6 md:sticky md:top-24">
            <p className="text-xs uppercase text-primary font-semibold">
              You Select Now
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold leading-tight mt-2">
              The Destination To
              <br className="hidden md:block" /> Fly!
            </h3>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-2 text-primary text-xs font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none px-4 py-3 bg-white"
                />
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-2 text-primary text-xs font-semibold">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none px-4 py-3 bg-white"
                />
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-2 text-primary text-xs font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none px-4 py-3 bg-white"
                />
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-2 text-primary text-xs font-semibold">
                  Select Visa
                </label>
                <select
                  name="visaType"
                  value={form.visaType}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none px-4 py-3 bg-white"
                >
                  <option value="" disabled>
                    --Select Visa--
                  </option>
                  <option value="study">Study Visa</option>
                  <option value="work">Work Visa</option>
                  <option value="tourist">Tourist Visa</option>
                  <option value="pr">Permanent Residency</option>
                </select>
              </div>

              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-2 text-primary text-xs font-semibold">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none px-4 py-3 bg-white resize-y"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:ring-2 hover:ring-red-600 font-bold tracking-wide px-6 py-3 text-lg cursor-pointer"
              >
                {submitting ? "Submitting..." : "Apply Now"}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Page;
