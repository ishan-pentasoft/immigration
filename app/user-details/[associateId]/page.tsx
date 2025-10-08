"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import apiClient, { CreateUserDetailsInput } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Page = () => {
  const params = useParams<{ associateId: string }>();
  const router = useRouter();
  const associateId = useMemo(
    () => String(params?.associateId || ""),
    [params]
  );

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateUserDetailsInput>({
    name: "",
    gender: "",
    dob: "",
    pob: "",
    nationality: "",
    citizenship: "",
    occupation: "",
    appointment: false,
    countryPreference: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associateId) {
      toast.error("Invalid link. Missing associate.");
      return;
    }

    try {
      setLoading(true);
      await apiClient.userDetails.submit(associateId, {
        ...form,
        dob: form.dob ? new Date(form.dob) : ("" as unknown as Date),
      });
      toast.success("Details submitted successfully.");
      setForm({
        name: "",
        gender: "",
        dob: "",
        pob: "",
        nationality: "",
        citizenship: "",
        occupation: "",
        appointment: false,
        countryPreference: "",
      });
      router.refresh();
    } catch (error: unknown) {
      console.error("Failed to submit details", error);
      type AxiosLike = { response?: { data?: { message?: string } } };
      const isAxiosLike = (e: unknown): e is AxiosLike =>
        typeof e === "object" && e !== null && "response" in (e as object);

      const msg = isAxiosLike(error)
        ? error.response?.data?.message ?? "Failed to submit details"
        : "Failed to submit details";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="p-4 w-full">
        <CardHeader>
          <h1 className="text-xl font-semibold text-primary">
            Submit your details
          </h1>
          <p className="text-sm text-muted-foreground">
            This form is shared by an associate. Please fill all the fields
            below.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={form.dob as string}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pob">Place of Birth</Label>
                <Input
                  id="pob"
                  name="pob"
                  value={form.pob}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="citizenship">Citizenship</Label>
                <Input
                  id="citizenship"
                  name="citizenship"
                  value={form.citizenship}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="appointment"
                  name="appointment"
                  type="checkbox"
                  checked={form.appointment}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <Label htmlFor="appointment">Request appointment</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="countryPreference">Preferred Country</Label>
              <Input
                id="countryPreference"
                name="countryPreference"
                value={form.countryPreference}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Page;
