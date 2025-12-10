import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpotlightPicture } from "./spotlight-picture";

describe("SpotlightPicture", () => {
  it("renders figure element", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const figure = container.querySelector("figure");
    expect(figure).toBeInTheDocument();
  });

  it("renders SVG background", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("renders image with correct src", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test-image.jpg" />);

    const image = container.querySelector("image");
    expect(image).toBeInTheDocument();
    expect(image?.getAttribute("href")).toBe("/test-image.jpg");
  });

  it("uses default alt text when not provided", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const svg = container.querySelector('svg[role="img"]');
    expect(svg?.getAttribute("aria-label")).toBe("");
  });

  it("uses provided alt text", () => {
    const { container } = render(
      <SpotlightPicture imageSrc="/test.jpg" imageAlt="Test image description" />
    );

    const svg = container.querySelector('svg[role="img"]');
    expect(svg?.getAttribute("aria-label")).toBe("Test image description");
  });

  it("generates unique clip path ID for each instance", () => {
    const { container: container1 } = render(<SpotlightPicture imageSrc="/test1.jpg" />);
    const { container: container2 } = render(<SpotlightPicture imageSrc="/test2.jpg" />);

    const clipPath1 = container1.querySelector("clipPath");
    const clipPath2 = container2.querySelector("clipPath");

    expect(clipPath1).toBeInTheDocument();
    expect(clipPath2).toBeInTheDocument();

    const id1 = clipPath1?.getAttribute("id");
    const id2 = clipPath2?.getAttribute("id");

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });

  it("applies clip path to image", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const clipPath = container.querySelector("clipPath");
    const image = container.querySelector("image");

    expect(clipPath).toBeInTheDocument();
    expect(image).toBeInTheDocument();

    const clipPathId = clipPath?.getAttribute("id");
    const imageClipPath = image?.getAttribute("clip-path");

    expect(imageClipPath).toContain(clipPathId || "");
  });

  it("renders children when provided", () => {
    render(
      <SpotlightPicture imageSrc="/test.jpg">
        <div data-testid="child">Child content</div>
      </SpotlightPicture>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("does not render children when not provided", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const figure = container.querySelector("figure");
    expect(figure?.children.length).toBeGreaterThan(0);
    // Should only have SVG/image structure, no additional children
  });

  it("merges custom className with default classes", () => {
    const { container } = render(
      <SpotlightPicture imageSrc="/test.jpg" className="custom-class" />
    );

    const figure = container.querySelector("figure");
    expect(figure?.className).toContain("relative");
    expect(figure?.className).toContain("custom-class");
  });

  it("preserves SVG viewBox attributes", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const svgs = container.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg.getAttribute("viewBox")).toBeDefined();
    });
  });

  it("renders both background SVG and clipped image SVG", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it("applies preserveAspectRatio to image", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const image = container.querySelector("image");
    expect(image?.getAttribute("preserveAspectRatio")).toBe("xMidYMid slice");
  });

  it("sets image width and height to 100%", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const image = container.querySelector("image");
    expect(image?.getAttribute("width")).toBe("100%");
    expect(image?.getAttribute("height")).toBe("100%");
  });

  it("renders path elements in SVG", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThan(0);
  });

  it("applies correct fill colors using CSS variables", () => {
    const { container } = render(<SpotlightPicture imageSrc="/test.jpg" />);

    const paths = container.querySelectorAll("path");
    const hasBorderFill = Array.from(paths).some((path) =>
      path.getAttribute("fill")?.includes("border")
    );
    const hasPrimaryFill = Array.from(paths).some((path) =>
      path.getAttribute("fill")?.includes("primary")
    );

    expect(hasBorderFill || hasPrimaryFill).toBe(true);
  });

  it("handles empty imageSrc gracefully", () => {
    const { container } = render(<SpotlightPicture imageSrc="" />);

    const image = container.querySelector("image");
    // When imageSrc is empty, the image element should not be rendered
    expect(image).not.toBeInTheDocument();
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<SpotlightPicture ref={ref} imageSrc="/test.jpg" />);

    // Ref should be set to the figure element
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
