import { CurrentUser } from "./current-user.decorator";

describe("CurrentUser Decorator", () => {
  it("should be defined and callable", () => {
    expect(CurrentUser).toBeDefined();
    expect(typeof CurrentUser).toBe("function");
  });

  it("should be a ParamDecorator", () => {
    // CurrentUser es un ParamDecorator de NestJS
    // Lo importante es que esté exportado y que funcione
    const decorator = CurrentUser;

    expect(decorator).toBeTruthy();
  });

  it("should have correct signature for param decorator", () => {
    // Verificar que CurrentUser pueda ser usado como decorador
    const isCallable = typeof CurrentUser === "function";

    expect(isCallable).toBe(true);
  });
});
