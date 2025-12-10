import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { Ban } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:[&_span]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 disabled:[&_svg]:opacity-50",
  {
    variants: {
      variant: {
        default:
          "brutal-shadow border-2 border-border bg-primary text-primary-foreground hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        destructive:
          "brutal-shadow border-2 border-border bg-destructive text-destructive-foreground hover:bg-destructive/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        outline:
          "brutal-shadow border-2 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        secondary:
          "brutal-shadow border-2 border-border bg-secondary text-secondary-foreground hover:bg-secondary/80 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-8 has-[>svg]:px-4",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

/**
 * Button component with variant styles and asChild support for Radix Slot.
 *
 * When asChild is true, the button styles are applied to the child element
 * (e.g., an anchor tag) using Radix Slot.
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const buttonClassName = cn(buttonVariants({ variant, size, className }));

  // When asChild is true, render children through Slot
  // Slot requires exactly one child element
  if (asChild) {
    return (
      <Slot data-slot="button" className={buttonClassName} {...props}>
        {children}
      </Slot>
    );
  }

  // Standard button rendering with optional disabled icon
  return (
    <button data-slot="button" className={buttonClassName} disabled={disabled} {...props}>
      <span>{children}</span>
      {disabled && <Ban className="size-4 opacity-50" />}
    </button>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
