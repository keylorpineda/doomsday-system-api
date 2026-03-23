import { getMetadataArgsStorage } from "typeorm";
import { AuditLog } from "./audit-log.entity";
import { UserAccount } from "../../users/entities/user-account.entity";
import { Camp } from "../../camps/entities/camp.entity";

describe("AuditLog entity", () => {
  it("should define properties and relations metadata", () => {
    const entity = new AuditLog();
    const user = new UserAccount();
    const camp = new Camp();
    const now = new Date("2026-03-23T00:00:00.000Z");

    entity.id = 1;
    entity.user_id = 10;
    entity.camp_id = 20;
    entity.action = "UPDATE";
    entity.entity_type = "resource";
    entity.entity_id = 30;
    entity.old_value = { name: "before" };
    entity.new_value = { name: "after" };
    entity.date = now;
    entity.user = user;
    entity.camp = camp;

    expect(entity).toEqual({
      id: 1,
      user_id: 10,
      camp_id: 20,
      action: "UPDATE",
      entity_type: "resource",
      entity_id: 30,
      old_value: { name: "before" },
      new_value: { name: "after" },
      date: now,
      user,
      camp,
    });

    const relations = getMetadataArgsStorage().relations.filter(
      (item) => item.target === AuditLog,
    );
    const userRelation = relations.find((item) => item.propertyName === "user");
    const campRelation = relations.find((item) => item.propertyName === "camp");

    const userType =
      typeof userRelation?.type === "function"
        ? (userRelation.type as () => unknown)()
        : userRelation?.type;
    const campType =
      typeof campRelation?.type === "function"
        ? (campRelation.type as () => unknown)()
        : campRelation?.type;

    expect(userType).toBe(UserAccount);
    expect(campType).toBe(Camp);
  });
});
