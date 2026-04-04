import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { SessionInactivityGuard } from "./session-inactivity.guard";
import { Session } from "../entities/session.entity";

describe("SessionInactivityGuard", () => {
  let guard: SessionInactivityGuard;
  let sessionRepo: any;
  let jwtService: jest.Mocked<JwtService>;
  let reflector: jest.Mocked<Reflector>;

  const mockSession = {
    id: 1,
    user_id: 1,
    last_activity: new Date(),
    is_active: true,
    auto_logout: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionInactivityGuard,
        {
          provide: getRepositoryToken(Session),
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<SessionInactivityGuard>(SessionInactivityGuard);
    sessionRepo = module.get(getRepositoryToken(Session));
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    reflector = module.get(Reflector) as jest.Mocked<Reflector>;
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow public routes without checking inactivity", async () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    reflector.getAllAndOverride.mockReturnValueOnce(true);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should allow requests without authorization header", async () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    reflector.getAllAndOverride.mockReturnValueOnce(false);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should allow requests without Bearer token", async () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: "Basic dXNlcjpwYXNz" },
        }),
      }),
    } as unknown as ExecutionContext;

    reflector.getAllAndOverride.mockReturnValueOnce(false);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it("should allow active session with recent activity", async () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: "Bearer valid_token" },
        }),
      }),
    } as unknown as ExecutionContext;

    reflector.getAllAndOverride.mockReturnValueOnce(false);
    jwtService.verify.mockReturnValueOnce({ sub: 1, username: "testuser" });
    sessionRepo.find.mockResolvedValueOnce([mockSession]);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(sessionRepo.find).toHaveBeenCalled();
  });

  it("should reject when no active sessions found", async () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: "Bearer valid_token" },
        }),
      }),
    } as unknown as ExecutionContext;

    reflector.getAllAndOverride.mockReturnValueOnce(false);
    jwtService.verify.mockReturnValueOnce({ sub: 1, username: "testuser" });
    sessionRepo.find.mockResolvedValueOnce([]);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("should reject session when user has been inactive for more than 20 minutes", async () => {
    const inactiveSession = {
      ...mockSession,
      last_activity: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    };

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: "Bearer valid_token" },
        }),
      }),
    } as unknown as ExecutionContext;

    reflector.getAllAndOverride.mockReturnValueOnce(false);
    jwtService.verify.mockReturnValueOnce({ sub: 1, username: "testuser" });
    sessionRepo.find.mockResolvedValueOnce([inactiveSession]);
    sessionRepo.update.mockResolvedValueOnce({});

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(sessionRepo.update).toHaveBeenCalledWith(
      { user_id: 1, is_active: true },
      { is_active: false, auto_logout: true },
    );
  });

  it("should handle invalid JWT token gracefully", async () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: "Bearer invalid_token" },
        }),
      }),
    } as unknown as ExecutionContext;

    reflector.getAllAndOverride.mockReturnValueOnce(false);
    jwtService.verify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true); // Deja que JwtAuthGuard maneje el token
  });

  it("should work with multiple active sessions for same user", async () => {
    const sessions = [
      {
        ...mockSession,
        id: 1,
        last_activity: new Date(Date.now() - 5 * 60000),
      },
      { ...mockSession, id: 2, last_activity: new Date() }, // más reciente
    ];

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: "Bearer valid_token" },
        }),
      }),
    } as unknown as ExecutionContext;

    reflector.getAllAndOverride.mockReturnValueOnce(false);
    jwtService.verify.mockReturnValueOnce({ sub: 1, username: "testuser" });
    sessionRepo.find.mockResolvedValueOnce(sessions);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true); // La más reciente está activa
  });
});
