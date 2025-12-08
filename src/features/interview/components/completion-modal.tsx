import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompletionModal({ isOpen, onClose }: CompletionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
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
          <DialogTitle className="font-bold text-2xl text-slate-100">
            Bedankt voor je feedback!
          </DialogTitle>
          <DialogDescription className="mt-2 text-base text-slate-400">
            Je hebt alle vragen beantwoord. Je feedback helpt ons de cursus te verbeteren.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <p className="font-medium text-slate-200">9/9 vragen voltooid</p>
                <p className="text-slate-500 text-sm">Interview succesvol afgerond</p>
              </div>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="h-12 w-full bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-base text-white shadow-emerald-500/20 shadow-lg hover:from-emerald-500 hover:to-teal-500"
          >
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
