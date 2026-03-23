import { MODULE_METADATA } from "@nestjs/common/constants";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { SessionActivityInterceptor } from "./interceptors/session-activity.interceptor";
import { SessionInactivityGuard } from "./guards/session-inactivity.guard";
import { UsersModule } from "../users/users.module";

describe("AuthModule", () => {
  const getModuleMetadata = (key: string) =>
    Reflect.getMetadata(key, AuthModule) as unknown[];

  it("should define module metadata", () => {
    expect(AuthModule).toBeDefined();
  });

  it("should register imports, controllers, providers and exports", () => {
    const imports = getModuleMetadata(MODULE_METADATA.IMPORTS);
    const controllers = getModuleMetadata(MODULE_METADATA.CONTROLLERS);
    const providers = getModuleMetadata(MODULE_METADATA.PROVIDERS);
    const exports = getModuleMetadata(MODULE_METADATA.EXPORTS);

    expect(imports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: TypeOrmModule }),
        PassportModule,
        expect.objectContaining({
          module: JwtModule,
          imports: [ConfigModule],
        }),
        UsersModule,
      ]),
    );

    expect(controllers).toEqual(expect.arrayContaining([AuthController]));

    expect(providers).toEqual(
      expect.arrayContaining([
        AuthService,
        JwtStrategy,
        SessionActivityInterceptor,
        SessionInactivityGuard,
      ]),
    );

    expect(exports).toEqual(
      expect.arrayContaining([
        AuthService,
        JwtModule,
        SessionActivityInterceptor,
        SessionInactivityGuard,
        TypeOrmModule,
      ]),
    );
  });

  it("should configure JwtModule async factory with ConfigService", () => {
    const imports = getModuleMetadata(MODULE_METADATA.IMPORTS);
    const jwtDynamicModule = imports.find(
      (item) => (item as { module?: unknown })?.module === JwtModule,
    ) as { providers?: Array<Record<string, unknown>> };

    const jwtOptionsProvider = jwtDynamicModule.providers?.find(
      (provider) =>
        provider.provide === "JWT_MODULE_OPTIONS" &&
        Array.isArray(provider.inject) &&
        provider.inject.includes(ConfigService) &&
        typeof provider.useFactory === "function",
    ) as { useFactory: (config: ConfigService) => Record<string, unknown> };

    const config = {
      get: jest.fn((key: string, fallback?: string) => {
        if (key === "JWT_SECRET") return "test-secret";
        return fallback;
      }),
    } as unknown as ConfigService;

    const options = jwtOptionsProvider.useFactory(config);

    expect(options).toEqual({
      secret: "test-secret",
      signOptions: { expiresIn: "20m" },
    });
    expect(config.get).toHaveBeenCalledWith("JWT_SECRET");
    expect(config.get).toHaveBeenCalledWith("JWT_EXPIRES_IN", "20m");
  });
});
