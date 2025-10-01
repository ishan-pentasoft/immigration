"use client";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import React from "react";

const Page = () => {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: wire up to API/Email service
    console.log("Contact form submitted:", form);
  };

  return (
    <div className="w-full">
      <PageHeader text="Get in Touch" />

      <section className="py-10 px-3 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-3">
          <p className="text-muted-foreground text-balance">
            Feel free to get in touch with us. We&apos;re open to discussing new
            projects, creative ideas, or opportunities to be part of your
            vision.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 max-w-3xl mx-auto flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              required
            />
          </div>

          <select
            name="topic"
            value={form.topic}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-base shadow-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="" disabled>
              Your Question About..
            </option>
            <option value="study">Study Abroad</option>
            <option value="visa">Visa/Visitor</option>
            <option value="work">Work/Permit</option>
            <option value="pr">PR Guidance</option>
            <option value="other">Other</option>
          </select>

          <textarea
            name="message"
            placeholder="Message"
            rows={6}
            value={form.message}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            required
          />

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 font-semibold px-6 py-2 rounded-md cursor-pointer"
            >
              Submit
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Page;
