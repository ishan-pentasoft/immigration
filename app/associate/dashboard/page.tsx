"use client";

import { Button } from "@/components/ui/button";
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
  }, []);

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
