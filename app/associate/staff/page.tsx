"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiClient from "@/lib/api";
import { Associate } from "@/types";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [staff, setStaff] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.associate.staff.list();
        setStaff(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
          Staff List
        </h1>
        <div className="border border-border shadow-2xl bg-background mt-5 rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-accent">
              <TableRow>
                <TableHead className="font-bold">Id</TableHead>
                <TableHead className="font-bold">UserName</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((associate, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{associate.username}</TableCell>
                  <TableCell>{associate.email}</TableCell>
                  <TableCell>{associate.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Page;
