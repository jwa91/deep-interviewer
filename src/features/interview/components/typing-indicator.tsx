export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <span className="sr-only">Aan het typen...</span>
      <div
        className="h-2.5 w-2.5 animate-bounce rounded-full border-2 border-border bg-primary"
        style={{ animationDelay: "0ms", animationDuration: "600ms" }}
      />
      <div
        className="h-2.5 w-2.5 animate-bounce rounded-full border-2 border-border bg-primary"
        style={{ animationDelay: "150ms", animationDuration: "600ms" }}
      />
      <div
        className="h-2.5 w-2.5 animate-bounce rounded-full border-2 border-border bg-primary"
        style={{ animationDelay: "300ms", animationDuration: "600ms" }}
      />
    </div>
  );
}
