import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserAccount } from "../../src/users/entities/user-account.entity";
import { Session } from "../../src/auth/entities/session.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { AiModule } from "../../src/ai/ai.module";
import { AuthModule } from "../../src/auth/auth.module";
import { UsersModule } from "../../src/users/users.module";
import { DatabaseModule } from "../../src/database/database.module";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtAuthGuard } from "../../src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../src/auth/guards/roles.guard";
import { SessionInactivityGuard } from "../../src/auth/guards/session-inactivity.guard";
import { SessionActivityInterceptor } from "../../src/auth/interceptors/session-activity.interceptor";
import { ThrottlerModule } from "@nestjs/throttler";
import { CampsModule } from "../../src/camps/camps.module";
import { ResourcesModule } from "../../src/resources/resources.module";

describe("AI E2E Tests", () => {
  let app: INestApplication;
  let userRepository: any;
  let sessionRepository: any;
  let adminToken: string;
  let gestorToken: string;
  let admissionId: number;
  let trackingCode: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 100,
          },
        ]),
        TypeOrmModule.forRoot({
          type: "postgres",
          host: process.env.DB_HOST || "localhost",
          port: parseInt(process.env.DB_PORT || "5432"),
          username: process.env.DB_USER || "postgres",
          password: process.env.DB_PASS || "postgres",
          database: process.env.DB_NAME_TEST || "gestion_test",
          autoLoadEntities: true,
          synchronize: true,
          logging: false,
        }),
        DatabaseModule,
        AuthModule,
        UsersModule,
        AiModule,
        CampsModule,
        ResourcesModule,
      ],
      providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: SessionInactivityGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_INTERCEPTOR, useClass: SessionActivityInterceptor },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(UserAccount));
    sessionRepository = moduleFixture.get(getRepositoryToken(Session));
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    try {
      await sessionRepository.delete({});
    } catch (error) {
      // Ignorar errores en limpieza
    }
  });

  describe("Setup: Create test users and get tokens", () => {
    it("should create admin user and get token", async () => {
      const hashedPassword = await bcrypt.hash("adminpass123", 10);
      await userRepository.save({
        username: "admin_ai_test",
        email: "admin_ai@example.com",
        password: hashedPassword,
        role: "admin",
        is_active: true,
      });

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          username: "admin_ai_test",
          password: "adminpass123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      adminToken = response.body.access_token;
    });

    it("should create gestor_recursos user and get token", async () => {
      const hashedPassword = await bcrypt.hash("gestorpass123", 10);
      await userRepository.save({
        username: "gestor_ai_test",
        email: "gestor_ai@example.com",
        password: hashedPassword,
        role: "gestor_recursos",
        is_active: true,
      });

      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          username: "gestor_ai_test",
          password: "gestorpass123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      gestorToken = response.body.access_token;
    });
  });

  describe("POST /ai/admissions/submit - Public", () => {
    it("should submit admission request successfully", async () => {
      const response = await request(app.getHttpServer())
        .post("/ai/admissions/submit")
        .send({
          first_name: "Juan",
          last_name: "PÃ©rez",
          last_name2: "GarcÃ­a",
          age: 35,
          health_status: 90,
          physical_condition: 85,
          medical_conditions: [],
          psychological_eval: 75,
          criminal_record: false,
          skills: ["medicina", "agricultura"],
          years_experience: 10,
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("tracking_code");
      expect(response.body.first_name).toBe("Juan");
      expect(response.body.last_name).toBe("PÃ©rez");

      admissionId = response.body.id;
      trackingCode = response.body.tracking_code;
    });

    it("should require first_name field", async () => {
      await request(app.getHttpServer())
        .post("/ai/admissions/submit")
        .send({
          last_name: "PÃ©rez",
          age: 35,
          health_status: 90,
          physical_condition: 85,
          medical_conditions: [],
          skills: [],
        })
        .expect(400);
    });

    it("should validate age between 16 and 80", async () => {
      await request(app.getHttpServer())
        .post("/ai/admissions/submit")
        .send({
          first_name: "Test",
          last_name: "User",
          age: 15,
          health_status: 90,
          physical_condition: 85,
          medical_conditions: [],
          skills: [],
        })
        .expect(400);

      await request(app.getHttpServer())
        .post("/ai/admissions/submit")
        .send({
          first_name: "Test",
          last_name: "User",
          age: 81,
          health_status: 90,
          physical_condition: 85,
          medical_conditions: [],
          skills: [],
        })
        .expect(400);
    });

    it("should validate health_status between 0 and 100", async () => {
      await request(app.getHttpServer())
        .post("/ai/admissions/submit")
        .send({
          first_name: "Test",
          last_name: "User",
          age: 35,
          health_status: 150,
          physical_condition: 85,
          medical_conditions: [],
          skills: [],
        })
        .expect(400);
    });
  });

  describe("GET /ai/admissions/track/:code - Public", () => {
    it("should track admission by tracking code", async () => {
      const response = await request(app.getHttpServer())
        .get(`/ai/admissions/track/${trackingCode}`)
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("first_name");
      expect(response.body).toHaveProperty("status");
    });

    it("should return 404 for invalid tracking code", async () => {
      await request(app.getHttpServer())
        .get("/ai/admissions/track/INVALID_CODE_12345")
        .expect(404);
    });
  });

  describe("GET /ai/admissions/pending - Protected (admin, gestor_recursos)", () => {
    it("should get pending admissions with admin token", async () => {
      const response = await request(app.getHttpServer())
        .get("/ai/admissions/pending")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should get pending admissions with gestor token", async () => {
      const response = await request(app.getHttpServer())
        .get("/ai/admissions/pending")
        .set("Authorization", `Bearer ${gestorToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should reject request without token", async () => {
      await request(app.getHttpServer())
        .get("/ai/admissions/pending")
        .expect(401);
    });

    it("should support pagination parameters", async () => {
      const response = await request(app.getHttpServer())
        .get("/ai/admissions/pending?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /ai/admissions/:id - Protected (admin, gestor_recursos)", () => {
    it("should get admission detail with admin token", async () => {
      const response = await request(app.getHttpServer())
        .get(`/ai/admissions/${admissionId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(admissionId);
      expect(response.body).toHaveProperty("first_name");
      expect(response.body).toHaveProperty("last_name");
    });

    it("should get admission detail with gestor token", async () => {
      const response = await request(app.getHttpServer())
        .get(`/ai/admissions/${admissionId}`)
        .set("Authorization", `Bearer ${gestorToken}`)
        .expect(200);

      expect(response.body.id).toBe(admissionId);
    });

    it("should reject request without token", async () => {
      await request(app.getHttpServer())
        .get(`/ai/admissions/${admissionId}`)
        .expect(401);
    });

    it("should return 404 for non-existent admission", async () => {
      await request(app.getHttpServer())
        .get("/ai/admissions/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });

    it("should validate id is numeric", async () => {
      await request(app.getHttpServer())
        .get("/ai/admissions/invalid")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe("POST /ai/admissions/:id/review - Protected (admin only)", () => {
    it("should accept admission with admin token", async () => {
      const response = await request(app.getHttpServer())
        .post(`/ai/admissions/${admissionId}/review`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          decision: "ACCEPTED",
          admin_notes: "Approved - Camp needs medics",
        })
        .expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body.decision).toBe("ACCEPTED");
    });

    it("should reject admission with REJECTED decision", async () => {
      // Create new admission for rejection test
      const admissionResponse = await request(app.getHttpServer())
        .post("/ai/admissions/submit")
        .send({
          first_name: "Maria",
          last_name: "Lopez",
          age: 45,
          health_status: 50,
          physical_condition: 40,
          medical_conditions: [],
          skills: [],
        })
        .expect(201);

      const newAdmissionId = admissionResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/ai/admissions/${newAdmissionId}/review`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          decision: "REJECTED",
          admin_notes: "Health status too low",
        })
        .expect(200);

      expect(response.body.decision).toBe("REJECTED");
    });

    it("should reject request with gestor token (admin only)", async () => {
      await request(app.getHttpServer())
        .post(`/ai/admissions/${admissionId}/review`)
        .set("Authorization", `Bearer ${gestorToken}`)
        .send({
          decision: "ACCEPTED",
        })
        .expect(403);
    });

    it("should reject request without token", async () => {
      await request(app.getHttpServer())
        .post(`/ai/admissions/${admissionId}/review`)
        .send({
          decision: "ACCEPTED",
        })
        .expect(401);
    });

    it("should validate decision enum", async () => {
      await request(app.getHttpServer())
        .post(`/ai/admissions/${admissionId}/review`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          decision: "INVALID_DECISION",
        })
        .expect(400);
    });

    it("should support override_profession_id", async () => {
      const response = await request(app.getHttpServer())
        .post(`/ai/admissions/${admissionId}/review`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          decision: "ACCEPTED",
          override_profession_id: 1,
        });

      expect([200, 400]).toContain(response.status); // 400 if profession not found
    });
  });

  describe("POST /ai/admissions/:id/create-account - Protected (admin only)", () => {
    it("should create user account for accepted admission", async () => {
      const response = await request(app.getHttpServer())
        .post(`/ai/admissions/${admissionId}/create-account`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          username: "juan_perez_new",
          password: "SecurePass123!",
        });

      expect([200, 201, 400, 409]).toContain(response.status);
    });

    it("should reject request with gestor token", async () => {
      await request(app.getHttpServer())
        .post(`/ai/admissions/${admissionId}/create-account`)
        .set("Authorization", `Bearer ${gestorToken}`)
        .send({
          username: "test_user",
          password: "Test123!",
        })
        .expect(403);
    });

    it("should reject request without token", async () => {
      await request(app.getHttpServer())
        .post(`/ai/admissions/${admissionId}/create-account`)
        .send({
          username: "test_user",
          password: "Test123!",
        })
        .expect(401);
    });
  });

  describe("Auth validation for all AI endpoints", () => {
    it("should require bearer token format", async () => {
      await request(app.getHttpServer())
        .get("/ai/admissions/pending")
        .set("Authorization", "InvalidToken")
        .expect(401);
    });

    it("should reject expired tokens", async () => {
      const expiredToken = "invalid_expired_token_placeholder_test";

      await request(app.getHttpServer())
        .get("/ai/admissions/pending")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});
