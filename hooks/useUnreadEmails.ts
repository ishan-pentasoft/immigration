"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import apiClient from "@/lib/api";

const subscribers = new Set<() => void>();
export function requestUnreadEmailsRefresh() {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch {
      // no-op
    }
  });
}

export function useUnreadEmails() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasService, setHasService] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchCount = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      setHasService(null);

      const { emailService } = await apiClient.associate.emailService.get();
      if (!emailService?.email || !emailService?.password) {
        setHasService(false);
        setCount(0);
        return;
      }

      setHasService(true);

      const res = await apiClient.associate.imap.list({
        email: emailService.email,
        password: emailService.password,
        page: 1,
        limit: 1,
        signal: controller.signal,
      });

      setCount(Number(res?.totalUnread) || 0);
    } catch (e) {
      if ((e as Error)?.name === "CanceledError") return;
      console.error(e);
      setError("Failed to fetch unread emails count");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const cb = () => fetchCount();
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
      abortRef.current?.abort();
    };
  }, [fetchCount]);

  const refresh = useCallback(() => {
    requestUnreadEmailsRefresh();
  }, []);

  return { count, loading, hasService, error, refresh } as const;
}
