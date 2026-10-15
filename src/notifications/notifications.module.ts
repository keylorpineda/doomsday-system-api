import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NotificationsGateway } from "./notifications.gateway";
import { CampUpdateInterceptor } from "./camp-update.interceptor";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET", "secret"),
      }),
    }),
  ],
  providers: [
    NotificationsGateway,
    // Global: notifica por WebSocket las mutaciones marcadas con @EmitCampUpdate
    { provide: APP_INTERCEPTOR, useClass: CampUpdateInterceptor },
  ],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
