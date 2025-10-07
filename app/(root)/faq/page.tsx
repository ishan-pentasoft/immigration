"use client";

import PageHeader from "@/components/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import apiClient, { Faq } from "@/lib/api";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFaqs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.user.faq.getAll();
        if (isMounted) setFaqs(data);
      } catch (err) {
        console.error("GET /user/faq error", err);
        if (isMounted) setError("Failed to load FAQs. Please try again later.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFaqs();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader text="Frequently Asked Questions" />
      <section className="py-10 px-3 max-w-5xl mx-auto w-full">
        {loading && (
          <div className=" flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-purple-500"></div>
            <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-red-500 ml-3"></div>
            <div className="animate-spin ease-linear rounded-full w-10 h-10 border-t-2 border-b-2 border-blue-500 ml-3"></div>
          </div>
        )}
        {!!error && (
          <div className="text-sm text-red-600" role="alert">
            {error}
          </div>
        )}
        {!loading && !error && (
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue={faqs[0] ? `item-${faqs[0].id}` : undefined}
          >
            {faqs.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No FAQs available right now.
              </div>
            ) : (
              faqs.map((faq) => (
                <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-justify">
                    <p>{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        )}
      </section>
    </>
  );
};

export default Page;
