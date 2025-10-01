import { LoginForm } from "@/components/StudentLoginForm";

export default function StudentLoginPage() {
  return (
    <div className="bg-background flex flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm h-[60vh] flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
