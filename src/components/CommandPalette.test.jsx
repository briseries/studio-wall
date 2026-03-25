import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CommandPalette from "./CommandPalette";

const ACTIONS = [
  { id: "new-note", label: "New inbox note", icon: "✏️", shortcut: "N",
    keywords: ["add", "create"], action: vi.fn() },
  { id: "templates", label: "Template packs", icon: "📦",
    keywords: ["pack"], action: vi.fn() },
  { id: "export", label: "Export backup", icon: "↓",
    keywords: ["save", "json"], action: vi.fn() },
];

function setup() {
  const onClose = vi.fn();
  ACTIONS.forEach(a => a.action.mockClear());
  const result = render(<CommandPalette actions={ACTIONS} onClose={onClose} />);
  return { onClose, ...result };
}

describe("CommandPalette", () => {
  it("renders all actions when query is empty", () => {
    setup();
    expect(screen.getByText("New inbox note")).toBeInTheDocument();
    expect(screen.getByText("Template packs")).toBeInTheDocument();
    expect(screen.getByText("Export backup")).toBeInTheDocument();
  });

  it("filters actions by label text", () => {
    setup();
    const input = screen.getByPlaceholderText("Type a command...");
    fireEvent.change(input, { target: { value: "template" } });
    expect(screen.getByText("Template packs")).toBeInTheDocument();
    expect(screen.queryByText("New inbox note")).not.toBeInTheDocument();
    expect(screen.queryByText("Export backup")).not.toBeInTheDocument();
  });

  it("filters actions by keyword", () => {
    setup();
    const input = screen.getByPlaceholderText("Type a command...");
    fireEvent.change(input, { target: { value: "json" } });
    expect(screen.getByText("Export backup")).toBeInTheDocument();
    expect(screen.queryByText("New inbox note")).not.toBeInTheDocument();
  });

  it("shows empty state when no matches", () => {
    setup();
    const input = screen.getByPlaceholderText("Type a command...");
    fireEvent.change(input, { target: { value: "zzzzzzz" } });
    expect(screen.getByText("No matching commands")).toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", () => {
    const { onClose } = setup();
    const input = screen.getByPlaceholderText("Type a command...");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    const { onClose, container } = setup();
    // Click the outermost overlay div
    fireEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("executes action and closes on Enter", () => {
    const { onClose } = setup();
    const input = screen.getByPlaceholderText("Type a command...");
    fireEvent.keyDown(input, { key: "Enter" });
    // First action should fire (activeIdx starts at 0)
    expect(ACTIONS[0].action).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("navigates with arrow keys", () => {
    setup();
    const input = screen.getByPlaceholderText("Type a command...");
    // Move down twice then Enter → should execute 3rd action (Export)
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(ACTIONS[2].action).toHaveBeenCalledTimes(1);
  });

  it("does not navigate past the last item", () => {
    setup();
    const input = screen.getByPlaceholderText("Type a command...");
    // Move down 10 times (more than 3 items)
    for (let i = 0; i < 10; i++) fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    // Should execute the last action
    expect(ACTIONS[2].action).toHaveBeenCalledTimes(1);
  });

  it("does not navigate above the first item", () => {
    setup();
    const input = screen.getByPlaceholderText("Type a command...");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });
    // Should execute the first action
    expect(ACTIONS[0].action).toHaveBeenCalledTimes(1);
  });

  it("executes action when clicking a result row", () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByText("Template packs"));
    expect(ACTIONS[1].action).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
