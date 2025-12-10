import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompletionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function CompletionModal({ isOpen, onClose }: CompletionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="brutal-shadow border-2 border-border bg-card text-card-foreground sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="brutal-shadow mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-primary">
            <svg
              className="h-8 w-8 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <DialogTitle className="font-black font-heading text-2xl text-foreground">
            Bedankt voor je feedback!
          </DialogTitle>
          <DialogDescription className="mt-2 font-mono text-base text-muted-foreground">
            Je hebt alle vragen beantwoord. Je feedback helpt ons de cursus te verbeteren.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="brutal-shadow rounded-md border-2 border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-border bg-secondary">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <p className="font-bold text-foreground">9/9 vragen voltooid</p>
                <p className="font-mono text-muted-foreground text-sm">
                  Interview succesvol afgerond
                </p>
              </div>
            </div>
          </div>

          <Button onClick={onClose} className="h-12 w-full text-base">
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
