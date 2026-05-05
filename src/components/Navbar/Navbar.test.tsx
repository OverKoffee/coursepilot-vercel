import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./index";

const { mockGetSession, mockOnAuthStateChange, mockSignOut, mockUnsubscribe } =
  vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockOnAuthStateChange: vi.fn(),
    mockSignOut: vi.fn(),
    mockUnsubscribe: vi.fn(),
  }));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  },
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      },
    });
  });

  it("shows the login link when there is no active session", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("link", { name: /login/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /logout/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the signed-in user and allows logout", async () => {
    const user = userEvent.setup();

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: {
            email: "student@example.com",
          },
        },
      },
    });
    mockSignOut.mockResolvedValue({ error: null });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/signed in as student@example\.com/i),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
