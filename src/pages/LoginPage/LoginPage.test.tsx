import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./index";

const { mockNavigate, mockSignInWithPassword } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockSignInWithPassword: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits the form when Enter is pressed in the password field", async () => {
    const user = userEvent.setup();

    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "student@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret{Enter}");

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "student@example.com",
        password: "secret",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/upload", { replace: true });
  });

  it("shows the Supabase error message when sign-in fails", async () => {
    const user = userEvent.setup();

    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "student@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid login credentials/i),
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
