import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, CallHandler } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { SessionActivityInterceptor } from "./session-activity.interceptor";
import { Session } from "../entities/session.entity";
import { of } from "rxjs";

describe("SessionActivityInterceptor", () => {
  let interceptor: SessionActivityInterceptor;
  let sessionRepo: any;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionActivityInterceptor,
        {
          provide: getRepositoryToken(Session),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    interceptor = module.get<SessionActivityInterceptor>(
      SessionActivityInterceptor,
    );
    sessionRepo = module.get(getRepositoryToken(Session));
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should update session activity when valid Bearer token is present", async () => {
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: "response" })),
    } as unknown as CallHandler;

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: "Bearer valid_token",
          },
        }),
      }),
    } as unknown as ExecutionContext;

    jwtService.verify.mockReturnValueOnce({ sub: 1, username: "testuser" });
    sessionRepo.update.mockResolvedValueOnce({});

    await interceptor.intercept(mockContext, mockCallHandler);

    expect(jwtService.verify).toHaveBeenCalledWith("valid_token");
    expect(sessionRepo.update).toHaveBeenCalledWith(
      { user_id: 1, is_active: true },
      expect.objectContaining({ last_activity: expect.any(Date) }),
    );
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it("should not update session when no authorization header", async () => {
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: "response" })),
    } as unknown as CallHandler;

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    await interceptor.intercept(mockContext, mockCallHandler);

    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it("should not update session when authorization is not Bearer", async () => {
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: "response" })),
    } as unknown as ExecutionContext;

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: "Basic dXNlcjpwYXNz",
          },
        }),
      }),
    } as unknown as ExecutionContext;

    await interceptor.intercept(mockContext, mockCallHandler as any);

    expect(sessionRepo.update).not.toHaveBeenCalled();
  });

  it("should handle invalid JWT token gracefully", async () => {
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: "response" })),
    } as unknown as CallHandler;

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: "Bearer invalid_token",
          },
        }),
      }),
    } as unknown as ExecutionContext;

    jwtService.verify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    await interceptor.intercept(mockContext, mockCallHandler);

    // No debe throws, solo continúa
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it("should continue execution even if update fails", async () => {
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: "response" })),
    } as unknown as CallHandler;

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: "Bearer valid_token",
          },
        }),
      }),
    } as unknown as ExecutionContext;

    jwtService.verify.mockReturnValueOnce({ sub: 1, username: "testuser" });
    sessionRepo.update.mockRejectedValueOnce(new Error("DB error"));

    // No debe throw, interceptor debe continuar
    try {
      await interceptor.intercept(mockContext, mockCallHandler);
    } catch (error) {
      // Si hay error, verifica que el handle aún fue llamado después
    }

    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it("should extract token correctly from Bearer header", async () => {
    const mockToken = "my_jwt_token_12345";
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: "response" })),
    } as unknown as CallHandler;

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: `Bearer ${mockToken}`,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    jwtService.verify.mockReturnValueOnce({ sub: 5, username: "testuser" });
    sessionRepo.update.mockResolvedValueOnce({});

    await interceptor.intercept(mockContext, mockCallHandler);

    expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
  });

  it("should update session for correct user_id from JWT payload", async () => {
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: "response" })),
    } as unknown as CallHandler;

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: {
            authorization: "Bearer valid_token",
          },
        }),
      }),
    } as unknown as ExecutionContext;

    jwtService.verify.mockReturnValueOnce({ sub: 99, username: "testuser" });
    sessionRepo.update.mockResolvedValueOnce({});

    await interceptor.intercept(mockContext, mockCallHandler);

    expect(sessionRepo.update).toHaveBeenCalledWith(
      { user_id: 99, is_active: true },
      expect.objectContaining({ last_activity: expect.any(Date) }),
    );
  });
});
