"use client";

import React, { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/api";
import type { FieldType, UserDetailField } from "@/types";
import { useAssociateAuth } from "@/hooks/useAssociateAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { IconChecks, IconSquareRoundedXFilled } from "@tabler/icons-react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const fieldTypes: FieldType[] = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
];

export default function Page() {
  const { associate } = useAssociateAuth();
  const isDirector = useMemo(
    () => associate?.role?.toUpperCase() === "DIRECTOR",
    [associate?.role]
  );

  // data and granular loading flags
  const [fields, setFields] = useState<UserDetailField[]>([]);
  const [fetching, setFetching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  // create form state
  const [label, setLabel] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<FieldType>("TEXT");
  const [required, setRequired] = useState(false);
  const [active, setActive] = useState(true);
  const [options, setOptions] = useState<string>(""); // comma-separated

  const load = async () => {
    try {
      setFetching(true);
      const res = await apiClient.userDetailsFields.director.list();
      setFields(res.fields ?? []);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast.error("Failed to load fields");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!isDirector) return;
    load();
  }, [isDirector]);

  if (!isDirector) {
    return (
      <div className="p-4 md:p-10">
        <div className="text-sm text-muted-foreground">
          Only Director can access this page.
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setLabel("");
    setName("");
    setType("TEXT");
    setRequired(false);
    setActive(true);
    setOptions("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const opts = options
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await apiClient.userDetailsFields.director.create({
        label: label.trim(),
        name: name.trim(),
        type,
        required,
        active,
        options: opts.length ? opts : undefined,
      });
      toast.success("Field created");
      resetForm();
      await load();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      toast.error("Failed to create field");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (f: UserDetailField) => {
    try {
      setActivatingId(f.id);
      await apiClient.userDetailsFields.director.update(f.id, {
        active: !f.active,
      });
      await load();
    } catch {
      toast.error("Failed to update");
    } finally {
      setActivatingId(null);
    }
  };

  const handleDelete = async (f: UserDetailField) => {
    if (!confirm(`Delete field "${f.label}"?`)) return;
    try {
      setDeletingId(f.id);
      await apiClient.userDetailsFields.director.remove(f.id);
      await load();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const arr = [...fields];
    const [item] = arr.splice(index, 1);
    arr.splice(newIndex, 0, item);
    try {
      setFields(arr);
      setReordering(true);
      await apiClient.userDetailsFields.director.reorder(arr.map((f) => f.id));
      toast.success("Reordered");
    } catch {
      toast.error("Failed to reorder");
      await load();
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="p-4 md:p-10">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <h1 className="text-primary font-bold text-2xl tracking-wider">
              Manage User Detail Fields
            </h1>
            <p className="text-sm text-muted-foreground">
              These fields are global and will appear on the public user details
              form for all associates.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name (unique key)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as FieldType)}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((t) => (
                      <SelectItem key={t} value={t} className="cursor-pointer">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="options">
                  Options (for select/radio/checkbox)
                </Label>
                <Input
                  id="options"
                  placeholder="Comma-separated e.g. Yes,No,Maybe"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="required"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                />
                <Label htmlFor="required">Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Field"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Existing Fields</h2>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-accent/50">
                  <TableRow>
                    <TableHead className="font-bold">Order</TableHead>
                    <TableHead className="font-bold">Label</TableHead>
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="font-bold">Required</TableHead>
                    <TableHead className="font-bold">Active</TableHead>
                    <TableHead className="font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((f, idx) => (
                    <TableRow key={f.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{f.label}</TableCell>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>{f.type}</TableCell>
                      <TableCell>{f.required ? "Yes" : "No"}</TableCell>
                      <TableCell>{f.active ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => move(idx, -1)}
                            disabled={idx === 0 || reordering}
                          >
                            <ChevronUp />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => move(idx, 1)}
                            disabled={idx === fields.length - 1 || reordering}
                          >
                            <ChevronDown />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(f)}
                            disabled={activatingId === f.id}
                          >
                            {f.active ? (
                              <IconChecks />
                            ) : (
                              <IconSquareRoundedXFilled />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(f)}
                            disabled={deletingId === f.id}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {fields.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-sm text-muted-foreground py-6"
                      >
                        {fetching ? "Loading..." : "No fields yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
