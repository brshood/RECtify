'use client';

import { useState } from "react";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    };

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Failed to submit');
      }
      setIsSuccess(true);
      (event.currentTarget as HTMLFormElement).reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="font-semibold">RECtify</div>
          <nav className="hidden sm:flex gap-6 text-sm">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#how" className="hover:underline">How it works</a>
            <a href="#early-access" className="hover:underline">Early access</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <section className="py-8 sm:py-16">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">RECtify platform</h1>
          <p className="mt-4 text-base sm:text-lg text-black/70 dark:text-white/70 max-w-2xl">
            MVP demo. A simple landing with a lead form so you can collect interest while we iterate.
          </p>
          <div className="mt-8 flex gap-4">
            <a href="#early-access" className="inline-flex items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black px-5 py-3 text-sm font-medium hover:opacity-90">
              Get early access
            </a>
            <a href="#features" className="inline-flex items-center justify-center rounded-md border border-black/10 dark:border-white/20 px-5 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">
              Learn more
            </a>
          </div>
        </section>

        <section id="features" className="py-12">
          <h2 className="text-xl sm:text-2xl font-semibold">Core features</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-5">
              <div className="font-medium">Fast</div>
              <p className="mt-2 text-sm text-black/70 dark:text-white/70">Deploy quickly with a modern Next.js stack.</p>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-5">
              <div className="font-medium">Simple</div>
              <p className="mt-2 text-sm text-black/70 dark:text-white/70">Clean, minimal sections ready to customize.</p>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-5">
              <div className="font-medium">Actionable</div>
              <p className="mt-2 text-sm text-black/70 dark:text-white/70">Built-in lead capture to validate demand.</p>
            </div>
          </div>
        </section>

        <section id="how" className="py-12">
          <h2 className="text-xl sm:text-2xl font-semibold">How it works</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-sm sm:text-base text-black/80 dark:text-white/80">
            <li>Visitors land on the page and learn what RECtify offers.</li>
            <li>They submit the early access form.</li>
            <li>Submissions are saved to <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">data/leads.json</code>.</li>
          </ol>
        </section>

        <section id="early-access" className="py-12">
          <h2 className="text-xl sm:text-2xl font-semibold">Sign up for early access</h2>
          <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm mb-1">Name</label>
              <input id="name" name="name" type="text" className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20" placeholder="Jane Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm mb-1">Email</label>
              <input id="email" name="email" type="email" required className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20" placeholder="jane@company.com" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm mb-1">What would you like to achieve with RECtify?</label>
              <textarea id="message" name="message" rows={4} className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20" placeholder="Your goals, current workflow, etc." />
            </div>
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            {isSuccess && (
              <p className="text-sm text-green-700">Thanks! We will be in touch.</p>
            )}
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black px-5 py-2.5 text-sm font-medium disabled:opacity-60">
              {isSubmitting ? 'Submitting…' : 'Request access'}
            </button>
          </form>
        </section>
      </main>

      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-black/60 dark:text-white/60">
          © {new Date().getFullYear()} RECtify. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
