"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { SiteDetails, UpdateSiteDetailsInput } from "@/types";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialogSmall";

const schema = z.object({
  phone: z.string().optional().nullable(),
  email: z.email("Invalid email").optional().nullable(),
  facebook: z.string().optional().nullable(),
  twitter: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export default function SiteDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mpinOpen, setMpinOpen] = useState(false);
  const [pendingMaintenance, setPendingMaintenance] = useState<boolean | null>(
    null
  );
  const [mpin, setMpin] = useState("");
  const [verifying, setVerifying] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: "",
      email: "",
      facebook: "",
      twitter: "",
      youtube: "",
      address: "",
      maintenanceMode: false,
      maintenanceMessage: "",
    },
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const details: SiteDetails = await apiClient.admin.siteDetails.get();
        if (!mounted) return;
        form.reset({
          phone: details.phone ?? "",
          email: details.email ?? "",
          facebook: details.facebook ?? "",
          twitter: details.twitter ?? "",
          youtube: details.youtube ?? "",
          address: details.address ?? "",
          maintenanceMode: Boolean(details.maintenanceMode),
          maintenanceMessage: details.maintenanceMessage ?? "",
        });
      } catch (e) {
        console.error(e);
        toast.error("Failed to load site details");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [form]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const payload: UpdateSiteDetailsInput = {
        phone: values.phone || undefined,
        email: values.email || undefined,
        facebook: values.facebook || undefined,
        twitter: values.twitter || undefined,
        youtube: values.youtube || undefined,
        address: values.address || undefined,
        maintenanceMode: values.maintenanceMode,
        maintenanceMessage: values.maintenanceMessage || undefined,
      };
      await apiClient.admin.siteDetails.update(payload);
      toast.success("Site details updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update site details");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenance = (nextValue: boolean) => {
    setPendingMaintenance(nextValue);
    setMpin("");
    setMpinOpen(true);
  };

  const confirmMpin = async () => {
    if (!mpin.trim()) {
      toast.error("Enter MPIN");
      return;
    }
    try {
      setVerifying(true);
      await apiClient.admin.mpin.verify(mpin.trim());
      if (pendingMaintenance !== null) {
        form.setValue("maintenanceMode", pendingMaintenance);
      }
      setMpinOpen(false);
      setPendingMaintenance(null);
      setMpin("");
      toast.success("MPIN verified");
    } catch (err) {
      console.error(err);
      toast.error("Invalid MPIN");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className=" flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-purple-500"></div>
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-red-500 ml-3"></div>
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-blue-500 ml-3"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Site Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 555 123 4567"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="info@example.com"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://facebook.com/yourpage"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter/X URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://x.com/yourhandle"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://youtube.com/@yourchannel"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main St, City, Country"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">
                      Maintenance Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="maintenanceMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Enable Maintenance Mode</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              When enabled, non-admin users are redirected to
                              the maintenance page.
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={!!field.value}
                              onCheckedChange={(v) =>
                                handleToggleMaintenance(v)
                              }
                              aria-label="Maintenance mode"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maintenanceMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="We'll be back soon. We're performing scheduled maintenance."
                              value={field.value ?? ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={mpinOpen} onOpenChange={(o) => setMpinOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm with MPIN</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Enter your admin MPIN to confirm changing maintenance mode.
            </p>
            <Input
              type="password"
              inputMode="numeric"
              pattern="\\d*"
              maxLength={8}
              placeholder="Enter MPIN"
              value={mpin}
              onChange={(e) => setMpin(e.target.value.replace(/[^0-9]/g, ""))}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setMpinOpen(false);
                setPendingMaintenance(null);
                setMpin("");
              }}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmMpin}
              disabled={verifying || !mpin}
            >
              {verifying ? "Verifying..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
