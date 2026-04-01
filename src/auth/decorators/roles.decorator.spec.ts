import { Roles, ROLES_KEY } from "./roles.decorator";

describe("Roles Decorator", () => {
  it("should be a function", () => {
    expect(typeof Roles).toBe("function");
  });

  it("should return a decorator function", () => {
    const result = Roles("ADMIN", "MODERATOR");
    expect(typeof result).toBe("function");
  });

  it("should work with single role", () => {
    const result = Roles("ADMIN");
    expect(result).toBeTruthy();
  });

  it("should work with multiple roles", () => {
    const result = Roles("ADMIN", "MODERATOR", "USER");
    expect(result).toBeTruthy();
  });

  it("should have ROLES_KEY constant defined", () => {
    expect(ROLES_KEY).toBe("roles");
  });

  it("should handle empty roles array", () => {
    const result = Roles();
    expect(result).toBeTruthy();
  });
});
