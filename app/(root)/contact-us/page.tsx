"use client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import React, { useState } from "react";

const Page = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    visaType: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div className="w-full">
      <PageHeader text="Get in Touch" />

      <section className="py-10 px-3 max-w-5xl mx-auto w-full">
        <Card className="p-4 md:p-6 md:sticky md:top-24">
          <p className="text-xs uppercase text-primary font-semibold">
            You Select Now
          </p>
          <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">
            The destination To Fly!
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

            <div className="flex items-end w-full justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="w-fit bg-red-600 hover:ring-2 hover:ring-red-600 font-bold tracking-wide px-6 py-3 text-lg cursor-pointer"
              >
                {submitting ? "Submitting..." : "Apply Now"}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
};

export default Page;
