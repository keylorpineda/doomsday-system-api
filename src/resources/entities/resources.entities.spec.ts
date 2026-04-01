import { getMetadataArgsStorage } from "typeorm";
import { DailyConsumption } from "./daily-consumption.entity";
import { DailyProduction } from "./daily-production.entity";
import { InventoryMovement } from "./inventory-movement.entity";
import { Inventory } from "./inventory.entity";
import { Resource } from "./resource.entity";
import { Camp } from "../../camps/entities/camp.entity";
import { Person } from "../../users/entities/person.entity";
import { Profession } from "../../users/entities/profession.entity";
import { UserAccount } from "../../users/entities/user-account.entity";

const getEntityRelations = (target: Function) =>
  getMetadataArgsStorage().relations.filter((relation) => relation.target === target);

const resolveRelationTypes = (target: Function) =>
  getEntityRelations(target).map((relation) => {
    const relationType = relation.type;

    return typeof relationType === "function"
      ? (relationType as () => unknown)()
      : relationType;
  });

const resolveInverseProperties = (target: Function, sample: Record<string, unknown>) =>
  getEntityRelations(target)
    .map((relation) => relation.inverseSideProperty)
    .filter((inverseSideProperty): inverseSideProperty is (object: any) => unknown =>
      typeof inverseSideProperty === "function",
    )
    .map((inverseSideProperty) => inverseSideProperty(sample));

describe("Resources entities", () => {
  it("should define DailyConsumption properties and relations", () => {
    const entity = new DailyConsumption();
    const camp = new Camp();
    const person = new Person();
    const resource = new Resource();

    entity.id = 1;
    entity.camp_id = 2;
    entity.person_id = 3;
    entity.resource_id = 4;
    entity.daily_ration = 1.5;
    entity.camp = camp;
    entity.person = person;
    entity.resource = resource;

    expect(entity).toEqual({
      id: 1,
      camp_id: 2,
      person_id: 3,
      resource_id: 4,
      daily_ration: 1.5,
      camp,
      person,
      resource,
    });

    const relations = getEntityRelations(DailyConsumption).map(
      (relation) => relation.propertyName,
    );
    const relationTypes = resolveRelationTypes(DailyConsumption);

    expect(relations).toEqual(
      expect.arrayContaining(["camp", "person", "resource"]),
    );
    expect(relationTypes).toEqual(
      expect.arrayContaining([Camp, Person, Resource]),
    );
  });

  it("should define DailyProduction properties and relations", () => {
    const entity = new DailyProduction();
    const camp = new Camp();
    const profession = new Profession();
    const resource = new Resource();

    entity.id = 1;
    entity.camp_id = 2;
    entity.profession_id = 3;
    entity.resource_id = 4;
    entity.base_production = 9;
    entity.camp = camp;
    entity.profession = profession;
    entity.resource = resource;

    expect(entity).toEqual({
      id: 1,
      camp_id: 2,
      profession_id: 3,
      resource_id: 4,
      base_production: 9,
      camp,
      profession,
      resource,
    });

    const relations = getEntityRelations(DailyProduction).map(
      (relation) => relation.propertyName,
    );
    const relationTypes = resolveRelationTypes(DailyProduction);

    expect(relations).toEqual(
      expect.arrayContaining(["camp", "profession", "resource"]),
    );
    expect(relationTypes).toEqual(
      expect.arrayContaining([Camp, Profession, Resource]),
    );
  });

  it("should define InventoryMovement properties and relations", () => {
    const entity = new InventoryMovement();
    const resource = new Resource();
    const user = new UserAccount();
    const camp = new Camp();
    const date = new Date("2026-03-23T00:00:00.000Z");

    entity.id = 1;
    entity.resource_id = 2;
    entity.camp_id = 3;
    entity.quantity = 4;
    entity.type = "income";
    entity.description = "Ingreso";
    entity.date = date;
    entity.user_id = 5;
    entity.resource = resource;
    entity.user = user;
    entity.camp = camp;

    expect(entity).toEqual({
      id: 1,
      resource_id: 2,
      camp_id: 3,
      quantity: 4,
      type: "income",
      description: "Ingreso",
      date,
      user_id: 5,
      resource,
      user,
      camp,
    });

    const relations = getEntityRelations(InventoryMovement).map(
      (relation) => relation.propertyName,
    );
    const relationTypes = resolveRelationTypes(InventoryMovement);
    const inverseProperties = resolveInverseProperties(InventoryMovement, {
      movements: "movements",
    });

    expect(relations).toEqual(
      expect.arrayContaining(["resource", "user", "camp"]),
    );
    expect(relationTypes).toEqual(
      expect.arrayContaining([Resource, UserAccount, Camp]),
    );
    expect(inverseProperties).toEqual(expect.arrayContaining(["movements"]));
  });

  it("should define Inventory properties and relations", () => {
    const entity = new Inventory();
    const camp = new Camp();
    const resource = new Resource();
    const date = new Date("2026-03-23T00:00:00.000Z");

    entity.camp_id = 1;
    entity.resource_id = 2;
    entity.current_quantity = 10;
    entity.minimum_stock_required = 3;
    entity.alert_active = false;
    entity.last_update = date;
    entity.camp = camp;
    entity.resource = resource;

    expect(entity).toEqual({
      camp_id: 1,
      resource_id: 2,
      current_quantity: 10,
      minimum_stock_required: 3,
      alert_active: false,
      last_update: date,
      camp,
      resource,
    });

    const relations = getEntityRelations(Inventory).map(
      (relation) => relation.propertyName,
    );
    const relationTypes = resolveRelationTypes(Inventory);
    const inverseProperties = resolveInverseProperties(Inventory, {
      inventories: "inventories",
    });

    expect(relations).toEqual(expect.arrayContaining(["camp", "resource"]));
    expect(relationTypes).toEqual(expect.arrayContaining([Camp, Resource]));
    expect(inverseProperties).toEqual(expect.arrayContaining(["inventories"]));
  });

  it("should define Resource properties and relations", () => {
    const entity = new Resource();
    const inventories = [new Inventory()];
    const movements = [new InventoryMovement()];

    entity.id = 1;
    entity.name = "Agua";
    entity.unit = "litros";
    entity.category = "water";
    entity.image_url = "https://example.com/resource.png";
    entity.image_public_id = "resource-public-id";
    entity.description = "Reserva";
    entity.inventories = inventories;
    entity.movements = movements;

    expect(entity).toEqual({
      id: 1,
      name: "Agua",
      unit: "litros",
      category: "water",
      image_url: "https://example.com/resource.png",
      image_public_id: "resource-public-id",
      description: "Reserva",
      inventories,
      movements,
    });

    const relations = getEntityRelations(Resource).map(
      (relation) => relation.propertyName,
    );
    const relationTypes = resolveRelationTypes(Resource);
    const inverseProperties = resolveInverseProperties(Resource, {
      resource: "resource",
    });

    expect(relations).toEqual(
      expect.arrayContaining(["inventories", "movements"]),
    );
    expect(relationTypes).toEqual(
      expect.arrayContaining([Inventory, InventoryMovement]),
    );
    expect(inverseProperties).toEqual(
      expect.arrayContaining(["resource", "resource"]),
    );
  });
});