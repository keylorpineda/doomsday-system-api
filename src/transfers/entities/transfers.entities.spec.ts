import { getMetadataArgsStorage } from "typeorm";
import { Approval } from "./approval.entity";
import { IntercampRequest } from "./intercamp-request.entity";
import { RequestPersonDetail } from "./request-person-detail.entity";
import { RequestResourceDetail } from "./request-resource-detail.entity";
import { Camp } from "../../camps/entities/camp.entity";
import { Person } from "../../users/entities/person.entity";
import { UserAccount } from "../../users/entities/user-account.entity";
import { Resource } from "../../resources/entities/resource.entity";

type EntityConstructor = new (...args: unknown[]) => unknown;

const getRelations = (target: EntityConstructor) =>
  getMetadataArgsStorage().relations.filter(
    (relation) => relation.target === target,
  );

const getRelationTypes = (target: EntityConstructor) =>
  getRelations(target).map((relation) =>
    typeof relation.type === "function"
      ? (relation.type as () => unknown)()
      : relation.type,
  );

const resolveInverseProperties = (
  target: EntityConstructor,
  sample: Record<string, unknown>,
) =>
  getRelations(target)
    .map((relation) => relation.inverseSideProperty)
    .filter(
      (inverseSideProperty): inverseSideProperty is (object: any) => unknown =>
        typeof inverseSideProperty === "function",
    )
    .map((inverseSideProperty) => inverseSideProperty(sample));

describe("Transfers entities", () => {
  it("should define Approval properties and relations", () => {
    const entity = new Approval();
    const user = new UserAccount();
    const intercampRequest = new IntercampRequest();
    const approvalDate = new Date("2026-03-23T00:00:00.000Z");

    entity.id = 1;
    entity.user_id = 2;
    entity.entity_type = "intercamp_request";
    entity.entity_id = 3;
    entity.approval_date = approvalDate;
    entity.status = "approved";
    entity.user = user;
    entity.intercampRequest = intercampRequest;

    expect(entity).toEqual({
      id: 1,
      user_id: 2,
      entity_type: "intercamp_request",
      entity_id: 3,
      approval_date: approvalDate,
      status: "approved",
      user,
      intercampRequest,
    });
    expect(
      getRelations(Approval).map((relation) => relation.propertyName),
    ).toEqual(expect.arrayContaining(["user", "intercampRequest"]));
    expect(getRelationTypes(Approval)).toEqual(
      expect.arrayContaining([UserAccount, IntercampRequest]),
    );
    expect(
      resolveInverseProperties(Approval, { approvals: "approvals" }),
    ).toEqual(expect.arrayContaining(["approvals"]));
  });

  it("should define IntercampRequest properties and relations", () => {
    const entity = new IntercampRequest();
    const campOrigin = new Camp();
    const campDestination = new Camp();
    const resourceDetails = [new RequestResourceDetail()];
    const personDetails = [new RequestPersonDetail()];
    const approvals = [new Approval()];
    const requestDate = new Date("2026-03-23T00:00:00.000Z");

    entity.id = 1;
    entity.camp_origin_id = 10;
    entity.camp_destination_id = 20;
    entity.type = "both";
    entity.status = "pending";
    entity.request_date = requestDate;
    entity.notes = "nota";
    entity.campOrigin = campOrigin;
    entity.campDestination = campDestination;
    entity.resourceDetails = resourceDetails;
    entity.personDetails = personDetails;
    entity.approvals = approvals;

    expect(entity).toEqual({
      id: 1,
      camp_origin_id: 10,
      camp_destination_id: 20,
      type: "both",
      status: "pending",
      request_date: requestDate,
      notes: "nota",
      campOrigin,
      campDestination,
      resourceDetails,
      personDetails,
      approvals,
    });
    expect(
      getRelations(IntercampRequest).map((relation) => relation.propertyName),
    ).toEqual(
      expect.arrayContaining([
        "campOrigin",
        "campDestination",
        "resourceDetails",
        "personDetails",
        "approvals",
      ]),
    );
    expect(getRelationTypes(IntercampRequest)).toEqual(
      expect.arrayContaining([
        Camp,
        Camp,
        RequestResourceDetail,
        RequestPersonDetail,
        Approval,
      ]),
    );
    expect(
      resolveInverseProperties(IntercampRequest, {
        request: "request",
        intercampRequest: "intercampRequest",
      }),
    ).toEqual(
      expect.arrayContaining(["request", "request", "intercampRequest"]),
    );
  });

  it("should define RequestPersonDetail properties and relations", () => {
    const entity = new RequestPersonDetail();
    const request = new IntercampRequest();
    const person = new Person();

    entity.request_id = 1;
    entity.person_id = 2;
    entity.is_leader = true;
    entity.transfer_status = "completed";
    entity.request = request;
    entity.person = person;

    expect(entity).toEqual({
      request_id: 1,
      person_id: 2,
      is_leader: true,
      transfer_status: "completed",
      request,
      person,
    });
    expect(
      getRelations(RequestPersonDetail).map(
        (relation) => relation.propertyName,
      ),
    ).toEqual(expect.arrayContaining(["request", "person"]));
    expect(getRelationTypes(RequestPersonDetail)).toEqual(
      expect.arrayContaining([IntercampRequest, Person]),
    );
    expect(
      resolveInverseProperties(RequestPersonDetail, {
        personDetails: "personDetails",
      }),
    ).toEqual(expect.arrayContaining(["personDetails"]));
  });

  it("should define RequestResourceDetail properties and relations", () => {
    const entity = new RequestResourceDetail();
    const request = new IntercampRequest();
    const resource = new Resource();

    entity.request_id = 1;
    entity.resource_id = 2;
    entity.requested_quantity = 3;
    entity.approved_quantity = 2;
    entity.received_quantity = 2;
    entity.request = request;
    entity.resource = resource;

    expect(entity).toEqual({
      request_id: 1,
      resource_id: 2,
      requested_quantity: 3,
      approved_quantity: 2,
      received_quantity: 2,
      request,
      resource,
    });
    expect(
      getRelations(RequestResourceDetail).map(
        (relation) => relation.propertyName,
      ),
    ).toEqual(expect.arrayContaining(["request", "resource"]));
    expect(getRelationTypes(RequestResourceDetail)).toEqual(
      expect.arrayContaining([IntercampRequest, Resource]),
    );
    expect(
      resolveInverseProperties(RequestResourceDetail, {
        resourceDetails: "resourceDetails",
      }),
    ).toEqual(expect.arrayContaining(["resourceDetails"]));
  });
});
