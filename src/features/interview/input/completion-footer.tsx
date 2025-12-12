import { Button } from "@/components/ui/button";

interface CompletionFooterProps {
  readonly onShowCompletion: () => void;
}

export function CompletionFooter({ onShowCompletion }: CompletionFooterProps) {
  return (
    <div className="border-border border-t-2 bg-background p-4 text-center">
      <p className="mb-3 font-mono text-muted-foreground text-sm">
        Het interview is afgerond. Bedankt voor je deelname!
      </p>
      <Button onClick={onShowCompletion} className="font-bold">
        Bekijk afronding
      </Button>
    </div>
  );
}
