import { getAllowedOrigins } from "./cors.config";

describe("getAllowedOrigins", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return the default frontend origins when CORS_ORIGIN is not set", () => {
    delete process.env.CORS_ORIGIN;

    expect(getAllowedOrigins()).toEqual([
      "http://localhost:5173",
      "https://doomsday-system-ui.vercel.app",
      "https://doomsday-system-ui-keylor-pineda-s-projects.vercel.app",
    ]);
  });

  it("should append trimmed CORS_ORIGIN values without duplicates", () => {
    process.env.CORS_ORIGIN =
      " https://extra.example ,http://localhost:5173,, https://other.example";

    const origins = getAllowedOrigins();

    expect(origins).toHaveLength(5);
    expect(origins).toEqual(
      expect.arrayContaining([
        "https://extra.example",
        "https://other.example",
      ]),
    );
    expect(origins).not.toContain("");
  });
});
