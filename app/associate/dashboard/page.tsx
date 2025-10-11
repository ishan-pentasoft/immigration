"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssociateAuth } from "@/hooks/useAssociateAuth";
import apiClient from "@/lib/api";
import { Todo } from "@/types";
import { IconCancel } from "@tabler/icons-react";
import { format } from "date-fns";
import { CheckCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const { associate } = useAssociateAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [copied, setCopied] = useState(false);

  const shareUrl = React.useMemo(() => {
    if (!associate?.id) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/user-details/${associate.id}`;
  }, [associate?.id]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  };

  async function fetchTodos() {
    if (!associate?.id) {
      return;
    }

    try {
      const response = await apiClient.associate.todo.list();
      setTodos(response);
    } catch (error) {
      console.error("Failed to fetch todos", error);
      toast.error("Failed to fetch todos");
    }
  }

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associate?.id]);

  const handleToggle = async (id: string) => {
    const prev = todos;
    setTodos((t) =>
      t.map((x) => (x.id === id ? { ...x, status: !x.status } : x))
    );
    try {
      await apiClient.associate.todo.update(id);
      toast.success("Status Updated");
    } catch (error) {
      console.error("Failed to update todo", error);
      setTodos(prev);
      toast.error("Failed to update todo");
    }
  };

  return (
    <main className="px-4 pt-8 pb-4">
      <Card className="p-4 w-full mb-6">
        <CardHeader>
          <h1 className="text-lg font-semibold text-primary">
            Share user details form
          </h1>
          <p className="text-sm text-muted-foreground">
            Copy and share this link with users to fill their details.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={shareUrl}
              readOnly
              placeholder="Link will appear here"
            />
            <Button
              type="button"
              onClick={handleCopy}
              disabled={!shareUrl}
              className="cursor-pointer font-bold"
            >
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {todos.length > 0 && (
        <Card className="p-4 w-full">
          <CardHeader>
            <h1 className="text-lg font-semibold text-primary">
              Today&apos;s Task
            </h1>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="max-w-[250px]">Tasks</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todos.map((todo) => (
                  <TableRow key={todo.id}>
                    <TableCell>
                      <Button
                        className={
                          todo.status
                            ? "bg-green-400 hover:bg-green-500 cursor-pointer"
                            : "bg-red-400 hover:bg-red-500 cursor-pointer"
                        }
                        onClick={() => handleToggle(todo.id)}
                      >
                        {todo.status ? (
                          <CheckCheck className="stroke-4" />
                        ) : (
                          <IconCancel className="stroke-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {todo.title}
                    </TableCell>
                    <TableCell>
                      {format(new Date(todo.date as unknown as Date), "p")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default Page;
