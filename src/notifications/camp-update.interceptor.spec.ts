import type { CallHandler, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { lastValueFrom, of, throwError } from "rxjs";

import { CAMP_UPDATE_TOPIC } from "./camp-update.decorator";
import { CampUpdateInterceptor } from "./camp-update.interceptor";
import type { NotificationsGateway } from "./notifications.gateway";

const httpContext = (
  request: Record<string, unknown>,
  topics?: string[],
): ExecutionContext => {
  const handler = () => undefined;
  if (topics) Reflect.defineMetadata(CAMP_UPDATE_TOPIC, topics, handler);
  return {
    getType: () => "http",
    getHandler: () => handler,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
};

const handlerReturning = (value: unknown): CallHandler => ({
  handle: () => of(value),
});

describe("CampUpdateInterceptor", () => {
  let gateway: { emitCampUpdated: jest.Mock };
  let interceptor: CampUpdateInterceptor;

  beforeEach(() => {
    gateway = { emitCampUpdated: jest.fn() };
    interceptor = new CampUpdateInterceptor(
      new Reflector(),
      gateway as unknown as NotificationsGateway,
    );
  });

  it("does nothing for endpoints without @EmitCampUpdate", async () => {
    await lastValueFrom(
      interceptor.intercept(
        httpContext({ params: { campId: "3" } }),
        handlerReturning({}),
      ),
    );
    expect(gateway.emitCampUpdated).not.toHaveBeenCalled();
  });

  it("notifies every camp found in params, body, user and response", async () => {
    const ctx = httpContext(
      {
        params: { campId: "2" },
        body: { camp_destination_id: 5 },
        user: { camp_id: 2 },
      },
      ["transfers", "inventory"],
    );

    await lastValueFrom(
      interceptor.intercept(
        ctx,
        handlerReturning({ data: { camp_origin_id: 7 } }),
      ),
    );

    const calls = gateway.emitCampUpdated.mock.calls.map(
      ([camp, topic]) => `${camp}:${topic}`,
    );
    expect(calls.sort()).toEqual(
      [
        "2:inventory",
        "2:transfers",
        "5:inventory",
        "5:transfers",
        "7:inventory",
        "7:transfers",
      ].sort(),
    );
  });

  it("reads the camp of a nested person", async () => {
    await lastValueFrom(
      interceptor.intercept(
        httpContext({}, ["persons"]),
        handlerReturning({ person: { camp_id: 4 } }),
      ),
    );
    expect(gateway.emitCampUpdated).toHaveBeenCalledWith(4, "persons");
  });

  it("ignores invalid camp ids", async () => {
    await lastValueFrom(
      interceptor.intercept(
        httpContext({ body: { camp_id: "abc" }, user: { camp_id: null } }, [
          "inventory",
        ]),
        handlerReturning(null),
      ),
    );
    expect(gateway.emitCampUpdated).not.toHaveBeenCalled();
  });

  it("does not notify when the request fails", async () => {
    const failing: CallHandler = {
      handle: () => throwError(() => new Error("boom")),
    };
    await expect(
      lastValueFrom(
        interceptor.intercept(
          httpContext({ params: { campId: "1" } }, ["inventory"]),
          failing,
        ),
      ),
    ).rejects.toThrow("boom");
    expect(gateway.emitCampUpdated).not.toHaveBeenCalled();
  });

  it("never breaks the response if notifying throws", async () => {
    gateway.emitCampUpdated.mockImplementation(() => {
      throw new Error("socket down");
    });
    const result = await lastValueFrom(
      interceptor.intercept(
        httpContext({ params: { campId: "1" } }, ["inventory"]),
        handlerReturning({ ok: true }),
      ),
    );
    expect(result).toEqual({ ok: true });
  });
});
