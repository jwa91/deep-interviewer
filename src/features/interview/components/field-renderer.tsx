interface FieldRendererProps {
  readonly label: string;
  readonly value: unknown;
}

export function FieldRenderer({ label, value }: FieldRendererProps) {
  if (value === null || value === undefined) {
    return null;
  }

  // Handle arrays (e.g. toolsUsed, useCaseSubjects)
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }
    return (
      <div className="space-y-1">
        <h4 className="font-bold font-mono text-muted-foreground text-xs uppercase tracking-wide">{label}</h4>
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: items are strings without unique IDs
              key={`${label}-${i}`}
              className="inline-flex rounded-md border-2 border-border bg-secondary px-2 py-1 font-mono font-bold text-secondary-foreground text-xs brutal-shadow"
            >
              {String(item)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Handle booleans
  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="font-bold font-mono text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
        <span className={`font-mono font-bold text-sm ${value ? "text-primary" : "text-muted-foreground"}`}>
          {value ? "Ja" : "Nee"}
        </span>
      </div>
    );
  }

  // Handle ratings (numbers 1-5 typically)
  if (typeof value === "number") {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="font-bold font-mono text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-foreground text-sm">{value}</span>
          {/* Simple visual indicator for 1-5 ratings */}
          {value >= 1 && value <= 5 && (
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className={`h-2 w-2 rounded-full border border-border ${
                    star <= value ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle strings and other types
  return (
    <div className="space-y-1">
      <h4 className="font-bold font-mono text-muted-foreground text-xs uppercase tracking-wide">{label}</h4>
      <p className="font-mono text-foreground text-sm leading-relaxed">{String(value)}</p>
    </div>
  );
}

export const FIELD_LABELS: Record<string, string> = {
  // Common
  userType: "Gebruikerstype",
  experienceLevel: "Ervaringsniveau",
  toolsUsed: "Gebruikte Tools",
  useCaseSubjects: "Gebruiksdoelen",
  overallRating: "Algemene Beoordeling",
  sentiment: "Sentiment",
  mainTopicsIdentified: "Identificeerde Onderwerpen",
  alignsWithIntent: "Komt overeen met doel",
  difficultyRating: "Moeilijkheidsgraad",
  difficultyLevel: "Niveau",
  paceRating: "Tempo",
  qualityRating: "Kwaliteit",
  relevanceRating: "Relevantie",
  depthRating: "Diepgang",
  presentationRating: "Presentatie",
  engagementRating: "Betrokkenheid",
  structureRating: "Structuur",
  clarityRating: "Duidelijkheid",
  unclearTopics: "Onduidelijke Onderwerpen",
  needsExplanation: "Uitleg Nodig",
  explanationTopic: "Te Verklaren Onderwerp",
  suggestions: "Suggesties",
  topSuggestion: "Top Suggestie",
  wouldRecommend: "Zou Aanraden",
  preferredPart: "Voorkeur Onderdeel",
  theoryPartRating: "Theorie Score",
  practicalPartRating: "Praktijk Score",
  balanceOpinion: "Balans Mening",
};
