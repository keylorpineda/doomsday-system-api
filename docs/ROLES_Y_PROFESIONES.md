# 🧑‍💼 Roles y Profesiones - Guía del Sistema

## 📖 Conceptos Clave

### 🔧 Profesiones (Trabajos/Oficios)
Las **profesiones** definen **QUÉ HACE** una persona dentro del campamento en el contexto del apocalipsis zombie.

**Ubicación**: `src/users/entities/profession.entity.ts`

**Profesiones disponibles** (definidas en `professions.constants.ts`):

| Profesión | Puede Explorar | Mínimo Requerido | Producción Diaria |
|-----------|----------------|------------------|-------------------|
| Recolector | ✅ | 2 | 10 comida |
| Aguatero | ❌ | 2 | 15 agua |
| Explorador | ✅ | 1 | 5 comida |
| Guardia | ❌ | 2 | - |
| Médico | ❌ | 1 | - |
| Ingeniero | ❌ | 1 | 5 agua |
| Cocinero | ❌ | 1 | 3 comida |
| Almacenista | ❌ | 1 | - |
| Agricultor | ❌ | 1 | 8 comida |
| Constructor | ❌ | 1 | - |

**Características**:
- `can_explore`: Define si puede participar en expediciones
- `minimum_active_required`: Mínimo de trabajadores activos necesarios
- Producción diaria: Recursos que generan al trabajar

---

### 🔐 Roles (Permisos del Sistema)
Los **roles** definen **QUÉ PUEDE HACER** un usuario en el sistema web.

**Ubicación**: `src/users/entities/role.entity.ts`

**Roles disponibles** (4 obligatorios + 2 adicionales justificados):

#### 🔵 ROLES OBLIGATORIOS (Enunciado del Proyecto)

#### 1. `admin` - Administrador del Sistema
- ✅ Acceso completo al sistema
- ✅ Gestiona ingresos de nuevas personas (admisiones con IA)
- ✅ Ve todos los campamentos
- ✅ Administra profesiones y usuarios
- ✅ Crea campamentos

**Uso en código**:
```typescript
@Roles('admin')
@Post('admissions/:trackingCode/review')
async reviewAdmission(...) { }
```

#### 2. `trabajador` - Trabajador
- ✅ Ve inventario del campamento
- ✅ Ajusta producción diaria (si no cumple objetivo)
- ✅ Ve sus recursos asignados
- ⛔ No puede aprobar cambios (requiere autorización)

**Uso en código**:
```typescript
@Roles('admin', 'gestor_recursos', 'trabajador')
@Patch('inventory/:campId/:resourceId')
async updateInventory(...) { }
```

#### 3. `gestor_recursos` - Gestión de Recursos
- ✅ Gestiona inventario completo
- ✅ Crea y aprueba transferencias entre campamentos
- ✅ Ve alertas de recursos
- ✅ Autoriza cambios de trabajadores
- ✅ Acceso al dashboard

**Uso en código**:
```typescript
@Roles('admin', 'gestor_recursos')
@Get('inventory/:campId/alerts')
async getAlerts(...) { }
```

#### 4. `encargado_viajes` - Encargado de Viajes y Comunicación
- ✅ Crea y gestiona exploraciones
- ✅ Forma grupos de exploración
- ✅ Solicita y negocia con otros campamentos
- ✅ Gestiona transferencias de personas y recursos

**Uso en código**:
```typescript
@Roles('admin', 'encargado_viajes')
@Post('explorations')
async createExploration(...) { }
```

---

#### 🟢 ROLES ADICIONALES (Justificados)

#### 5. `lider_campamento` - Líder de Campamento
**Justificación**: Sistema multi-campamento requiere gestión local sin acceso global.

- ✅ Administra SU campamento específico
- ✅ Aprueba admisiones locales
- ✅ Gestiona recursos de su campamento
- ✅ Ve dashboard de su campamento
- ✅ Aprueba transferencias que involucren su campamento
- ⛔ No puede ver otros campamentos
- ⛔ No puede crear campamentos

**Diferencia con admin**:
- `admin` → Acceso GLOBAL a todos los campamentos
- `lider_campamento` → Acceso LOCAL solo a su campamento

**Uso en código**:
```typescript
@Roles('admin', 'lider_campamento')
@Post('admissions/:trackingCode/review')
async reviewAdmission(
  @CurrentUser() user: { campId: number },
  ...
) {
  // lider_campamento solo puede aprobar de SU campamento
  // admin puede aprobar de cualquier campamento
}
```

#### 6. `supervisor` - Supervisor/Auditor
**Justificación**: El enunciado requiere información de auditoría ("debe haber información para su auditoría siempre").

- ✅ Ve todos los logs de auditoría
- ✅ Ve todas las transferencias (readonly)
- ✅ Ve todas las exploraciones (readonly)
- ✅ Ve movimientos de inventario (readonly)
- ✅ Genera reportes de auditoría
- ⛔ No puede modificar NADA (solo lectura)

**Uso en código**:
```typescript
@Roles('admin', 'supervisor')
@Get('audit-logs')
async getAuditLogs(...) { }

// supervisor puede ver PERO NO puede ejecutar esto:
@Patch('transfers/:id/approve')
@Roles('admin', 'gestor_recursos')  // supervisor NO está aquí
async approveTransfer(...) { }
```

---

## 🔄 Asignaciones Temporales

Cuando una **profesión** se queda sin trabajadores activos (por enfermedad, heridas, viajes), se pueden hacer **asignaciones temporales**.

**Entidad**: `TemporaryAssignment`
**Vista**: `ActiveTemporaryAssignmentView`

### Ejemplo:
```typescript
// Si el único Médico se enferma, temporalmente se asigna a un Ingeniero
{
  person_id: 15,
  profession_origin_id: 6,      // Ingeniero
  profession_temporary_id: 5,   // Médico (temporal)
  start_date: '2026-03-11',
  end_date: '2026-03-18',       // 7 días
  reason: 'Médico principal enfermo - cobertura temporal'
}
```

---

## 🎯 Ejemplo Completo

### Persona: "Ana García"
```typescript
Person {
  id: 42,
  first_name: "Ana",
  last_name: "García",
  profession_id: 5,          // Médico (profesión)
  status: "active",
  can_work: true,
  experience_level: 3
}
```

### Cuenta de Usuario: "ana.garcia"
```typescript
UserAccount {
  id: 101,
  person_id: 42,
  username: "ana.garcia",
  email: "ana.garcia@camp1.survivor",
  camp_id: 1,
  role_id: 3                 // gestor_recursos (rol del sistema)
}
```

**Resultado**: 
- Ana es **Médico** (su trabajo en el campamento)
- Ana tiene rol **gestor_recursos** (puede gestionar inventario y transferencias en el sistema)

---

## 🚀 Flujo de Autenticación y Autorización

### 1. Login
```typescript
POST /auth/login
{
  "email": "ana.garcia@camp1.survivor",
  "password": "..."
}
```

### 2. Token JWT incluye:
```json
{
  "userId": 101,
  "campId": 1,
  "role": "gestor_recursos",    // <-- Este es el ROL del sistema
  "personId": 42
}
```

### 3. Guards verifican el rol:
```typescript
// RolesGuard verifica si el usuario tiene el rol necesario
@Roles('gestor_recursos')
@Get('inventory/:campId/alerts')
async getAlerts(@Param('campId') campId: number) {
  // Solo usuarios con rol gestor_recursos pueden acceder
}
```

---

## 📁 Archivos Importantes

### Roles
- **Entity**: `src/users/entities/role.entity.ts`
- **Constantes**: `src/users/constants/roles.constants.ts` ✨ NUEVO
- **Seeder**: `src/users/seeders/roles.seeder.ts` ✨ NUEVO  
- **Guard**: `src/auth/guards/roles.guard.ts`
- **Decorator**: `src/auth/decorators/roles.decorator.ts`

### Profesiones
- **Entity**: `src/users/entities/profession.entity.ts`
- **Constantes**: `src/users/constants/professions.constants.ts`
- **Seeder**: `src/users/seeders/professions.seeder.ts`

### Asignaciones Temporales
- **Entity**: `src/users/entities/temporary-assignment.entity.ts`
- **Vista**: `src/database/views/active-temporary-assignment.view.ts`
- **Service**: `src/users/services/assignments.service.ts`

---

## ⚙️ Inicialización del Sistema

Al iniciar la aplicación, los seeders se ejecutan automáticamente:

1. **RolesSeeder**: Crea los 4 roles del sistema en la BD
2. **ProfessionsSeeder**: Crea las 10 profesiones iniciales en la BD

Ambos verifican si ya existen datos antes de insertar (idempotentes).

---

## 🔧 Gestión Dinámica

### ✅ PROFESIONES - Se pueden crear desde el sistema

**Endpoint**: `POST /users/professions`  
**Permiso**: Solo `admin`

```typescript
POST /users/professions
Authorization: Bearer <token>

{
  "name": "Electricista",
  "can_explore": false,
  "minimum_active_required": 1
}
```

**Otros endpoints disponibles**:
- `GET /users/professions` - Listar todas las profesiones
- `GET /users/professions/:id` - Ver detalles de una profesión
- `GET /users/professions/alerts/needing-workers` - Profesiones con déficit de trabajadores
- `GET /users/professions/alerts/with-excess` - Profesiones con exceso de trabajadores

**Por qué se permite**: Las profesiones son parte del **dominio del negocio**. En un apocalipsis zombie pueden surgir nuevas necesidades de trabajo (ej: "Rastreador de zombies", "Fortificador", etc.).

---

### ❌ ROLES - NO se pueden crear desde el sistema

**Los roles son FIJOS** y se definen en el código:
- `admin` (Administrador del Sistema)
- `trabajador` (Trabajador)
- `gestor_recursos` (Gestión de Recursos)
- `encargado_viajes` (Encargado de Viajes y Comunicación)
- `lider_campamento` (Líder de Campamento) ✨ NUEVO
- `supervisor` (Supervisor/Auditor) ✨ NUEVO

**No hay endpoints** para crear, modificar o eliminar roles.

**Por qué NO se permite**: Los roles son parte del **sistema de seguridad**. Crear roles dinámicamente podría comprometer la seguridad del sistema. Los permisos están definidos en el código y asociados a cada rol de forma estática.

**Alternativa**: Si necesitas un nuevo rol, debes:
1. Agregarlo en `src/users/constants/roles.constants.ts`
2. El seeder lo creará automáticamente al reiniciar la aplicación
3. Actualizar los guards y decoradores según sea necesario

---

## 💡 Ejemplo de Uso Completo

### Escenario: El campamento necesita un nuevo tipo de trabajo

```typescript
// 1. El admin crea una nueva profesión desde el frontend
POST /users/professions
Authorization: Bearer <admin-token>

{
  "name": "Rastreador de Rutas",
  "can_explore": true,
  "minimum_active_required": 2
}

// Respuesta:
{
  "id": 11,
  "name": "Rastreador de Rutas",
  "can_explore": true,
  "minimum_active_required": 2
}

// 2. Al ingresar una nueva persona, la IA puede asignarle esta profesión
POST /ai/admissions/submit
{
  "camp_id": 1,
  "candidate_data": {
    "first_name": "Carlos",
    "last_name": "Ruiz",
    "previous_skills": "Guía de montaña, navegación, cartografía"
  }
}

// Respuesta de la IA:
{
  "suggested_profession_id": 11,  // ← La IA sugiere "Rastreador de Rutas"
  "justification": "Experiencia en navegación y cartografía lo hace ideal para rastrear rutas seguras"
}

// 3. El admin revisa y acepta
POST /ai/admissions/ABC123/review
{
  "decision": "ACCEPTED"
}

// 4. Se crea la persona con la nueva profesión
// 5. Se crea la cuenta de usuario con un rol (ej: "trabajador")
```

---

## ✅ Resumen

| Concepto | Qué Define | Se puede crear dinámicamente | Quién puede crearlo | Ejemplo |
|----------|-----------|------------------------------|---------------------|---------|
| **Profesión** | Trabajo/oficio en el campamento | ✅ SÍ | `admin` | Médico, Recolector, Guardia |
| **Rol** | Permisos en el sistema web | ❌ NO (6 roles fijos en código) | - | admin, lider_campamento, supervisor |
| **Asignación Temporal** | Cambio temporal de profesión | ✅ SÍ | `admin`, `gestor_recursos` | Ingeniero → Médico (temporal) |

**Diferencia clave**: Una persona puede ser "Recolector" (profesión) pero tener rol "admin" en el sistema.

**Roles disponibles**: admin, trabajador, gestor_recursos, encargado_viajes, lider_campamento, supervisor.

---

## 🎯 Casos de Uso Comunes

### 1. Crear nueva profesión especializada
```bash
# El apocalipsis ha evolucionado, necesitamos "Especialista en Zombies Mutantes"
curl -X POST http://localhost:3000/users/professions \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Especialista en Zombies Mutantes",
    "can_explore": true,
    "minimum_active_required": 1
  }'
```

### 2. Verificar profesiones que necesitan trabajadores
```bash
curl -X GET http://localhost:3000/users/professions/alerts/needing-workers \
  -H "Authorization: Bearer <token>"

# Respuesta:
[
  {
    "profession": { "id": 5, "name": "Médico" },
    "currentWorkers": 0,
    "minimumRequired": 1,
    "deficit": 1
  }
]
```

### 3. Asignar temporalmente un trabajador
```bash
curl -X POST http://localhost:3000/users/temporary-assignments \
  -H "Authorization: Bearer <gestor-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_account_id": 45,
    "profession_origin_id": 6,
    "profession_temporary_id": 5,
    "reason": "Médico enfermo - cobertura temporal",
    "estimated_days": 7
  }'
```
