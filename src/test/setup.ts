import "@testing-library/jest-dom/vitest";

// this allows us to mock console.log in our tests (and avoid cluttering test output)
vi.spyOn(console, "log").mockImplementation(() => {});