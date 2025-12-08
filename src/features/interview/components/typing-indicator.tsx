export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      <span className="sr-only">Aan het typen...</span>
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
        style={{ animationDelay: "0ms", animationDuration: "600ms" }}
      />
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
        style={{ animationDelay: "150ms", animationDuration: "600ms" }}
      />
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-emerald-400"
        style={{ animationDelay: "300ms", animationDuration: "600ms" }}
      />
    </div>
  );
}
