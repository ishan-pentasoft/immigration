"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, CheckCheck, Trash2 } from "lucide-react";
import { PopoverContent } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import apiClient from "@/lib/api";
import { useAssociateAuth } from "@/hooks/useAssociateAuth";
import type { CreateTodoInput, Todo } from "@/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconCancel } from "@tabler/icons-react";

const formSchema = z.object({
  title: z.string(),
  date: z.date(),
  time: z.string(),
});

export default function Page() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      title: "",
      time: format(new Date(), "HH:mm"),
    },
  });

  const { associate } = useAssociateAuth();
  const [isCreating, setIsCreating] = useState(false);
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

  const handleDelete = async (id: string) => {
    const prev = todos;
    setTodos((t) => t.filter((x) => x.id !== id));
    try {
      await apiClient.associate.todo.remove(id);
      toast.success("Todo deleted successfully");
    } catch (error) {
      console.error("Failed to delete todo", error);
      setTodos(prev);
      toast.error("Failed to delete todo");
    }
  };

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!associate?.id) {
      return;
    }

    const dateTime = new Date(values.date);
    if (values.time) {
      const [hh, mm] = values.time.split(":").map((n) => parseInt(n, 10));
      if (!isNaN(hh) && !isNaN(mm)) {
        dateTime.setHours(hh, mm, 0, 0);
      }
    }

    const payload: CreateTodoInput = {
      title: values.title,
      date: dateTime,
      status: false,
      associateId: associate.id,
    };

    const tempId = `temp-${Date.now()}`;
    const tempTodo = {
      id: tempId,
      title: values.title,
      date: dateTime as unknown as Date, // aligns with formatter usage
      status: false,
      associateId: associate.id,
    } as unknown as Todo;

    setTodos((t) => [tempTodo, ...t]);

    try {
      setIsCreating(true);
      const created = await apiClient.associate.todo.create(payload);
      setTodos((t) =>
        t.map((x) => (x.id === tempId ? (created as unknown as Todo) : x))
      );
      form.reset({
        title: "",
        date: new Date(),
        time: format(new Date(), "HH:mm"),
      });
      toast.success("Todo created successfully");
    } catch (error) {
      console.error("Failed to create todo", error);
      setTodos((t) => t.filter((x) => x.id !== tempId));
      toast.error("Failed to create todo");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="p-4 md:p-10 min-h-screen w-full">
      <div className="bg-muted border border-border shadow-2xl p-4 md:p-10 rounded-xl h-full w-full">
        <h1 className="text-xl font-bold text-primary">Create Task</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="col-span-12 md:col-span-5 w-full">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter title"
                      {...field}
                      className="bg-white w-full"
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="col-span-12 md:col-span-3 w-full">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            `w-full pl-3 text-left font-normal justify-start`,
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a Date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem className="col-span-12 md:col-span-2 w-full">
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" className="bg-white w-full" {...field} />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="col-span-12 md:col-span-2 flex items-end mb-2.5 w-full">
              <Button
                type="submit"
                className="w-full md:w-auto cursor-pointer font-bold text-sm tracking-wider"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>

        {todos.length !== 0 && (
          <>
            <h1 className="text-xl font-bold text-primary my-10">
              Todays Tasks
            </h1>
            <Table className="border border-border bg-white shadow-2xl z-10">
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="max-w-[250px]">Tasks</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(todo.id)}
                        className="cursor-pointer bg-red-500 hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4 cursor-pointer stroke-3 text-white" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </section>
  );
}
