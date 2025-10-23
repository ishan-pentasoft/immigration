"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ClipboardList, MessageSquare } from "lucide-react";
import apiClient from "@/lib/api";
import Link from "next/link";

export default function StudentDashboardPage() {
  const [loadingStats, setLoadingStats] = useState(true);
  const [ticketsOpenTotal, setTicketsOpenTotal] = useState(0);
  const [verPendingTotal, setVerPendingTotal] = useState(0);
  const [verInReviewTotal, setVerInReviewTotal] = useState(0);
  const [verCompletedTotal, setVerCompletedTotal] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingStats(true);
        const [ticketsOpen, verPending, verInReview, verCompleted] =
          await Promise.all([
            apiClient.student.tickets.list({
              page: 1,
              limit: 1,
              status: "OPEN",
              signal: controller.signal,
            }),
            apiClient.student.verificationRequests.list({
              page: 1,
              limit: 1,
              status: "PENDING",
              signal: controller.signal,
            }),
            apiClient.student.verificationRequests.list({
              page: 1,
              limit: 1,
              status: "IN_REVIEW",
              signal: controller.signal,
            }),
            apiClient.student.verificationRequests.list({
              page: 1,
              limit: 1,
              status: "COMPLETED",
              signal: controller.signal,
            }),
          ]);
        setTicketsOpenTotal(Number(ticketsOpen.total) || 0);
        setVerPendingTotal(Number(verPending.total) || 0);
        setVerInReviewTotal(Number(verInReview.total) || 0);
        setVerCompletedTotal(Number(verCompleted.total) || 0);
      } catch (e) {
        if ((e as Error)?.name === "CanceledError") return;
        console.error(e);
      } finally {
        setLoadingStats(false);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <main className="px-4 pt-8 pb-4 space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Open Tickets</div>
              <div className="text-2xl font-bold">
                {loadingStats ? "-" : ticketsOpenTotal}
              </div>
            </div>
            <MessageSquare className="opacity-70" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">
                Pending Verification
              </div>
              <div className="text-2xl font-bold">
                {loadingStats ? "-" : verPendingTotal}
              </div>
            </div>
            <ClipboardList className="opacity-70" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">In Review</div>
              <div className="text-2xl font-bold">
                {loadingStats ? "-" : verInReviewTotal}
              </div>
            </div>
            <ClipboardList className="opacity-70" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Verified</div>
              <div className="text-2xl font-bold">
                {loadingStats ? "-" : verCompletedTotal}
              </div>
            </div>
            <CheckCircle className="opacity-70" />
          </CardContent>
        </Card>
      </div>

      <Card className="p-4 w-full">
        <CardHeader>
          <h1 className="text-lg font-semibold text-primary">Quick Actions</h1>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/student/tickets">
              <Button className="cursor-pointer">View Support Tickets</Button>
            </Link>
            <Link href="/student/document-verification">
              <Button variant="outline" className="cursor-pointer">
                Manage Document Verification
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
