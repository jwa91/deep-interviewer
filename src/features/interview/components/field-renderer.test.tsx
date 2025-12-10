import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FIELD_LABELS, FieldRenderer } from "./field-renderer";

describe("FieldRenderer", () => {
  it("returns null for null value", () => {
    const { container } = render(<FieldRenderer label="Test" value={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null for undefined value", () => {
    const { container } = render(<FieldRenderer label="Test" value={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  describe("string values", () => {
    it("renders string value", () => {
      render(<FieldRenderer label="Test Label" value="Test Value" />);

      expect(screen.getByText("Test Label")).toBeInTheDocument();
      expect(screen.getByText("Test Value")).toBeInTheDocument();
    });

    it("renders empty string", () => {
      const { container } = render(<FieldRenderer label="Test" value="" />);

      expect(screen.getByText("Test")).toBeInTheDocument();
      const valueElement = container.querySelector("p");
      expect(valueElement).toBeInTheDocument();
      expect(valueElement?.textContent).toBe("");
    });
  });

  describe("number values", () => {
    it("renders number value", () => {
      render(<FieldRenderer label="Rating" value={42} />);

      expect(screen.getByText("Rating")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("renders rating visualization for 1-5 values", () => {
      const { container } = render(<FieldRenderer label="Rating" value={3} />);

      expect(screen.getByText("Rating")).toBeInTheDocument();
      // Should render 5 stars, with first 3 filled
      const stars = container.querySelectorAll('[class*="rounded-sm"]');
      expect(stars.length).toBe(5);
    });

    it("renders filled stars for rating value", () => {
      const { container } = render(<FieldRenderer label="Rating" value={4} />);

      const stars = container.querySelectorAll('[class*="rounded-sm"]');
      expect(stars.length).toBe(5);
      // First 4 should have bg-primary, last should be transparent
      const filledStars = Array.from(stars).filter((star) => star.className.includes("bg-primary"));
      expect(filledStars.length).toBe(4);
    });

    it("renders all stars filled for rating 5", () => {
      const { container } = render(<FieldRenderer label="Rating" value={5} />);

      const stars = container.querySelectorAll('[class*="rounded-sm"]');
      const filledStars = Array.from(stars).filter((star) => star.className.includes("bg-primary"));
      expect(filledStars.length).toBe(5);
    });

    it("renders no stars filled for rating 0", () => {
      const { container } = render(<FieldRenderer label="Rating" value={0} />);

      const stars = container.querySelectorAll('[class*="rounded-sm"]');
      const filledStars = Array.from(stars).filter((star) => star.className.includes("bg-primary"));
      expect(filledStars.length).toBe(0);
    });

    it("renders number as text for values outside 1-5 range", () => {
      render(<FieldRenderer label="Score" value={10} />);

      expect(screen.getByText("Score")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("renders negative numbers as text", () => {
      render(<FieldRenderer label="Score" value={-5} />);

      expect(screen.getByText("-5")).toBeInTheDocument();
    });
  });

  describe("boolean values", () => {
    it("renders true as 'Ja'", () => {
      render(<FieldRenderer label="Approved" value={true} />);

      expect(screen.getByText("Approved")).toBeInTheDocument();
      expect(screen.getByText("Ja")).toBeInTheDocument();
    });

    it("renders false as 'Nee'", () => {
      render(<FieldRenderer label="Approved" value={false} />);

      expect(screen.getByText("Approved")).toBeInTheDocument();
      expect(screen.getByText("Nee")).toBeInTheDocument();
    });

    it("applies correct styling for true value", () => {
      render(<FieldRenderer label="Test" value={true} />);

      const jaElement = screen.getByText("Ja");
      expect(jaElement.className).toContain("text-primary");
    });

    it("applies correct styling for false value", () => {
      render(<FieldRenderer label="Test" value={false} />);

      const neeElement = screen.getByText("Nee");
      expect(neeElement.className).toContain("text-muted-foreground");
    });
  });

  describe("array values", () => {
    it("renders array as comma-separated values", () => {
      render(<FieldRenderer label="Items" value={["item1", "item2", "item3"]} />);

      expect(screen.getByText("Items")).toBeInTheDocument();
      expect(screen.getByText("item1, item2, item3")).toBeInTheDocument();
    });

    it("returns null for empty array", () => {
      const { container } = render(<FieldRenderer label="Items" value={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it("renders array with mixed types", () => {
      render(<FieldRenderer label="Mixed" value={["text", 123, true]} />);

      expect(screen.getByText("text, 123, true")).toBeInTheDocument();
    });

    it("renders single-item array", () => {
      render(<FieldRenderer label="Single" value={["only"]} />);

      expect(screen.getByText("only")).toBeInTheDocument();
    });
  });

  describe("label rendering", () => {
    it("renders label in uppercase with tracking", () => {
      render(<FieldRenderer label="Test Label" value="value" />);

      const label = screen.getByText("Test Label");
      expect(label.className).toContain("uppercase");
      expect(label.className).toContain("tracking-wide");
    });

    it("renders label with correct styling classes", () => {
      render(<FieldRenderer label="Test" value="value" />);

      const label = screen.getByText("Test");
      expect(label.className).toContain("font-bold");
      expect(label.className).toContain("font-mono");
      expect(label.className).toContain("text-muted-foreground");
      expect(label.className).toContain("text-xs");
    });
  });

  describe("value rendering", () => {
    it("renders string value with correct styling", () => {
      render(<FieldRenderer label="Test" value="Test Value" />);

      const value = screen.getByText("Test Value");
      expect(value.className).toContain("font-mono");
      expect(value.className).toContain("text-sm");
      expect(value.className).toContain("leading-relaxed");
    });

    it("converts non-string values to string", () => {
      render(<FieldRenderer label="Test" value={12345} />);

      // For numbers outside 1-5, should render as text
      expect(screen.getByText("12345")).toBeInTheDocument();
    });
  });

  describe("FIELD_LABELS constant", () => {
    it("contains common field labels", () => {
      expect(FIELD_LABELS.userType).toBe("Gebruikerstype");
      expect(FIELD_LABELS.experienceLevel).toBe("Ervaringsniveau");
      expect(FIELD_LABELS.overallRating).toBe("Algemene Beoordeling");
    });

    it("contains rating field labels", () => {
      expect(FIELD_LABELS.difficultyRating).toBe("Moeilijkheidsgraad");
      expect(FIELD_LABELS.qualityRating).toBe("Kwaliteit");
      expect(FIELD_LABELS.clarityRating).toBe("Duidelijkheid");
    });

    it("contains suggestion field labels", () => {
      expect(FIELD_LABELS.suggestions).toBe("Suggesties");
      expect(FIELD_LABELS.topSuggestion).toBe("Top Suggestie");
    });

    it("contains all expected field labels", () => {
      const expectedKeys = [
        "userType",
        "experienceLevel",
        "toolsUsed",
        "useCaseSubjects",
        "overallRating",
        "sentiment",
        "mainTopicsIdentified",
        "alignsWithIntent",
        "difficultyRating",
        "difficultyLevel",
        "paceRating",
        "qualityRating",
        "relevanceRating",
        "depthRating",
        "presentationRating",
        "engagementRating",
        "structureRating",
        "clarityRating",
        "unclearTopics",
        "needsExplanation",
        "explanationTopic",
        "suggestions",
        "topSuggestion",
        "wouldRecommend",
        "preferredPart",
        "theoryPartRating",
        "practicalPartRating",
        "balanceOpinion",
      ];

      for (const key of expectedKeys) {
        expect(FIELD_LABELS).toHaveProperty(key);
        expect(typeof FIELD_LABELS[key as keyof typeof FIELD_LABELS]).toBe("string");
      }
    });
  });
});
