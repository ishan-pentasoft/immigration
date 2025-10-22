"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, SlidersHorizontal, FileText, Globe } from "lucide-react";
import { toast } from "sonner";
import { useAssociateAuth } from "@/hooks/useAssociateAuth";
import CreateDocumentRequirementDialog from "@/components/associate/CreateDocumentRequirementDialog";
import DocumentRequirementsList from "@/components/associate/DocumentRequirementsList";
import { userCountriesApi, associateDocumentRequirementsApi } from "@/lib/api";
import type { DocumentType } from "@/types";

export type Country = {
  id: string;
  title: string;
};

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

export default function DocumentRequirementsPage() {
  const { associate } = useAssociateAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [activeOnly, setActiveOnly] = useState<string>("true");
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);

  const isDirector = associate?.role === "DIRECTOR";

  const fetchCountries = useCallback(async () => {
    try {
      const { countries } = await userCountriesApi.list();
      setCountries(countries || []);
    } catch {
      toast.error("Failed to load countries");
    }
  }, []);

  const fetchRequirements = useCallback(async () => {
    try {
      setLoading(true);
      const { requirements } = await associateDocumentRequirementsApi.list({
        countryId: countryFilter || undefined,
        active: activeOnly ? activeOnly === "true" : undefined,
      });
      setRequirements(requirements || []);
    } catch {
      toast.error("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  }, [countryFilter, activeOnly]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requirements;
    return requirements.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.documentType.toLowerCase().includes(q)
    );
  }, [requirements, search]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">
            Document Requirements
          </h2>
          <p className="text-muted-foreground">
            Define required documents per country
          </p>
        </div>
        {isDirector && (
          <Button
            onClick={() => setOpenCreate(true)}
            className="w-full sm:w-auto cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" /> New Requirement
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Select
              value={countryFilter || "ALL"}
              onValueChange={(v) => setCountryFilter(v === "ALL" ? "" : v)}
            >
              <SelectTrigger className="pl-8 w-full">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <SlidersHorizontal className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Select value={activeOnly} onValueChange={setActiveOnly}>
              <SelectTrigger className="pl-8 w-full">
                <SelectValue placeholder="Active" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Include Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative sm:col-span-2">
            <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or type"
              className="pl-8 w-full"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
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
      ) : (
        <DocumentRequirementsList
          items={filtered}
          countries={countries}
          canEdit={isDirector}
          onChanged={fetchRequirements}
        />
      )}

      <div className="text-xs text-muted-foreground">
        <Badge variant="outline" className="mr-2">
          {requirements.length}
        </Badge>
        total requirements
      </div>

      {isDirector && (
        <CreateDocumentRequirementDialog
          open={openCreate}
          onOpenChange={setOpenCreate}
          countries={countries}
          onCreated={fetchRequirements}
        />
      )}
    </div>
  );
}
