import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { DemoModeBadge } from "@/components/DemoModeBadge";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold text-white">PinPilot</Link>
          <DemoModeBadge />
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
