import { ExternalLink, Presentation } from "lucide-react";

interface SlideLinkCardProps {
  readonly url: string;
}

export function SlideLinkCard({ url }: SlideLinkCardProps) {
  return (
    <div className="fade-in slide-in-from-bottom-2 animate-in py-2 duration-300">
      <div className="flex w-full justify-start gap-3">
        {/* Avatar */}
        <div className="brutal-shadow flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border-2 border-border bg-secondary">
          <Presentation className="h-5 w-5 text-secondary-foreground" />
        </div>

        {/* Card - unified width with agent-note-card */}
        <div className="brutal-shadow w-full max-w-[80%] overflow-hidden rounded-lg border-2 border-border bg-card">
          <div className="p-4">
            <h3 className="mb-2 font-bold text-card-foreground text-sm uppercase">
              Workshop Slides
            </h3>
            <p className="mb-4 font-mono text-muted-foreground text-sm">
              Hier zijn de slides van de workshop die je hebt gevraagd.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:-translate-y-0.5 inline-flex items-center gap-2 rounded-md border-2 border-primary bg-primary px-4 py-2 font-bold text-primary-foreground text-sm transition-transform hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none"
            >
              <span>Open Slides</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
