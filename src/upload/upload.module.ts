import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService], // Exportar para usarlo en otros m�dulos
})
export class UploadModule {}
