"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Student } from "@/types";

interface AuthState {
  student: Student | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

let verifyInFlight: Promise<boolean> | null = null;
let lastVerifyAt = 0;
let lastVerifyResult: boolean | null = null;
let lastStudent: Student | null = null;
const VERIFY_CACHE_WINDOW_MS = 1000;

export function useStudentAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    student: lastStudent,
    isLoading: lastVerifyResult === null,
    isAuthenticated: lastVerifyResult === true,
  });
  const router = useRouter();

  const verifyToken = useCallback(async () => {
    const now = Date.now();
    if (
      now - lastVerifyAt < VERIFY_CACHE_WINDOW_MS &&
      lastVerifyResult !== null
    ) {
      if (lastVerifyResult === true) {
        setAuthState({
          student: lastStudent,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          student: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
      return lastVerifyResult;
    }

    if (verifyInFlight) {
      return verifyInFlight;
    }

    verifyInFlight = (async () => {
      try {
        const response = await fetch("/api/student/auth/verify", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setAuthState({
            student: data.student,
            isLoading: false,
            isAuthenticated: true,
          });
          lastStudent = data.student;
          lastVerifyResult = true;
          return true;
        } else {
          setAuthState({
            student: null,
            isLoading: false,
            isAuthenticated: false,
          });
          lastStudent = null;
          lastVerifyResult = false;
          return false;
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        setAuthState({
          student: null,
          isLoading: false,
          isAuthenticated: false,
        });
        lastStudent = null;
        lastVerifyResult = false;
        return false;
      } finally {
        lastVerifyAt = Date.now();
        verifyInFlight = null;
      }
    })();

    return verifyInFlight;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch("/api/student/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          student: data.student,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error("Login API call failed:", error);
      return {
        success: false,
        message: "Something went wrong. Please try again.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/student/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      toast.success("Logged out successfully");
      setAuthState({ student: null, isLoading: false, isAuthenticated: false });
    } catch (error) {
      console.error("Logout API call failed:", error);
      toast.error("Logout failed");
    }

    router.push("/student/login");
  }, [router]);

  const requireAuth = useCallback(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push("/student/login");
      return false;
    }
    return authState.isAuthenticated;
  }, [authState.isLoading, authState.isAuthenticated, router]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return {
    ...authState,
    login,
    logout,
    verifyToken,
    requireAuth,
  };
}
