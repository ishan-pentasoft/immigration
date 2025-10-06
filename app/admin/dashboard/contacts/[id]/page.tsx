"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { Contact } from "@/lib/api";

export default function Page() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const run = async () => {
      try {
        const c = await apiClient.admin.contacts.getById(id);
        setContact(c);
      } catch (err: unknown) {
        console.error("Failed to fetch contact:", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  return (
    <section className=" p-10">
      <div className="border-slate-500 shadow-xl bg-muted rounded-lg h-full w-full p-4">
        <Button
          className="font-bold cursor-pointer hover:text-white"
          variant={"outline"}
          onClick={() => router.back()}
        >
          Back
        </Button>
        {loading && (
          <div className=" flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-purple-500"></div>
            <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-red-500 ml-3"></div>
            <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-blue-500 ml-3"></div>
          </div>
        )}
        {!loading && contact && (
          <div className="mt-5 space-y-4">
            <h2 className="text-2xl font-bold text-primary">{contact.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{contact.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{contact.phone}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Visa Type</div>
                <div className="font-medium">{contact.visaType}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Submitted</div>
                <div className="font-medium">
                  {new Date(contact.createdAt || "").toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Message</div>
              <div className="whitespace-pre-wrap bg-background p-4 rounded-md border mt-2">
                {contact.message}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
