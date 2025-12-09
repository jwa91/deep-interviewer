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
        <h4 className="font-medium text-slate-400 text-xs uppercase tracking-wide">{label}</h4>
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: items are strings without unique IDs
              key={`${label}-${i}`}
              className="inline-flex rounded-md bg-emerald-500/10 px-2 py-1 font-medium text-emerald-300 text-xs ring-1 ring-emerald-500/20 ring-inset"
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
        <span className="font-medium text-slate-400 text-xs uppercase tracking-wide">{label}</span>
        <span className={`font-medium text-sm ${value ? "text-emerald-400" : "text-slate-400"}`}>
          {value ? "Ja" : "Nee"}
        </span>
      </div>
    );
  }

  // Handle ratings (numbers 1-5 typically)
  // We assume simple numbers are ratings if the label contains 'Rating' or 'Level' or 'Score'
  // But generic number handling is safer if we don't rely on naming conventions strictly
  if (typeof value === "number") {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="font-medium text-slate-400 text-xs uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-emerald-300 text-sm">{value}</span>
          {/* Simple visual indicator for 1-5 ratings */}
          {value >= 1 && value <= 5 && (
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className={`h-1.5 w-1.5 rounded-full ${
                    star <= value ? "bg-emerald-500" : "bg-slate-700"
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
      <h4 className="font-medium text-slate-400 text-xs uppercase tracking-wide">{label}</h4>
      <p className="text-slate-200 text-sm leading-relaxed">{String(value)}</p>
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

