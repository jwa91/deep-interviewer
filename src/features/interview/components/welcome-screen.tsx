import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { SpotlightPicture } from "@/components/ui/spotlight-picture";
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

      <Card className="w-full max-w-5xl bg-card overflow-hidden">
        <CardContent className="p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* Left Column: Text Content */}
            <div className="space-y-6">
              <h1 className="font-black font-heading text-3xl md:text-4xl text-foreground">
                Hoi LLM fundamentals deelnemer
              </h1>
              
              <div className="space-y-4 font-mono text-muted-foreground leading-relaxed text-sm md:text-base">
                <p>
                  Bedankt voor je deelname aan de LLM fundamentals workshop. Tijdens de training hebben we gekeken naar de werking en het gebruik van LLM's. Ik ben erg benieuwd hoe je de training hebt ervaren. Om de enquete daarover een beetje in een leuke vorm te gieten, heb ik een AI agent gemaakt die je zal interviewen over de training. De interviewer heeft in totaal 9 vragen voor je, en ik denk dat het invullen ervan ongeveer 10 minuten tijd kost. Alle feedback wordt gewaardeerd!
                </p>
                
                <p>
                  Je kunt de Agent ook vragen naar de slides, mocht je nog eens wat na willen lezen.
                </p>
                
                <p>
                  Je kunt dit interview op elk moment onderbreken en later hervatten met dezelfde code, maar ik zou het fijn vinden als je de feedback die je wilt geven geeft binnen ongeveer 2 weken.
                </p>
                
                <p>
                  Als laatste: mocht je nu of in de toekomst nog bepaalde Ai gerelateerde vragen of uitdagingen hebben, denk ik heel graag met je mee. Stuur me gerust een Teams berichtje of email in dat geval.
                </p>
                
                <p className="font-bold text-foreground pt-2">
                  Groeten, Jan Willem
                </p>
              </div>
            </div>

            {/* Right Column: Picture & Form */}
            <div className="flex flex-col gap-8">
              <div className="w-full max-w-[300px] mx-auto md:max-w-[350px]">
                <SpotlightPicture 
                  imageSrc="/avatar_no_background_jw_altink_optimized.png"
                  imageAlt="Jan Willem Altink"
                  className="w-full"
                />
              </div>

              <div className="space-y-6 bg-secondary/30 p-6 rounded-xl border border-border/50">
                <div className="text-center">
                  <h2 className="font-bold font-heading text-xl text-foreground">
                    Start Interview
                  </h2>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
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
                      className="h-12 text-center font-black font-mono text-lg tracking-[0.2em] bg-background"
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
                    className="h-12 w-full text-lg font-bold"
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
