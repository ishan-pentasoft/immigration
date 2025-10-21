"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  User,
  UserCheck,
  Crown,
  MessageSquare,
} from "lucide-react";
import { studentTicketsApi } from "@/lib/api";
import { Ticket, TicketMessage, CreateTicketMessageInput } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentTicketsApi.getById(ticketId);
      setTicket(response);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("Failed to load ticket");
      router.push("/student/tickets");
    } finally {
      setLoading(false);
    }
  }, [ticketId, router]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (ticket?.status === "CLOSED") {
      toast.error("Cannot send message to closed ticket");
      return;
    }

    try {
      setMessageLoading(true);
      const messageData: CreateTicketMessageInput = {
        content: newMessage.trim(),
      };

      await studentTicketsApi.addMessage(ticketId, messageData);
      setNewMessage("");
      toast.success("Message sent successfully");
      fetchTicket();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setMessageLoading(false);
    }
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

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case "STUDENT":
        return <User className="h-4 w-4" />;
      case "ASSOCIATE":
        return <UserCheck className="h-4 w-4" />;
      case "DIRECTOR":
        return <Crown className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getSenderName = (message: TicketMessage) => {
    if (message.senderType === "STUDENT" && message.student) {
      return message.student.name;
    }
    if (message.associate) {
      return `${message.associate.username} (${message.senderType})`;
    }
    return message.senderType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Ticket not found</h2>
          <Link href="/student/tickets">
            <Button className="mt-4 cursor-pointer">Back to Tickets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Link href="/student/tickets">
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(ticket.status)}
                </div>
                <CardTitle className="text-xl md:text-2xl leading-tight break-words">
                  {ticket.title}
                </CardTitle>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="font-medium">Created:</span>
                  {formatDate(ticket.createdAt!)}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <span className="font-medium">Assigned to:</span>
                  {ticket.associate?.username}
                </span>
              </div>
            </div>
            <div className="flex flex-row gap-2 lg:flex-col lg:items-end">
              <Badge
                variant="outline"
                className={`${getPriorityColor(
                  ticket.priority
                )} text-xs px-2 py-1`}
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
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-6">
              <h4 className="font-semibold text-lg">Conversation</h4>

              {ticket.messages && ticket.messages.length > 0 ? (
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {ticket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${
                        message.senderType === "STUDENT"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.senderType !== "STUDENT" && (
                        <div className="flex-shrink-0">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getSenderIcon(message.senderType)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}

                      <div
                        className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
                          message.senderType === "STUDENT"
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 mb-1 flex-wrap ${
                            message.senderType === "STUDENT"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <span className="text-sm font-medium text-foreground">
                            {getSenderName(message)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(message.createdAt!)}
                          </span>
                        </div>

                        <div
                          className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm border break-words ${
                            message.senderType === "STUDENT"
                              ? "bg-primary text-primary-foreground border-primary/20"
                              : "bg-card border-border"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                            {message.content}
                          </p>
                        </div>
                      </div>

                      {message.senderType === "STUDENT" && (
                        <div className="flex-shrink-0">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {ticket.student?.name?.[0]?.toUpperCase() || "S"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    No messages yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start the conversation below!
                  </p>
                </div>
              )}
            </div>

            {ticket.status === "OPEN" && (
              <>
                <Separator className="my-6" />
                <div className="bg-muted/30 rounded-lg p-6 border">
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-lg">
                        Send a message
                      </h4>
                      <Textarea
                        placeholder="Type your message here..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={messageLoading}
                        rows={4}
                        className="resize-none border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={messageLoading || !newMessage.trim()}
                        className="cursor-pointer px-6 py-2 font-medium"
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {messageLoading ? "Sending..." : "Send Message"}
                      </Button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {ticket.status === "CLOSED" && (
              <div className="bg-muted rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">This ticket has been closed</p>
                <p className="text-sm text-muted-foreground">
                  No further messages can be added to this ticket.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
