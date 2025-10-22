"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Pencil, FileText, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { associateDocumentRequirementsApi } from "@/lib/api";
import CreateDocumentRequirementDialog from "@/components/associate/CreateDocumentRequirementDialog";
import type { DocumentType } from "@/types";

export type Country = { id: string; title: string };
export type Requirement = {
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
};

type Props = {
  items: Requirement[];
  countries: Country[];
  canEdit?: boolean;
  onChanged: () => Promise<void> | void;
  loading?: boolean;
};

export default function DocumentRequirementsList({
  items,
  countries,
  canEdit,
  onChanged,
  loading,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Requirement | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this requirement?")) return;
    setDeletingId(id);
    try {
      await associateDocumentRequirementsApi.remove(id);
      toast.success("Requirement deleted");
      await onChanged();
    } catch {
      toast.error("Failed to delete requirement");
    } finally {
      setDeletingId(null);
    }
  }

  function openEdit(item: Requirement) {
    setEditing(item);
    setEditOpen(true);
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No requirements found
            </CardContent>
          </Card>
        ) : (
          items.map((r) => {
            const country = countries.find((c) => c.id === r.countryId);
            return (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-base sm:text-lg break-words">
                          {r.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {r.documentType.replaceAll("_", " ")}
                        </Badge>
                        <Badge
                          variant={r.required ? "default" : "outline"}
                          className="text-xs gap-1"
                        >
                          {r.required ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {r.required ? "Required" : "Optional"}
                        </Badge>
                        {!r.active && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {r.description && (
                        <p className="text-sm text-muted-foreground break-words line-clamp-2">
                          {r.description}
                        </p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          Country:{" "}
                          <span className="font-medium">
                            {country?.title || r.countryId}
                          </span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          Max size: {(r.maxFileSize / (1024 * 1024)).toFixed(1)}{" "}
                          MB
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>Types: {r.allowedTypes.join(", ")}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Order: {r.order}</span>
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex flex-row lg:flex-col lg:items-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(r)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />{" "}
                          {deletingId === r.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {canEdit && (
        <CreateDocumentRequirementDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          countries={countries}
          onCreated={onChanged}
          edit={editing}
        />
      )}
    </>
  );
}
