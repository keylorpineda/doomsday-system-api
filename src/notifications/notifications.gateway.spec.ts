import type { JwtService } from "@nestjs/jwt";
import type { Socket } from "socket.io";

import { NotificationsGateway } from "./notifications.gateway";

const makeClient = (token?: string) => {
  const rooms = new Set<string>();
  return {
    id: "socket-1",
    handshake: { auth: { token }, headers: {} },
    data: {} as Record<string, unknown>,
    rooms,
    join: jest.fn((room: string) => rooms.add(room)),
    leave: jest.fn((room: string) => rooms.delete(room)),
    disconnect: jest.fn(),
  };
};

describe("NotificationsGateway", () => {
  let jwt: { verify: jest.Mock };
  let gateway: NotificationsGateway;
  let emit: jest.Mock;
  let to: jest.Mock;

  beforeEach(() => {
    jwt = { verify: jest.fn() };
    gateway = new NotificationsGateway(jwt as unknown as JwtService);
    emit = jest.fn();
    to = jest.fn(() => ({ emit }));
    gateway.server = { to } as unknown as NotificationsGateway["server"];
  });

  it("joins the room of the camp signed in the token (camp_id)", async () => {
    jwt.verify.mockReturnValue({ role: "worker", camp_id: 3 });
    const client = makeClient("t");

    await gateway.handleConnection(client as unknown as Socket);

    expect(client.join).toHaveBeenCalledWith("camp_3");
    expect(client.rooms.has("camp_undefined")).toBe(false);
  });

  it("disconnects clients without a valid token", async () => {
    const client = makeClient(undefined);
    await gateway.handleConnection(client as unknown as Socket);
    expect(client.disconnect).toHaveBeenCalled();
  });

  it("lets admins switch to any camp room", async () => {
    jwt.verify.mockReturnValue({ role: "admin", camp_id: 1 });
    const client = makeClient("t");
    await gateway.handleConnection(client as unknown as Socket);

    const result = gateway.handleCampJoin(client as unknown as Socket, {
      campId: 9,
    });

    expect(result).toEqual({ ok: true, campId: 9 });
    expect(client.rooms.has("camp_9")).toBe(true);
    expect(client.rooms.has("camp_1")).toBe(false);
  });

  it("refuses to let other roles join a foreign camp", async () => {
    jwt.verify.mockReturnValue({ role: "camp_leader", camp_id: 1 });
    const client = makeClient("t");
    await gateway.handleConnection(client as unknown as Socket);

    expect(
      gateway.handleCampJoin(client as unknown as Socket, { campId: 2 }),
    ).toEqual({ ok: false });
    expect(client.rooms.has("camp_1")).toBe(true);
  });

  it("emits camp.updated to the camp room", () => {
    gateway.emitCampUpdated(4, "inventory");
    expect(to).toHaveBeenCalledWith("camp_4");
    expect(emit).toHaveBeenCalledWith(
      "camp.updated",
      expect.objectContaining({ campId: 4, topic: "inventory" }),
    );
  });
});
