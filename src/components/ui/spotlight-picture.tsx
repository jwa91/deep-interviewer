"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

export interface SpotlightPictureProps extends React.HTMLAttributes<HTMLDivElement> {
  imageSrc: string;
  imageAlt?: string;
}

const SpotlightPicture = React.forwardRef<HTMLDivElement, SpotlightPictureProps>(
  ({ imageSrc, imageAlt = "", className, children, ...props }, ref) => {
    // Generate a unique ID for the clip path
    const clipId = React.useId();

    return (
      <figure className={cn("relative", className)} {...props} ref={ref}>
        <div className="relative">
          {/* SVG Background (in back) */}
          <div className="relative">
            <svg viewBox="0 0 370 383" className="h-auto w-full" aria-hidden="true">
              {/* Black outline/base shape using shadow color */}
              <path
                d="M353.721 104.805C394.031 158.873 352.658 257.913 261.311 326.017C169.965 394.121 
                  56.7836 400.445 16.4728 346.376C-23.838 292.308 23.9863 198.322 115.333 130.218C206.68 
                  62.1144 313.41 50.7364 353.721 104.805Z"
                fill="var(--border)"
              />
              {/* Colored shape */}
              <path
                d="M346.72 99.805C387.031 153.873 345.658 252.914 254.311 321.017C162.964 
                  389.121 56.2348 400.499 15.924 346.431C-24.3867 292.362 16.9862 
                  193.322 108.333 125.218C199.68 57.1145 306.41 
                  45.7366 346.72 99.805Z"
                fill="var(--primary)"
                stroke="var(--border)"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Clipped Image positioned on top */}
          <div className="absolute top-0 right-0 left-0 z-10">
            <div className="relative">
              <svg viewBox="0 0 370 383" className="h-auto w-full" role="img" aria-label={imageAlt}>
                <defs>
                  <clipPath id={clipId}>
                    {/* Optimized clip path with perfectly aligned right edge */}
                    <path
                      d="M349.0 20.318C394.0 74.262 354.448 253.074 262.311 321.021C171.175 388.968 56.6908 400.32 
                        16.4728 346.376C-23.7452 292.432 56.9316 6.6467 139.357 -45.4459C230.494 -112.5011 306.29 -33.6258 
                        349.0 20.318Z"
                    />
                  </clipPath>
                </defs>

                {imageSrc && (
                  <image
                    href={imageSrc}
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#${clipId})`}
                  />
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Optional children content */}
        {children}
      </figure>
    );
  }
);

SpotlightPicture.displayName = "SpotlightPicture";

export { SpotlightPicture };
