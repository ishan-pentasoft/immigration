import PageHeader from "@/components/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

const page = () => {
  return (
    <>
      <PageHeader text="Frequently Asked Questions" />
      <section className="py-10 px-3 max-w-7xl mx-auto w-full">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-1"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Which visa types do you assist with?</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                We provide guidance for study, work, visitor/tourist, family/spouse, and PR pathways
                for destinations like Canada, Australia, the UK, the USA, and more.
              </p>
              <p>
                Our counselors help you choose the right category based on your profile, goals, and
                latest immigration policies.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How long does visa processing usually take?</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Processing times vary by country and visa type. Study and visitor visas can take
                2–8 weeks on average, while work and PR applications may take several months.
              </p>
              <p>
                We share the latest timelines during your consultation and keep you updated
                throughout your case.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>What documents are typically required?</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Common requirements include a valid passport, photographs, academic/work records,
                financial statements, language test scores (e.g., IELTS), and country-specific forms.
              </p>
              <p>
                You&apos;ll receive a customized checklist and templates from us to ensure a complete
                and accurate application.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Do you offer counseling and SOP/cover letter support?</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Yes. We conduct profile evaluations, guide program and country selection, and provide
                expert drafting/review for SOPs, study plans, and cover letters to strengthen your case.
              </p>
              <p>
                Mock interviews and pre‑submission quality checks are also available.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>What are the fees and payment options?</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Our service fee depends on the visa category and scope of support. Government/biometrics
                fees are separate and paid directly to the respective authorities.
              </p>
              <p>
                We provide transparent quotations with milestones. Flexible payment options are available.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </>
  );
};

export default page;
