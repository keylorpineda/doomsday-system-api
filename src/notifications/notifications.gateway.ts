import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { Server } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@nestjs/common";
import { getAllowedOrigins } from "../common/config/cors.config";
import type { CampUpdateTopic } from "./camp-update.decorator";

/** Identidad del socket, tomada del JWT al conectar. */
interface SocketIdentity {
  role?: string;
  campId: number | null;
}

const roomOf = (campId: number | string) => `camp_${campId}`;

@WebSocketGateway({
  cors: {
    origin: getAllowedOrigins(),
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers["authorization"]?.replace("Bearer ", "");
      if (!token) {
        throw new Error("No token provided");
      }

      const payload = this.jwtService.verify(token);
      // El token firma el campamento como `camp_id` (ver AuthService); antes se
      // leía `campId`, que no existe, y todos caían en la sala "camp_undefined".
      const rawCampId = payload.camp_id ?? payload.campId;
      const campId =
        rawCampId === null || rawCampId === undefined
          ? null
          : Number(rawCampId);
      const identity: SocketIdentity = { role: payload.role, campId };
      client.data.identity = identity;

      if (campId !== null) {
        client.join(roomOf(campId));
        this.logger.log(`Client ${client.id} joined room ${roomOf(campId)}`);
      }
    } catch (error) {
      this.logger.error(
        `Client ${client.id} disconnected due to invalid token: ${error.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  /**
   * Cambia la sala del cliente al campamento que está viendo. El admin puede
   * ver cualquier campamento; el resto de roles sólo el propio.
   */
  @SubscribeMessage("camp.join")
  handleCampJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { campId?: number | string },
  ) {
    const identity = client.data.identity as SocketIdentity | undefined;
    const campId = Number(body?.campId);
    if (!identity || !Number.isInteger(campId) || campId <= 0) {
      return { ok: false };
    }
    const allowed = identity.role === "admin" || identity.campId === campId;
    if (!allowed) return { ok: false };

    for (const room of client.rooms) {
      if (room.startsWith("camp_")) client.leave(room);
    }
    client.join(roomOf(campId));
    return { ok: true, campId };
  }

  /** Avisa a un campamento que cambió un área de datos (ver @EmitCampUpdate). */
  emitCampUpdated(campId: number, topic: CampUpdateTopic) {
    this.server?.to(roomOf(campId)).emit("camp.updated", {
      campId,
      topic,
      timestamp: new Date().toISOString(),
    });
  }

  emitTransferRequest(campId: number, requestData: any) {
    this.server.to(roomOf(campId)).emit("transfer.requested", requestData);
  }

  emitInventoryAlerts(
    campId: number,
    alerts: Array<{
      resource_id: number;
      resource_name: string;
      current_quantity: number;
      minimum_stock_required: number;
    }>,
  ) {
    this.server.to(roomOf(campId)).emit("inventory.alert", {
      campId,
      alerts,
      timestamp: new Date().toISOString(),
    });
  }

  emitAlertCleared(campId: number) {
    this.server.to(roomOf(campId)).emit("inventory.alert", {
      campId,
      alerts: [],
      timestamp: new Date().toISOString(),
    });
  }
}
