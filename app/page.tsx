import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="relative min-h-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_45%)]" />

      <main className="relative mx-auto flex min-h-full max-w-5xl flex-col justify-center px-6 py-20">
        <div className="mb-6 inline-flex w-fit items-center rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          AI-powered job applications
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Apply to more jobs in less time with an intelligent application agent.
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Sign in to access your dashboard, manage applications, and let AI help you tailor every
          submission.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-sm")}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 px-6 text-sm"
            )}
          >
            Create account
          </Link>
        </div>
      </main>
    </div>
  );
}
