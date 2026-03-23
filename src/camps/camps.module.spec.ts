import { MODULE_METADATA } from "@nestjs/common/constants";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CampsModule } from "./camps.module";
import { CampsController } from "./camps.controller";
import { CampsService } from "./camps.service";

describe("CampsModule", () => {
  const getModuleMetadata = (key: string) =>
    Reflect.getMetadata(key, CampsModule) as unknown[];

  it("should define module metadata", () => {
    expect(CampsModule).toBeDefined();
  });

  it("should register imports, controller, providers and exports", () => {
    const imports = getModuleMetadata(MODULE_METADATA.IMPORTS);
    const controllers = getModuleMetadata(MODULE_METADATA.CONTROLLERS);
    const providers = getModuleMetadata(MODULE_METADATA.PROVIDERS);
    const exports = getModuleMetadata(MODULE_METADATA.EXPORTS);

    expect(imports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ module: TypeOrmModule }),
      ]),
    );
    expect(controllers).toEqual(expect.arrayContaining([CampsController]));
    expect(providers).toEqual(expect.arrayContaining([CampsService]));
    expect(exports).toEqual(expect.arrayContaining([CampsService]));
  });
});
