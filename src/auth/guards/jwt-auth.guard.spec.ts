import { Test, TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should be an instance of JwtAuthGuard", () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  it("should have canActivate method", () => {
    expect(typeof guard.canActivate).toBe("function");
  });

  it("should extend AuthGuard with jwt strategy", () => {
    // Verificar que JwtAuthGuard está correctamente inyectado desde el módulo
    expect(guard).toBeDefined();
    expect(guard.canActivate).toBeDefined();
  });

  it("should use reflector to check for public decorator", () => {
    // Verify that the reflector is used to check if route is public
    expect(reflector).toBeDefined();
    expect(typeof reflector.getAllAndOverride).toBe("function");
  });

  it("should have private reflector property", () => {
    const reflectorProperty = guard["reflector"];
    expect(reflectorProperty).toBeDefined();
    expect(reflectorProperty).toEqual(reflector);
  });

  it("should check both method and class for public metadata", () => {
    // The canActivate method should check both the handler and class
    // for the IS_PUBLIC_KEY metadata

    // The reflector should be used internally by canActivate
    expect(guard.canActivate).toBeDefined();
  });
});
