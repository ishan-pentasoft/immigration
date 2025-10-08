import { StaffEditForm } from "@/components/associate/StaffEditForm";

export default function page() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <StaffEditForm />
      </div>
    </div>
  );
}
