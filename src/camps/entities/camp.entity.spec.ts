import { getMetadataArgsStorage } from "typeorm";
import { Camp } from "./camp.entity";
import { UserAccount } from "../../users/entities/user-account.entity";

describe("Camp entity", () => {
  it("should define properties and relation metadata", () => {
    const entity = new Camp();
    const foundationDate = new Date("2026-03-23");
    const users = [new UserAccount()];

    entity.id = 1;
    entity.name = "Campamento Norte";
    entity.location_description = "Sector norte";
    entity.latitude = 9.9281;
    entity.longitude = -84.0907;
    entity.max_capacity = 120;
    entity.active = true;
    entity.foundation_date = foundationDate;
    entity.logo_url = "logo.png";
    entity.logo_public_id = "logo-public-id";
    entity.map_url = "map.png";
    entity.map_public_id = "map-public-id";
    entity.userAccounts = users;

    expect(entity).toEqual({
      id: 1,
      name: "Campamento Norte",
      location_description: "Sector norte",
      latitude: 9.9281,
      longitude: -84.0907,
      max_capacity: 120,
      active: true,
      foundation_date: foundationDate,
      logo_url: "logo.png",
      logo_public_id: "logo-public-id",
      map_url: "map.png",
      map_public_id: "map-public-id",
      userAccounts: users,
    });

    const relation = getMetadataArgsStorage().relations.find(
      (item) => item.target === Camp && item.propertyName === "userAccounts",
    );
    const relationType =
      typeof relation?.type === "function"
        ? (relation.type as () => unknown)()
        : relation?.type;
    const inverseProperty =
      typeof relation?.inverseSideProperty === "function"
        ? relation.inverseSideProperty({ camp: "camp" })
        : relation?.inverseSideProperty;

    expect(relationType).toBe(UserAccount);
    expect(inverseProperty).toBe("camp");
  });
});
