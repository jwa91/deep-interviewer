import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MessageInput } from "./message-input";

describe("MessageInput", () => {
  const mockOnSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders textarea and submit button", () => {
    render(<MessageInput onSend={mockOnSend} />);

    expect(screen.getByPlaceholderText("Typ je bericht...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verstuur/i })).toBeInTheDocument();
  });

  it("uses custom placeholder when provided", () => {
    render(<MessageInput onSend={mockOnSend} placeholder="Custom placeholder" />);

    expect(screen.getByPlaceholderText("Custom placeholder")).toBeInTheDocument();
  });

  it("calls onSend when form is submitted via button click", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText("Typ je bericht...");
    const button = screen.getByRole("button");

    await user.type(textarea, "Hello world");
    await user.click(button);

    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith("Hello world");
  });

  it("calls onSend when Enter key is pressed", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText("Typ je bericht...");

    await user.type(textarea, "Hello world{Enter}");

    expect(mockOnSend).toHaveBeenCalledTimes(1);
    expect(mockOnSend).toHaveBeenCalledWith("Hello world");
  });

  it("does not call onSend when Shift+Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText("Typ je bericht...");

    await user.type(textarea, "Hello world{Shift>}{Enter}{/Shift}");

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it("clears message after sending", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText("Typ je bericht...") as HTMLTextAreaElement;
    const button = screen.getByRole("button");

    await user.type(textarea, "Hello world");
    await user.click(button);

    expect(textarea.value).toBe("");
  });

  it("trims whitespace from message before sending", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText("Typ je bericht...");
    const button = screen.getByRole("button");

    await user.type(textarea, "  Hello world  ");
    await user.click(button);

    expect(mockOnSend).toHaveBeenCalledWith("Hello world");
  });

  it("does not send empty message", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText("Typ je bericht...");
    const button = screen.getByRole("button");

    await user.type(textarea, "   ");
    await user.click(button);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it("disables textarea and button when disabled prop is true", () => {
    render(<MessageInput onSend={mockOnSend} disabled />);

    const textarea = screen.getByPlaceholderText("Even geduld, de interviewer is aan het typen...");
    const button = screen.getByRole("button");

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it("shows disabled placeholder when disabled", () => {
    render(<MessageInput onSend={mockOnSend} disabled />);

    expect(screen.getByPlaceholderText("Even geduld, de interviewer is aan het typen...")).toBeInTheDocument();
  });

  it("disables submit button when message is empty", () => {
    render(<MessageInput onSend={mockOnSend} />);

    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
  });

  it("enables submit button when message has content", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText("Typ je bericht...");
    const button = screen.getByRole("button");

    expect(button).toBeDisabled();

    await user.type(textarea, "Hello");

    expect(button).not.toBeDisabled();
  });

  it("handles debug:fill-message custom event", async () => {
    render(<MessageInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText("Typ je bericht...") as HTMLTextAreaElement;

    act(() => {
      const event = new CustomEvent("debug:fill-message", { detail: "Debug message" });
      window.dispatchEvent(event);
    });

    // Wait for React state update
    await waitFor(() => {
      expect(textarea.value).toBe("Debug message");
    });
  });

  it("cleans up debug event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<MessageInput onSend={mockOnSend} />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("debug:fill-message", expect.any(Function));
  });

  it("allows typing multiple lines with Shift+Enter", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText("Typ je bericht...") as HTMLTextAreaElement;

    await user.type(textarea, "Line 1{Shift>}{Enter}{/Shift}Line 2");

    expect(textarea.value).toBe("Line 1\nLine 2");
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it("handles rapid multiple submissions correctly", async () => {
    const user = userEvent.setup();
    render(<MessageInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText("Typ je bericht...");
    const button = screen.getByRole("button");

    await user.type(textarea, "Message 1");
    await user.click(button);

    await user.type(textarea, "Message 2");
    await user.click(button);

    expect(mockOnSend).toHaveBeenCalledTimes(2);
    expect(mockOnSend).toHaveBeenNthCalledWith(1, "Message 1");
    expect(mockOnSend).toHaveBeenNthCalledWith(2, "Message 2");
  });
});

