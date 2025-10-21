"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, MessageSquare, Clock, CheckCircle, Paperclip } from "lucide-react";
import { studentTicketsApi } from "@/lib/api";
import { TicketWithLatestMessage, ListTicketsParams } from "@/types";
import { toast } from "sonner";
import Link from "next/link";
import { CreateTicketDialog } from "@/components/student/CreateTicketDialog";

export default function StudentTicketsPage() {
  const [tickets, setTickets] = useState<TicketWithLatestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchTickets = useCallback(
    async (params: ListTicketsParams = {}) => {
      try {
        setLoading(true);
        const response = await studentTicketsApi.list({
          page,
          limit: 10,
          search: search.trim() || undefined,
          ...params,
        });
        setTickets(response.tickets);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    },
    [page, search]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets, refreshTrigger]);

  const refreshTickets = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    return status === "OPEN" ? (
      <Clock className="h-4 w-4 text-blue-500" />
    ) : (
      <CheckCircle className="h-4 w-4 text-green-500" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start gap-3 justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-muted-foreground">
            Manage your support requests and get help from our team
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {search
                  ? "No tickets match your search criteria."
                  : "You haven't created any support tickets yet."}
              </p>
              {!search && (
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Ticket
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(ticket.status)}
                      </div>
                      <Link
                        href={`/student/tickets/${ticket.id}`}
                        className="text-base sm:text-lg font-semibold hover:text-primary transition-colors break-words cursor-pointer"
                      >
                        {ticket.title}
                      </Link>
                    </div>
                    
                    <p className="text-muted-foreground line-clamp-2 text-sm sm:text-base break-words">
                      {ticket.description}
                    </p>
                    
                    {ticket.attachmentUrl && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        <span>Has attachment</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Created:</span>
                        {formatDate(ticket.createdAt!)}
                      </span>
                      {ticket.latestMessage && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Last reply:</span>
                            {formatDate(ticket.latestMessage.createdAt!)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col lg:items-end gap-2 lg:space-y-2">
                    <Badge
                      variant="outline"
                      className={`${getPriorityColor(ticket.priority)} text-xs px-2 py-1`}
                    >
                      {ticket.priority}
                    </Badge>
                    <Badge
                      variant={ticket.status === "OPEN" ? "default" : "secondary"}
                      className="text-xs px-2 py-1"
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}

      <CreateTicketDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refreshTickets}
      />
    </div>
  );
}
