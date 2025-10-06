"use client";

import React, { useEffect, useState } from "react";
import apiClient, { Team } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import CreateTeamDialog from "@/components/admin/CreateTeamDialog";

export default function Page() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.admin.team.getAll();
        if (cancelled) return;
        setTeams(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        if (cancelled) return;
        setError(err?.response?.data?.error || "Failed to load team");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [refreshTrigger]);

  const refresh = () => setRefreshTrigger((v) => v + 1);

  const handleDelete = async (id: string) => {
    try {
      const team = await apiClient.admin.team.getById(id);
      if (team.imageUrl) {
        const fileName = team.imageUrl.split("/").pop();
        if (fileName) {
          try {
            await apiClient.images.delete(fileName);
          } catch (imageErr) {
            console.warn("Failed to delete image:", imageErr);
          }
        }
      }

      const res = await apiClient.admin.team.remove(id);
      if (res.success) {
        refresh();
        toast.success("Team member deleted successfully");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete team member");
    }
  };

  return (
    <>
      <header className="px-5 py-2 border-b flex items-center justify-between">
        <h1 className="text-2xl font-semibold ml-7">Team</h1>
        <CreateTeamDialog
          trigger={
            <Button className="font-bold shadow-lg cursor-pointer text-md">
              Add Team Member
            </Button>
          }
          onSaved={refresh}
        />
      </header>

      <section className="px-5 py-4 space-y-4">
        <div className="border rounded-md divide-y">
          {loading && (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-purple-500"></div>
              <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-red-500 ml-3"></div>
              <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-blue-500 ml-3"></div>
            </div>
          )}
          {error && !loading && (
            <div className="text-sm flex items-center justify-center h-[calc(100vh-200px)] text-red-600">
              {error}
            </div>
          )}
          {!loading && !error && teams.length === 0 && (
            <div className="text-sm text-muted-foreground flex items-center justify-center h-[calc(100vh-200px)]">
              No Team Member Created Yet.
            </div>
          )}
          {!loading && !error && teams.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead className="max-w-[250px]">Name</TableHead>
                  <TableHead className="max-w-[250px]">Title</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team, i) => (
                  <TableRow key={team.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      {team.imageUrl ? (
                        <Image
                          src={team.imageUrl}
                          alt={team.name}
                          width={50}
                          height={50}
                        />
                      ) : (
                        <div className="w-[50px] h-[50px] bg-muted rounded" />
                      )}
                    </TableCell>
                    <TableCell className="truncate">{team.name}</TableCell>
                    <TableCell className="truncate">{team.title}</TableCell>
                    <TableCell className="flex items-center gap-2 h-[60px]">
                      <CreateTeamDialog
                        teamId={team.id}
                        trigger={
                          <IconEdit className="cursor-pointer stroke-primary" />
                        }
                        onSaved={refresh}
                      />
                      <ConfirmDialog
                        title="Delete Team Member"
                        description="Are you sure you want to delete this team member?"
                        trigger={
                          <IconTrash className="cursor-pointer stroke-primary" />
                        }
                        confirmText="Delete"
                        onConfirm={() => handleDelete(team.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </>
  );
}
