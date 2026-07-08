import Link from "next/link";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              AI
            </span>
            Job Application Agent
          </Link>
        </div>
        <div className="relative z-10 max-w-md space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/60">
            Smart applications
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Apply smarter, not harder.
          </h1>
          <p className="text-base leading-relaxed text-white/70">
            Tailor resumes, track applications, and let AI handle the repetitive work so you can
            focus on landing the right role.
          </p>
        </div>
        <p className="relative z-10 text-sm text-white/50">
          Secure authentication powered by Supabase
        </p>
      </section>

      <section className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="space-y-2 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                AI
              </span>
              Job Application Agent
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {children}

          <div className="text-center text-sm text-muted-foreground">{footer}</div>
        </div>
      </section>
    </div>
  );
}
