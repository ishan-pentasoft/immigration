"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssociateAuth } from "@/hooks/useAssociateAuth";
import apiClient, { type UserDetails } from "@/lib/api";
import React, { useEffect, useState } from "react";

export default function Page() {
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { associate } = useAssociateAuth();

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      const data = await apiClient.userDetails.listByAssociate(
        associate?.id as string
      );
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading)
    return (
      <div className=" flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-purple-500"></div>
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-red-500 ml-3"></div>
        <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-blue-500 ml-3"></div>
      </div>
    );

  return (
    <div className="p-4 md:p-10 min-h-screen">
      <div className="h-full w-full bg-muted rounded-lg p-4 border border-border shadow-2xl">
        <h1 className="text-primary font-bold text-2xl tracking-wider">
          User Details
        </h1>
        <div className="border border-border shadow-2xl bg-background mt-5 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-accent">
              <TableRow>
                <TableHead className="font-bold">Id</TableHead>
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Gender</TableHead>
                <TableHead className="font-bold">DOB</TableHead>
                <TableHead className="font-bold">POB</TableHead>
                <TableHead className="font-bold">Nationality</TableHead>
                <TableHead className="font-bold">Citizenship</TableHead>
                <TableHead className="font-bold">Occupation</TableHead>
                <TableHead className="font-bold">Appointment</TableHead>
                <TableHead className="font-bold">Country Preference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.gender}</TableCell>
                  <TableCell>
                    {new Date(user.dob).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{user.pob}</TableCell>
                  <TableCell>{user.nationality}</TableCell>
                  <TableCell>{user.citizenship}</TableCell>
                  <TableCell>{user.occupation}</TableCell>
                  <TableCell>{user.appointment ? "Yes" : "No"}</TableCell>
                  <TableCell>{user.countryPreference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
