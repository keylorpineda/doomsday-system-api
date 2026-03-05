# 🧟 Gestión del Fin — API Backend

API REST construida con **NestJS + TypeORM + PostgreSQL** para el sistema de gestión de campamentos en escenario apocalíptico.

---

## 🚀 Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Iniciar en modo desarrollo
npm run start:dev
```

La API estará disponible en `http://localhost:3000/api`  
Documentación Swagger: `http://localhost:3000/api/docs`

---

## 📁 Estructura del proyecto

```
src/
├── auth/                   # Autenticación JWT, sesiones (20 min inactividad)
│   ├── entities/
│   │   └── session.entity.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── users/                  # Personas, cuentas, roles, profesiones, asignaciones
│   ├── entities/
│   │   ├── person.entity.ts
│   │   ├── user-account.entity.ts
│   │   ├── role.entity.ts
│   │   ├── user-role.entity.ts
│   │   ├── profession.entity.ts
│   │   └── temporary-assignment.entity.ts
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── camps/                  # Campamentos (multiempresa)
│   ├── entities/
│   │   └── camp.entity.ts
│   ├── dto/
│   ├── camps.controller.ts
│   ├── camps.service.ts
│   └── camps.module.ts
│
├── resources/              # Inventario, movimientos, alertas
│   ├── entities/
│   │   ├── resource.entity.ts
│   │   ├── inventory.entity.ts
│   │   └── inventory-movement.entity.ts
│   ├── dto/
│   ├── resources.controller.ts
│   ├── resources.service.ts
│   └── resources.module.ts
│
├── explorations/           # Exploraciones y grupos
│   ├── entities/
│   │   ├── exploration.entity.ts
│   │   ├── exploration-person.entity.ts
│   │   └── exploration-resource.entity.ts
│   ├── dto/
│   ├── explorations.controller.ts
│   ├── explorations.service.ts
│   └── explorations.module.ts
│
├── transfers/              # Solicitudes entre campamentos, aprobaciones
│   ├── entities/
│   │   ├── intercamp-request.entity.ts
│   │   ├── request-resource-detail.entity.ts
│   │   ├── request-person-detail.entity.ts
│   │   └── approval.entity.ts
│   ├── dto/
│   ├── transfers.controller.ts
│   ├── transfers.service.ts
│   └── transfers.module.ts
│
├── dashboard/              # Métricas por campamento
│   ├── dashboard.controller.ts
│   ├── dashboard.service.ts
│   └── dashboard.module.ts
│
├── ai/                     # Integración con IA - admisiones
│   ├── entities/
│   │   └── ai-admission.entity.ts
│   ├── dto/
│   ├── ai.controller.ts
│   ├── ai.service.ts
│   └── ai.module.ts
│
├── common/                 # Guards, decorators, filtros compartidos
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   └── entities/
│       └── audit-log.entity.ts
│
├── app.module.ts
└── main.ts
```

---

## 🗄️ Entidades (mapeadas a la BD)

| Entidad | Módulo | Tabla |
|---|---|---|
| Camp | camps | camp |
| Profession | users | profession |
| Person | users | person |
| UserAccount | users | user_account |
| Role | users | role |
| UserRole | users | user_role |
| Session | auth | session |
| TemporaryAssignment | users | temporary_assignment |
| Resource | resources | resource |
| Inventory | resources | inventory |
| InventoryMovement | resources | inventory_movement |
| Exploration | explorations | exploration |
| ExplorationPerson | explorations | exploration_person |
| ExplorationResource | explorations | exploration_resource |
| IntercampRequest | transfers | intercamp_request |
| RequestResourceDetail | transfers | request_resource_detail |
| RequestPersonDetail | transfers | request_person_detail |
| Approval | transfers | approval |
| AuditLog | common | audit_log |
| AiAdmission | ai | ai_admission |

---

## 🔐 Roles del sistema

| Rol | Descripción |
|---|---|
| `admin_sistema` | Ve todo, gestiona ingresos de personas |
| `trabajador` | Cambios de inventario autorizados |
| `gestion_recursos` | Traslados y envíos de recursos |
| `encargado_viajes` | Expediciones y negociaciones intercampamento |

---

## 📡 Endpoints planeados (v1)

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout

GET    /api/v1/camps
GET    /api/v1/camps/:id

GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id

GET    /api/v1/resources
POST   /api/v1/resources
GET    /api/v1/resources/inventory/:campId

GET    /api/v1/explorations
POST   /api/v1/explorations

GET    /api/v1/transfers
POST   /api/v1/transfers

GET    /api/v1/dashboard/:campId

POST   /api/v1/ai/evaluate-admission
```

---

## 🛠️ Variables de entorno

Ver `.env.example` para configuración completa.
