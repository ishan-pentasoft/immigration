"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialogSmall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { associateDocumentRequirementsApi } from "@/lib/api";
import type { DocumentType, CreateDocumentRequirementInput } from "@/types";
import { useState, useEffect } from "react";

const DOCUMENT_TYPES = [
  "PASSPORT",
  "VISA",
  "ACADEMIC_TRANSCRIPT",
  "DEGREE_CERTIFICATE",
  "LANGUAGE_TEST",
  "FINANCIAL_STATEMENT",
  "MEDICAL_CERTIFICATE",
  "POLICE_CLEARANCE",
  "BIRTH_CERTIFICATE",
  "MARRIAGE_CERTIFICATE",
  "WORK_EXPERIENCE",
  "RECOMMENDATION_LETTER",
  "STATEMENT_OF_PURPOSE",
  "OTHER",
] as const;

type Country = { id: string; title: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countries: Country[];
  onCreated: () => Promise<void> | void;
  edit?: {
    id: string;
    countryId: string;
    documentType: DocumentType;
    title: string;
    description?: string | null;
    required: boolean;
    maxFileSize: number;
    allowedTypes: string[];
    order: number;
    active: boolean;
  } | null;
};

export default function CreateDocumentRequirementDialog({
  open,
  onOpenChange,
  countries,
  onCreated,
  edit = null,
}: Props) {
  const isEdit = !!edit;
  const [countryId, setCountryId] = useState(edit?.countryId || "");
  const [documentType, setDocumentType] = useState<DocumentType | "">(
    edit?.documentType || ""
  );
  const [title, setTitle] = useState(edit?.title || "");
  const [description, setDescription] = useState(edit?.description || "");
  const [required, setRequired] = useState(edit?.required ?? true);
  const [maxFileSize, setMaxFileSize] = useState<number>(
    edit?.maxFileSize ?? 5 * 1024 * 1024
  );
  const [allowedTypes, setAllowedTypes] = useState<string>(
    (edit?.allowedTypes || ["pdf", "jpg", "jpeg", "png", "doc", "docx"]).join(
      ","
    )
  );
  const [order, setOrder] = useState<number>(edit?.order ?? 0);
  const [active, setActive] = useState(edit?.active ?? true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && edit) {
      setCountryId(edit.countryId);
      setDocumentType(edit.documentType);
      setTitle(edit.title);
      setDescription(edit.description || "");
      setRequired(edit.required);
      setMaxFileSize(edit.maxFileSize);
      setAllowedTypes((edit.allowedTypes || []).join(","));
      setOrder(edit.order);
      setActive(edit.active);
    }
    if (!open && !edit) {
      setCountryId("");
      setDocumentType("");
      setTitle("");
      setDescription("");
      setRequired(true);
      setMaxFileSize(5 * 1024 * 1024);
      setAllowedTypes("pdf,jpg,jpeg,png,doc,docx");
      setOrder(0);
      setActive(true);
      setSubmitting(false);
    }
  }, [open, edit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!countryId || !documentType || !title) {
      toast.error("Country, document type and title are required");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateDocumentRequirementInput = {
        countryId,
        documentType: documentType as DocumentType,
        title: title.trim(),
        description: description?.trim() || undefined,
        required,
        maxFileSize: Number(maxFileSize) || 0,
        allowedTypes: allowedTypes
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        order: Number(order) || 0,
        active,
      };
      if (isEdit && edit) {
        await associateDocumentRequirementsApi.update(edit.id, payload);
        toast.success("Requirement updated");
      } else {
        await associateDocumentRequirementsApi.create(payload);
        toast.success("Requirement created");
      }
      onOpenChange(false);
      await onCreated();
    } catch {
      toast.error("Failed to submit requirement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Requirement" : "New Requirement"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Country</Label>
              <Select value={countryId} onValueChange={setCountryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Document Type</Label>
              <Select
                value={documentType || ""}
                onValueChange={(v) => setDocumentType(v as DocumentType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Passport Copy"
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description/instructions"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Max File Size (bytes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Allowed Types (comma separated)</Label>
              <Input
                value={allowedTypes}
                onChange={(e) => setAllowedTypes(e.target.value)}
                placeholder="pdf,jpg,jpeg,png,doc,docx"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={required} onCheckedChange={setRequired} />
                <span className="text-sm">Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={active} onCheckedChange={setActive} />
                <span className="text-sm">Active</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer"
            >
              {submitting
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                ? "Save"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
