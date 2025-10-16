"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import type { Student, UserDetailField } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";

export default function EditStudentPage() {
  const params = useParams<{ id: string }>();
  const id = useMemo(() => String(params?.id || ""), [params]);
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [fields, setFields] = useState<UserDetailField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    gender: string;
    dob: string;
    nationality: string;
    citizenship: string;
    countryPreference: string;
    password?: string;
    extra: Record<string, unknown>;
  }>({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    nationality: "",
    citizenship: "",
    countryPreference: "",
    password: "",
    extra: {},
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [s, f] = await Promise.all([
          apiClient.associate.students.getById(id),
          apiClient.userDetailsFields
            .listPublic()
            .catch(() => ({ fields: [] })),
        ]);
        if (!active) return;
        setStudent(s);
        const list = Array.isArray(f.fields) ? f.fields : [];
        const activeFields = list
          .filter((x) => x.active)
          .sort((a, b) => a.order - b.order);
        setFields(activeFields);
        setForm({
          name: s.name || "",
          email: s.email || "",
          phone: s.phone || "",
          gender: s.gender || "",
          dob: s.dob || "",
          nationality: s.nationality || "",
          citizenship: s.citizenship || "",
          countryPreference: s.countryPreference || "",
          password: "",
          extra: (s.extra as Record<string, unknown> | null) || {},
        });
      } catch {
        if (!active) return;
        toast.error("Failed to load student");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const handleExtraChange = (key: string, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      extra: { ...(prev.extra || {}), [key]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: Partial<
        Pick<
          Student,
          | "name"
          | "email"
          | "phone"
          | "gender"
          | "dob"
          | "nationality"
          | "citizenship"
          | "countryPreference"
          | "extra"
        >
      > & { password?: string } = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob,
        nationality: form.nationality,
        citizenship: form.citizenship,
        countryPreference: form.countryPreference,
        extra: form.extra,
        ...(form.password ? { password: form.password } : {}),
      };
      const res = await apiClient.associate.students.update(id, payload);
      toast.success(res.message || "Student updated");
      router.push(`/associate/students/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-4">
        <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
          Loading...
        </div>
      </div>
    );

  if (!student)
    return (
      <div className="p-4">
        <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
          Not found
        </div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-primary font-bold text-2xl tracking-wider">
            Edit Student
          </h1>
          <div className="flex items-center gap-2">
            <Link href={`/associate/students/${id}`}>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
              >
                Back
              </Button>
            </Link>
          </div>
        </div>

        <form
          className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <div>
            <div className="text-xs text-muted-foreground">Name</div>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Phone</div>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Gender</div>
            <Select
              value={form.gender}
              onValueChange={(v) => setForm({ ...form, gender: v })}
            >
              <SelectTrigger className="cursor-pointer w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male" className="cursor-pointer">
                  Male
                </SelectItem>
                <SelectItem value="Female" className="cursor-pointer">
                  Female
                </SelectItem>
                <SelectItem value="Other" className="cursor-pointer">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">DOB</div>
            <Input
              type="date"
              value={form.dob?.substring(0, 10) || ""}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Nationality</div>
            <Input
              value={form.nationality}
              onChange={(e) =>
                setForm({ ...form, nationality: e.target.value })
              }
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Citizenship</div>
            <Input
              value={form.citizenship}
              onChange={(e) =>
                setForm({ ...form, citizenship: e.target.value })
              }
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              Country Preference
            </div>
            <Input
              value={form.countryPreference}
              onChange={(e) =>
                setForm({ ...form, countryPreference: e.target.value })
              }
            />
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs text-muted-foreground">
              New Password (optional)
            </div>
            <Input
              type="password"
              value={form.password || ""}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2 mt-2">
            <div className="font-semibold mb-2">Additional Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => {
                const key = f.name;
                const val = (form.extra || {})[key];
                if (f.type === "TEXTAREA") {
                  return (
                    <div key={f.id}>
                      <div className="text-xs text-muted-foreground">
                        {f.label}
                      </div>
                      <Textarea
                        value={
                          typeof val === "string"
                            ? val
                            : val == null
                            ? ""
                            : String(val)
                        }
                        onChange={(e) => handleExtraChange(key, e.target.value)}
                      />
                    </div>
                  );
                }
                return (
                  <div key={f.id}>
                    <div className="text-xs text-muted-foreground">
                      {f.label}
                    </div>
                    <Input
                      value={
                        typeof val === "string"
                          ? val
                          : val == null
                          ? ""
                          : String(val)
                      }
                      onChange={(e) => handleExtraChange(key, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" className="cursor-pointer" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
