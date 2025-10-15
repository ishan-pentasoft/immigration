"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Associate {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  associate: Associate | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

let verifyInFlight: Promise<boolean> | null = null;
let lastVerifyAt = 0;
let lastVerifyResult: boolean | null = null;
let lastAssociate: Associate | null = null;
const VERIFY_CACHE_WINDOW_MS = 1000;

export function useAssociateAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    associate: lastAssociate,
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
          associate: lastAssociate,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          associate: null,
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
        const response = await fetch("/api/associate/auth/verify", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setAuthState({
            associate: data.associate,
            isLoading: false,
            isAuthenticated: true,
          });
          lastAssociate = data.associate;
          lastVerifyResult = true;
          if (data.associate?.id) {
            api.defaults.headers.common["x-associate-id"] = data.associate.id;
          }
          return true;
        } else {
          setAuthState({
            associate: null,
            isLoading: false,
            isAuthenticated: false,
          });
          lastAssociate = null;
          lastVerifyResult = false;
          delete api.defaults.headers.common["x-associate-id"];
          return false;
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        setAuthState({
          associate: null,
          isLoading: false,
          isAuthenticated: false,
        });
        lastAssociate = null;
        lastVerifyResult = false;
        delete api.defaults.headers.common["x-associate-id"];
        return false;
      } finally {
        lastVerifyAt = Date.now();
        verifyInFlight = null;
      }
    })();

    return verifyInFlight;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch("/api/associate/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          associate: data.associate,
          isLoading: false,
          isAuthenticated: true,
        });
        lastAssociate = data.associate;
        lastVerifyResult = true;
        lastVerifyAt = Date.now();
        if (data.associate?.id) {
          api.defaults.headers.common["x-associate-id"] = data.associate.id;
        }

        try {
          const verifyRes = await fetch("/api/associate/auth/verify", {
            credentials: "include",
          });
          if (verifyRes.ok) {
            const vdata = await verifyRes.json();
            setAuthState({
              associate: vdata.associate,
              isLoading: false,
              isAuthenticated: true,
            });
            lastAssociate = vdata.associate;
            lastVerifyResult = true;
            lastVerifyAt = Date.now();
            if (vdata.associate?.id) {
              api.defaults.headers.common["x-associate-id"] =
                vdata.associate.id;
            }
          }
        } catch {
          // ignore verify hydration errors
        }

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
      await fetch("/api/associate/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      toast.success("Logged out successfully");
      setAuthState({
        associate: null,
        isLoading: false,
        isAuthenticated: false,
      });
      delete api.defaults.headers.common["x-associate-id"];
    } catch (error) {
      console.error("Logout API call failed:", error);
      toast.error("Logout failed");
    }

    router.push("/");
  }, [router]);

  const requireAuth = useCallback(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push("/associate-login");
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
