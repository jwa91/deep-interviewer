import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { FormEvent } from "react";
import { useState } from "react";

interface WelcomeScreenProps {
  readonly onStart: (code: string) => Promise<void>;
  readonly isLoading: boolean;
  readonly error: string | null;
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                           linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <Card className="w-full max-w-md bg-card">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="brutal-shadow mx-auto flex h-20 w-20 items-center justify-center rounded-lg border-2 border-border bg-primary">
            <svg
              className="h-10 w-10 text-primary-foreground"
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
            <CardTitle className="font-black font-heading text-3xl text-foreground">
              Welkom bij het Interview
            </CardTitle>
            <CardDescription className="mt-2 font-mono text-muted-foreground">
              Voer je persoonlijke code in om te beginnen of verder te gaan met je feedback.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="font-bold font-mono text-foreground text-sm uppercase tracking-wider"
              >
                Toegangscode
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Bijv. ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="h-14 text-center font-black font-mono text-xl tracking-[0.2em]"
                disabled={isLoading}
                autoComplete="off"
                autoFocus
              />
            </div>

            {error && (
              <div className="brutal-shadow rounded-md border-2 border-destructive bg-destructive/10 p-3 text-center font-bold text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-14 w-full text-lg"
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

          <p className="mt-6 text-center font-mono text-muted-foreground text-xs leading-relaxed">
            Je kunt dit interview op elk moment onderbreken en later hervatten met dezelfde code.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
