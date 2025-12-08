import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { FormEvent } from "react";
import { useState } from "react";

interface WelcomeScreenProps {
  onStart: (code: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function WelcomeScreen({ onStart, isLoading, error }: WelcomeScreenProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onStart(code.trim());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <CardTitle className="font-bold text-2xl text-slate-100">
              Welkom bij het Interview
            </CardTitle>
            <CardDescription className="mt-2 text-slate-400">
              Voer je persoonlijke code in om te beginnen of verder te gaan met je feedback.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="code" className="font-medium text-slate-300 text-sm">
                Toegangscode
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Bijv. ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="h-12 border-slate-700 bg-slate-800/50 text-center font-mono text-lg text-slate-100 tracking-widest placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                disabled={isLoading}
                autoComplete="off"
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-base text-white shadow-emerald-500/20 shadow-lg transition-all duration-200 hover:from-emerald-500 hover:to-teal-500"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-5 w-5" />
                  Bezig met laden...
                </span>
              ) : (
                "Start Interview"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-500 text-xs leading-relaxed">
            Je kunt dit interview op elk moment onderbreken en later hervatten met dezelfde code.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
