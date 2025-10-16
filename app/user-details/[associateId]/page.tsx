"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { CreateUserDetailsInput, type UserDetailField } from "@/types";
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
  const [loadingFields, setLoadingFields] = useState(false);
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
  const [fields, setFields] = useState<UserDetailField[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [extra, setExtra] = useState<Record<string, any>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingFields(true);
        const res = await apiClient.userDetailsFields.listPublic();
        if (!active) return;
        const list = Array.isArray(res.fields) ? res.fields : [];
        setFields(
          list.filter((f) => f.active).sort((a, b) => a.order - b.order)
        );
      } catch {
        // fail silently – dynamic fields are optional
      } finally {
        if (active) setLoadingFields(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleExtraChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setExtra((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
        extra: Object.keys(extra).length ? extra : undefined,
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
      setExtra({});
      router.push("/");
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

            {fields.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold">
                  Additional Information
                </h2>
                {fields.map((f) => {
                  const required = f.required === true;
                  const key = f.name;
                  const commonProps = {
                    id: key,
                    name: key,
                    required,
                    onChange: handleExtraChange,
                  } as const;
                  const options = Array.isArray(f.options)
                    ? (f.options as unknown as string[])
                    : [];
                  return (
                    <div key={f.id} className="grid gap-2">
                      <Label htmlFor={key}>
                        {f.label}
                        {required ? " *" : ""}
                      </Label>
                      {f.type === "TEXT" && (
                        <Input {...commonProps} value={extra[key] ?? ""} />
                      )}
                      {f.type === "TEXTAREA" && (
                        <textarea
                          {...(commonProps as unknown as React.DetailedHTMLProps<
                            React.TextareaHTMLAttributes<HTMLTextAreaElement>,
                            HTMLTextAreaElement
                          >)}
                          className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={extra[key] ?? ""}
                        />
                      )}
                      {f.type === "NUMBER" && (
                        <Input
                          {...commonProps}
                          type="number"
                          value={extra[key] ?? ""}
                        />
                      )}
                      {f.type === "DATE" && (
                        <Input
                          {...commonProps}
                          type="date"
                          value={extra[key] ?? ""}
                        />
                      )}
                      {f.type === "SELECT" && (
                        <select
                          {...(commonProps as unknown as React.DetailedHTMLProps<
                            React.SelectHTMLAttributes<HTMLSelectElement>,
                            HTMLSelectElement
                          >)}
                          className="h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={extra[key] ?? ""}
                        >
                          <option value="" disabled>
                            Select an option
                          </option>
                          {options.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      )}
                      {f.type === "RADIO" && (
                        <div className="flex flex-wrap gap-4">
                          {options.map((o) => (
                            <label key={o} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={key}
                                value={o}
                                checked={extra[key] === o}
                                onChange={handleExtraChange}
                              />
                              <span>{o}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {f.type === "CHECKBOX" && (
                        <div className="flex items-center gap-2">
                          <input
                            id={key}
                            name={key}
                            type="checkbox"
                            checked={Boolean(extra[key])}
                            onChange={handleExtraChange}
                            className="h-4 w-4"
                          />
                          <Label htmlFor={key} className="m-0">
                            {f.label}
                          </Label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading || loadingFields}
                className="w-full sm:w-auto"
              >
                {loading || loadingFields ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Page;
