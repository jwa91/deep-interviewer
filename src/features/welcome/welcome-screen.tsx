import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeeyooLogo } from "@/components/ui/heeyoo-logo";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SpotlightPicture } from "@/components/ui/spotlight-picture";
import { Github, Linkedin } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      {/* Subtle grid pattern overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px),
                          linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <Card className="relative z-10 w-full max-w-5xl overflow-hidden bg-accent">
        <CardContent className="p-6 md:p-10">
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12">
            {/* Left Column: Text Content */}
            <div className="space-y-6">
              <div className="mb-2">
                <HeeyooLogo className="origin-left scale-90 md:scale-100" />
              </div>

              <h1 className="font-black font-heading text-3xl text-foreground md:text-4xl">
                Hoi LLM fundamentals deelnemer
              </h1>

              <div className="space-y-4 font-mono text-muted-foreground text-sm leading-relaxed md:text-base">
                <p>
                  Bedankt voor je deelname aan de LLM fundamentals workshop. Tijdens de training
                  hebben we gekeken naar de werking en het gebruik van LLM's. Ik ben erg benieuwd
                  hoe je de training hebt ervaren. Om de enquete daarover een beetje in een leuke
                  vorm te gieten, heb ik een AI agent gemaakt die je zal interviewen over de
                  training. De interviewer heeft in totaal 6 vragen voor je, en ik denk dat het
                  invullen ervan ongeveer 6-8 minuten tijd kost. Alle feedback wordt gewaardeerd!
                </p>

                <p>
                  Je kunt de Agent ook vragen naar de slides, mocht je nog eens wat na willen lezen.
                </p>

                <p>
                  Je kunt dit interview op elk moment onderbreken en later hervatten met dezelfde
                  code, maar ik zou het fijn vinden als je de feedback die je wilt geven geeft
                  binnen ongeveer 2 weken.
                </p>

                <p>
                  Als laatste: mocht je nu of in de toekomst nog bepaalde AI gerelateerde vragen of
                  uitdagingen hebben, denk ik heel graag met je mee. Stuur me gerust een Teams
                  berichtje of email in dat geval.
                </p>

                <div className="flex items-center gap-4 pt-2">
                  <p className="font-bold text-foreground">Groeten, Jan Willem</p>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://github.com/jwa91/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/janwillemaltink/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Picture & Form */}
            <div className="flex flex-col gap-8">
              <div className="mx-auto w-full max-w-[300px] md:max-w-[350px]">
                <SpotlightPicture
                  imageSrc="/avatar_no_background_jw_altink_optimized.png"
                  imageAlt="Jan Willem Altink"
                  className="w-full"
                />
              </div>

              <div className="brutal-shadow space-y-6 rounded-lg border-2 border-border bg-[var(--color-accent-4)] p-6">
                <div className="text-center">
                  <h2 className="font-bold font-heading text-foreground text-xl">
                    Start Interview
                  </h2>
                  <p className="mt-1 font-mono text-muted-foreground text-sm">
                    Voer je persoonlijke code in om te beginnen
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id="code"
                      type="text"
                      placeholder="Bijv. ABC123"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="h-12 bg-background text-left font-mono text-lg italic tracking-normal placeholder:text-muted-foreground/70"
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </div>

                  {error && (
                    <div className="brutal-shadow rounded-md border-2 border-destructive bg-destructive/10 p-3 text-center font-bold text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="h-12 w-full font-bold text-lg"
                    disabled={isLoading || !code.trim()}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="h-5 w-5" />
                        Laden...
                      </span>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
