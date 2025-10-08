"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ROLES } from "@/constants";
import { z } from "zod";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { isAxiosError } from "axios";

const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.email("Please enter a valid email address"),
    role: z.enum(ROLES, { error: "Please select a role" }),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const data = signupSchema.safeParse(formData);
    if (!data.success) {
      toast.error(data.error.issues[0].message);
      return;
    }
    const { username, email, role, password } = data.data;

    try {
      setLoading(true);
      const res = await apiClient.associate.staff.create({
        username,
        email,
        role,
        password,
      });
      toast.success(res.message || "User created successfully");
      setFormData({
        username: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err: unknown) {
      type ErrorResponse = { error?: string; message?: string };
      let apiMessage: string | undefined;
      if (isAxiosError(err)) {
        const data = err.response?.data as ErrorResponse | undefined;
        apiMessage = data?.error || data?.message;
      } else if (err instanceof Error) {
        apiMessage = err.message;
      }
      toast.error(apiMessage || "Failed to create staff account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create staff account</CardTitle>
          <CardDescription>
            Enter staff details below to create staff account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="John Doe"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        className="cursor-pointer"
                      >
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={passwordVisible ? "text" : "password"}
                        className="pr-10"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={
                          passwordVisible ? "Hide password" : "Show password"
                        }
                        className="absolute inset-y-0 right-0 my-auto h-full px-3 hover:bg-transparent cursor-pointer"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={confirmPasswordVisible ? "text" : "password"}
                        className="pr-10"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={
                          confirmPasswordVisible
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute inset-y-0 right-0 my-auto h-full px-3 hover:bg-transparent cursor-pointer"
                        onClick={() =>
                          setConfirmPasswordVisible(!confirmPasswordVisible)
                        }
                      >
                        {confirmPasswordVisible ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </Field>
                </Field>
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="cursor-pointer font-bold"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
