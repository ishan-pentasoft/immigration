"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconBuildingFortress,
  IconMap2,
  IconTicket,
  IconMail,
} from "@tabler/icons-react";

type Stats = {
  visas: number;
  countries: number;
  colleges: number;
  contacts: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    visas: 0,
    countries: 0,
    colleges: 0,
    contacts: 0,
  });
  const [recentContacts, setRecentContacts] = useState<
    { id: string; name: string; email: string; createdAt?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [
          visasRes,
          countriesRes,
          collegesRes,
          contactsRes,
          recentContactsRes,
        ] = await Promise.all([
          apiClient.admin.visas.list({
            page: 1,
            limit: 1,
            signal: controller.signal,
          }),
          apiClient.admin.countries.list({
            page: 1,
            limit: 1,
            signal: controller.signal,
          }),
          apiClient.admin.colleges.list({
            page: 1,
            limit: 1,
            signal: controller.signal,
          }),
          apiClient.admin.contacts.list({
            page: 1,
            limit: 1,
            signal: controller.signal,
          }),
          apiClient.admin.contacts.list({
            page: 1,
            limit: 5,
            signal: controller.signal,
          }),
        ]);
        if (cancelled) return;
        setStats({
          visas: visasRes.total,
          countries: countriesRes.total,
          colleges: collegesRes.total,
          contacts: contactsRes.total,
        });
        setRecentContacts(
          (recentContactsRes.contacts || []).map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            createdAt: c.createdAt,
          }))
        );
      } catch (err: unknown) {
        if (cancelled) return;
        const e = err as {
          name?: string;
          response?: { data?: { error?: string } };
        };
        if (e?.name === "CanceledError") return;
        setError(e?.response?.data?.error || "Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: "Visas",
        value: stats.visas,
        href: "/admin/dashboard/visas",
        icon: <IconTicket className="size-5" />,
      },
      {
        label: "Countries",
        value: stats.countries,
        href: "/admin/dashboard/countries",
        icon: <IconMap2 className="size-5" />,
      },
      {
        label: "Colleges",
        value: stats.colleges,
        href: "/admin/dashboard/colleges",
        icon: <IconBuildingFortress className="size-5" />,
      },
      {
        label: "Contacts",
        value: stats.contacts,
        href: "/admin/dashboard/contacts",
        icon: <IconMail className="size-5" />,
      },
    ],
    [stats]
  );

  return (
    <section className="p-5 sm:p-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold ml-7">Dashboard</h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{s.label}</CardTitle>
                {s.icon}
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div className="text-3xl font-bold">
                  {loading ? "--" : s.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contacts</CardTitle>
          <CardDescription>Latest 5 contact submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="py-10 flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          )}
          {error && !loading && (
            <div className="py-10 flex items-center justify-center text-red-600 text-sm">
              {error}
            </div>
          )}
          {!loading && !error && recentContacts.length === 0 && (
            <div className="py-10 flex items-center justify-center text-muted-foreground text-sm">
              No recent contacts
            </div>
          )}
          {!loading && !error && recentContacts.length > 0 && (
            <ul className="divide-y">
              {recentContacts.map((c) => (
                <li
                  key={c.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleString()
                        : ""}
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                    >
                      <Link href={`/admin/dashboard/contacts/${c.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
