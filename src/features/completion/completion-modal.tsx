import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HeeyooLogo } from "@/components/ui/heeyoo-logo";
import { SpotlightPicture } from "@/components/ui/spotlight-picture";
import { ExternalLink, Github, Linkedin, X } from "lucide-react";

interface CompletionModalProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly workshopSlidesUrl: string | null;
}

export function CompletionModal({
	isOpen,
	onClose,
	workshopSlidesUrl,
}: CompletionModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-5xl overflow-hidden border-none bg-transparent p-0 shadow-none">
				<Card className="relative z-10 w-full overflow-hidden bg-accent">
					{/* Close button top-right */}
					<button
						type="button"
						onClick={onClose}
						className="absolute top-4 right-4 z-20 rounded-full p-2 text-foreground/50 transition-colors hover:bg-black/5 hover:text-foreground"
						aria-label="Sluiten"
					>
						<X className="h-6 w-6" />
					</button>

					<CardContent className="p-6 md:p-10">
						<div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12">
							{/* Left Column: Text Content */}
							<div className="space-y-6">
								<div className="mb-2">
									<HeeyooLogo className="origin-left scale-90 md:scale-100" />
								</div>

								<h1 className="font-black font-heading text-3xl text-foreground md:text-4xl">
									Bedankt!
								</h1>

								<div className="space-y-4 font-mono text-muted-foreground text-sm leading-relaxed md:text-base">
									<p>
										Super bedankt voor het meedoen aan dit AI interview, ik ga
										aan de slag met de feedback.
									</p>

									{workshopSlidesUrl && (
										<div className="pt-2">
											<p className="mb-2">
												Hier is nogmaals de link naar de slides:
											</p>
											<a
												href={workshopSlidesUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-2 font-bold text-primary hover:underline"
											>
												Bekijk slides
												<ExternalLink className="h-4 w-4" />
											</a>
										</div>
									)}

									<div className="pt-2">
										<p className="mb-2">
											Mocht je benieuwd zijn hoe deze applicatie gemaakt is,
											check Github hier:
										</p>
										<a
											href="https://github.com/jwa91/deep-interviewer"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 font-bold text-primary hover:underline"
										>
											<Github className="h-4 w-4" />
											Github Repository
										</a>
										<p className="mt-1 text-xs italic opacity-70">
											(Note: Repo might be private currently)
										</p>
									</div>

									<div className="flex items-center gap-4 border-border/50 border-t pt-4">
										<span className="font-bold text-foreground">
											Jan Willem
										</span>
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

							{/* Right Column: Picture & Action */}
							<div className="flex flex-col gap-8">
								<div className="mx-auto w-full max-w-[300px] md:max-w-[350px]">
									<SpotlightPicture
										imageSrc="/avatar_no_background_jw_altink_optimized.png"
										imageAlt="Jan Willem Altink"
										className="w-full"
									/>
								</div>

								<Button
									onClick={onClose}
									variant="outline"
									className="h-12 w-full font-bold text-lg"
								>
									Chat verlaten
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</DialogContent>
		</Dialog>
	);
}
