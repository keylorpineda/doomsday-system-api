import { getMetadataArgsStorage } from "typeorm";
import { AiAdmission } from "./ai-admission.entity";
import { Camp } from "../../camps/entities/camp.entity";
import { Person } from "../../users/entities/person.entity";
import { Profession } from "../../users/entities/profession.entity";
import { UserAccount } from "../../users/entities/user-account.entity";

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

const getColumns = (target: EntityConstructor) =>
  getMetadataArgsStorage().columns.filter((column) => column.target === target);

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

describe("AiAdmission entity", () => {
  it("should define properties and relations", () => {
    const entity = new AiAdmission();
    const camp = new Camp();
    const person = new Person();
    const suggestedProfession = new Profession();
    const reviewedBy = new UserAccount();
    const submissionDate = new Date("2026-03-23T00:00:00.000Z");
    const reviewDate = new Date("2026-03-24T00:00:00.000Z");

    entity.id = 1;
    entity.tracking_code = "ADM-001";
    entity.camp_id = 2;
    entity.person_id = 3;
    entity.candidate_data = { first_name: "Sarah", skills: ["medicine"] };
    entity.score = 88;
    entity.status = "PENDING_REVIEW";
    entity.suggested_decision = "RECOMMEND_ACCEPT";
    entity.suggested_profession_id = 4;
    entity.justification = "Great fit";
    entity.raw_ai_response = { source: "hybrid" };
    entity.reviewed_by_user_id = 5;
    entity.final_human_decision = "ACCEPTED";
    entity.admin_notes = "Approved by admin";
    entity.submission_date = submissionDate;
    entity.review_date = reviewDate;
    entity.camp = camp;
    entity.person = person;
    entity.suggestedProfession = suggestedProfession;
    entity.reviewedBy = reviewedBy;

    expect(entity).toEqual({
      id: 1,
      tracking_code: "ADM-001",
      camp_id: 2,
      person_id: 3,
      candidate_data: { first_name: "Sarah", skills: ["medicine"] },
      score: 88,
      status: "PENDING_REVIEW",
      suggested_decision: "RECOMMEND_ACCEPT",
      suggested_profession_id: 4,
      justification: "Great fit",
      raw_ai_response: { source: "hybrid" },
      reviewed_by_user_id: 5,
      final_human_decision: "ACCEPTED",
      admin_notes: "Approved by admin",
      submission_date: submissionDate,
      review_date: reviewDate,
      camp,
      person,
      suggestedProfession,
      reviewedBy,
    });

    expect(
      getRelations(AiAdmission).map((relation) => relation.propertyName),
    ).toEqual(
      expect.arrayContaining([
        "camp",
        "person",
        "suggestedProfession",
        "reviewedBy",
      ]),
    );
    expect(getRelationTypes(AiAdmission)).toEqual(
      expect.arrayContaining([Camp, Person, Profession, UserAccount]),
    );
    expect(
      resolveInverseProperties(AiAdmission, { aiAdmissions: "aiAdmissions" }),
    ).toEqual(expect.arrayContaining(["aiAdmissions"]));
  });

  it("should register submission_date metadata with a CURRENT_TIMESTAMP default", () => {
    const submissionDateColumn = getColumns(AiAdmission).find(
      (column) => column.propertyName === "submission_date",
    );

    expect(submissionDateColumn).toEqual(
      expect.objectContaining({
        propertyName: "submission_date",
        options: expect.objectContaining({
          type: "timestamptz",
          default: expect.any(Function),
        }),
      }),
    );
    expect((submissionDateColumn?.options.default as () => string)()).toBe(
      "CURRENT_TIMESTAMP",
    );
  });
});
