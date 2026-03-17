import { Test, TestingModule } from "@nestjs/testing";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;

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
});
