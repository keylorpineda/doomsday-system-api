# 📚 Guía de URLs y Enlaces - Gestión del Fin API

**Proyecto:** Gestión del Fin - Sistema de Gestión de Campamentos Post-Apocalípticos
**Última actualización:** 11 de Marzo, 2026

---

## 🌐 URLs Principales

### **Backend API (Producción)**
- **URL Base:** `https://gestion-del-fin-api-614190957140.us-central1.run.app`
- **Swagger Docs:** `https://gestion-del-fin-api-614190957140.us-central1.run.app/api/docs`
- **Health Check:** `https://gestion-del-fin-api-614190957140.us-central1.run.app/api/health`
- **Hora del Servidor:** `https://gestion-del-fin-api-614190957140.us-central1.run.app/api/health/server-time`

### **Base de Datos (Supabase)**
- **Dashboard:** `https://supabase.com/dashboard/project/txfmjrhmqiuuxmhptemx`
- **Table Editor:** `https://supabase.com/dashboard/project/txfmjrhmqiuuxmhptemx/editor`
- **SQL Editor:** `https://supabase.com/dashboard/project/txfmjrhmqiuuxmhptemx/sql`
- **Database URL:** `db.txfmjrhmqiuuxmhptemx.supabase.co:5432`
- **Database Name:** `postgres`

### **Google Cloud Console**
- **Cloud Run Service:** `https://console.cloud.google.com/run/detail/us-central1/gestion-del-fin-api?project=gestion-fin-apocalipsis`
- **Cloud Build History:** `https://console.cloud.google.com/cloud-build/builds?project=gestion-fin-apocalipsis`
- **Cloud Build Triggers:** `https://console.cloud.google.com/cloud-build/triggers?project=gestion-fin-apocalipsis`
- **Logs (Cloud Run):** `https://console.cloud.google.com/run/detail/us-central1/gestion-del-fin-api/logs?project=gestion-fin-apocalipsis`
- **Logs Explorer:** `https://console.cloud.google.com/logs/query?project=gestion-fin-apocalipsis`
- **Cloud Scheduler Jobs:** `https://console.cloud.google.com/cloudscheduler?project=gestion-fin-apocalipsis`

### **Cloudinary (Imágenes)**
- **Dashboard:** `https://console.cloudinary.com/console/c-***REMOVED***`
- **Media Library:** `https://console.cloudinary.com/console/c-***REMOVED***/media_library`
- **Cloud Name:** `***REMOVED***`

### **Repositorio GitHub**
- **Backend:** `https://github.com/keylorpineda/ProjectProgrammingIV-BackEnd`

---

## 🔑 Credenciales (Development)

### **Base de Datos Supabase**
```env
DB_HOST=db.txfmjrhmqiuuxmhptemx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASS=***REMOVED***
DB_NAME=postgres
```

### **Cloudinary**
```env
CLOUDINARY_CLOUD_NAME=***REMOVED***
CLOUDINARY_API_KEY=635582815317377
CLOUDINARY_API_SECRET=cggtg0pEeRRcDLQiWu_VgQ_vIts
```

### **JWT**
```env
JWT_SECRET=***REMOVED***
JWT_EXPIRES_IN=20m
```

---

## 📡 Endpoints del API

### **🔐 Autenticación** (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | ❌ |
| POST | `/api/auth/logout` | Cerrar sesión | ✅ |
| POST | `/api/auth/refresh` | Refrescar token | ❌ |
| GET | `/api/auth/session-status` | Estado de sesión | ✅ |

**Ejemplo Login:**
```bash
POST https://gestion-del-fin-api-614190957140.us-central1.run.app/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

---

### **🤖 IA - Admisiones** (`/api/ai`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/admissions/submit` | Enviar solicitud de admisión | ✅ |
| GET | `/api/ai/admissions/track/:code` | Rastrear admisión por código | ✅ |
| GET | `/api/ai/admissions/pending` | Listar admisiones pendientes | ✅ |
| GET | `/api/ai/admissions/:id` | Detalle de admisión | ✅ |
| POST | `/api/ai/admissions/:id/review` | Revisar y aprobar/rechazar | ✅ |
| POST | `/api/ai/admissions/:id/create-account` | Crear cuenta tras aprobación | ✅ |

**Ejemplo Submit Admission:**
```bash
POST https://gestion-del-fin-api-614190957140.us-central1.run.app/api/ai/admissions/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "camp_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "age": 30,
  "skills": ["Medical", "First Aid"],
  "health_status": "Good",
  "reason_to_join": "I'm a doctor"
}
```

---

### **👥 Usuarios y Personas** (`/api/users`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/persons` | Listar personas | ✅ |
| GET | `/api/users/persons/:id` | Detalle de persona | ✅ |
| POST | `/api/users/persons` | Crear persona | ✅ |
| PUT | `/api/users/persons/:id` | Actualizar persona | ✅ |
| PUT | `/api/users/persons/:id/status` | Cambiar estado (enfermo, herido) | ✅ |
| DELETE | `/api/users/persons/:id` | Eliminar persona | ✅ |
| GET | `/api/users/professions` | Listar profesiones | ✅ |
| POST | `/api/users/professions` | Crear profesión | ✅ |
| GET | `/api/users/professions/alerts/needing-workers` | Profesiones sin trabajadores | ✅ |
| POST | `/api/users/temporary-assignments` | Crear asignación temporal | ✅ |
| GET | `/api/users/temporary-assignments` | Listar asignaciones activas | ✅ |
| PUT | `/api/users/temporary-assignments/:id/end` | Finalizar asignación | ✅ |
| GET | `/api/users/me/assigned-resources` | Recursos asignados al usuario | ✅ |

---

### **📦 Recursos** (`/api/resources`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/resources` | Listar recursos | ✅ |
| POST | `/api/resources` | Crear recurso | ✅ |
| GET | `/api/resources/inventory/:campId` | Inventario del campamento | ✅ |
| GET | `/api/resources/inventory/:campId/alerts` | Alertas de recursos críticos | ✅ |
| PATCH | `/api/resources/inventory/:campId/:resourceId` | Actualizar inventario | ✅ |
| POST | `/api/resources/inventory/initialize/:campId` | Inicializar inventario | ✅ |
| GET | `/api/resources/movements/:campId` | Historial de movimientos | ✅ |
| POST | `/api/resources/movements` | Registrar movimiento | ✅ |
| POST | `/api/resources/daily-process/:campId` | Ejecutar proceso diario manual | ✅ |
| POST | `/api/resources/daily-production/:personId` | Ajustar producción de persona | ✅ |

**Ejemplo Get Inventory:**
```bash
GET https://gestion-del-fin-api-614190957140.us-central1.run.app/api/resources/inventory/1
Authorization: Bearer {token}
```

---

### **🏕️ Campamentos** (`/api/camps`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/camps` | Listar campamentos | ✅ |
| GET | `/api/camps/:id` | Detalle de campamento | ✅ |
| POST | `/api/camps` | Crear campamento | ✅ |
| PATCH | `/api/camps/:id` | Actualizar campamento | ✅ |
| DELETE | `/api/camps/:id` | Eliminar campamento | ✅ |

---

### **🔄 Transferencias** (`/api/transfers`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/transfers/requests` | Crear solicitud de transferencia | ✅ |
| GET | `/api/transfers/requests/:id` | Detalle de solicitud | ✅ |
| GET | `/api/transfers/requests/camp/:campId` | Solicitudes del campamento | ✅ |
| GET | `/api/transfers/requests/camp/:campId/pending` | Solicitudes pendientes | ✅ |
| PATCH | `/api/transfers/requests/:id/approval` | Aprobar/rechazar solicitud | ✅ |
| PATCH | `/api/transfers/requests/:id/cancel` | Cancelar solicitud | ✅ |
| GET | `/api/transfers/statistics/:campId` | Estadísticas de transferencias | ✅ |

---

### **🗺️ Exploraciones** (`/api/explorations`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/explorations` | Crear exploración | ✅ |
| GET | `/api/explorations` | Listar exploraciones | ✅ |
| GET | `/api/explorations/:id` | Detalle de exploración | ✅ |
| PATCH | `/api/explorations/:id/depart` | Marcar salida | ✅ |
| PATCH | `/api/explorations/:id/return` | Registrar retorno con recursos | ✅ |
| DELETE | `/api/explorations/:id` | Eliminar exploración | ✅ |

---

### **📊 Dashboard** (`/api/dashboard`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/:campId` | Métricas del campamento (según rol) | ✅ |

**Ejemplo:**
```bash
GET https://gestion-del-fin-api-614190957140.us-central1.run.app/api/dashboard/1
Authorization: Bearer {token}
```

---

### **📤 Upload (Cloudinary)** (`/api/upload`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload/person` | Subir foto de persona | ✅ |
| POST | `/api/upload/avatar` | Subir avatar | ✅ |
| POST | `/api/upload/badge` | Subir insignia | ✅ |
| POST | `/api/upload/resource` | Subir imagen de recurso | ✅ |
| POST | `/api/upload/camp` | Subir imagen de campamento | ✅ |
| DELETE | `/api/upload/delete` | Eliminar imagen | ✅ |

---

### **❤️ Health** (`/api/health`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | ❌ |
| GET | `/api/health/server-time` | Hora del servidor (CRÍTICO) | ❌ |

**Ejemplo Server Time:**
```bash
GET https://gestion-del-fin-api-614190957140.us-central1.run.app/api/health/server-time

Response:
{
  "serverTime": "2026-03-11T10:30:45.123Z",
  "timestampUnix": 1773235845,
  "timezone": "UTC"
}
```

---

## 🧪 Testing con Postman

### **Importar Collection**

1. Abre Postman
2. Click en "Import"
3. Pega esta URL base: `https://gestion-del-fin-api-614190957140.us-central1.run.app`
4. O importa desde Swagger: `https://gestion-del-fin-api-614190957140.us-central1.run.app/api/docs-json`

### **Variables de Entorno Postman**

Crear un Environment con:

```json
{
  "baseUrl": "https://gestion-del-fin-api-614190957140.us-central1.run.app",
  "token": "",
  "campId": "1"
}
```

### **Flujo de Prueba Básico**

1. **Login:**
   ```
   POST {{baseUrl}}/api/auth/login
   Body: { "username": "admin", "password": "password123" }
   ```
   Copia el `access_token` de la respuesta a la variable `{{token}}`

2. **Verificar Hora del Servidor:**
   ```
   GET {{baseUrl}}/api/health/server-time
   ```

3. **Listar Campamentos:**
   ```
   GET {{baseUrl}}/api/camps
   Headers: Authorization: Bearer {{token}}
   ```

4. **Ver Dashboard:**
   ```
   GET {{baseUrl}}/api/dashboard/{{campId}}
   Headers: Authorization: Bearer {{token}}
   ```

5. **Crear Admisión:**
   ```
   POST {{baseUrl}}/api/ai/admissions/submit
   Headers: Authorization: Bearer {{token}}
   Body: { ... }
   ```

---

## 🗄️ Consultas SQL Útiles (Supabase)

### **Ver todas las tablas:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### **Contar registros por tabla:**
```sql
SELECT 
  'person' as table_name, COUNT(*) as count FROM person
UNION ALL
SELECT 'camp', COUNT(*) FROM camp
UNION ALL
SELECT 'resource', COUNT(*) FROM resource
UNION ALL
SELECT 'ai_admission', COUNT(*) FROM ai_admission;
```

### **Ver admisiones pendientes:**
```sql
SELECT 
  id,
  tracking_code,
  camp_id,
  status,
  suggested_decision,
  score,
  submission_date
FROM ai_admission
WHERE status = 'PENDING_REVIEW'
ORDER BY submission_date DESC;
```

### **Ver inventario con alertas:**
```sql
SELECT 
  i.camp_id,
  r.name as resource_name,
  i.quantity,
  i.minimum_required,
  i.has_alert
FROM inventory i
JOIN resource r ON i.resource_id = r.id
WHERE i.has_alert = true;
```

### **Ver transferencias pendientes:**
```sql
SELECT 
  ir.id,
  co.name as origin,
  cd.name as destination,
  ir.type,
  ir.status,
  ir.request_date
FROM intercamp_request ir
JOIN camp co ON ir.camp_origin_id = co.id
JOIN camp cd ON ir.camp_destination_id = cd.id
WHERE ir.status = 'pending'
ORDER BY ir.request_date DESC;
```

---

## 🚀 Comandos CLI Útiles

### **Ver logs en tiempo real:**
```powershell
gcloud run services logs tail gestion-del-fin-api --region=us-central1
```

### **Ver últimos logs:**
```powershell
gcloud run services logs read gestion-del-fin-api --region=us-central1 --limit=50
```

### **Ver builds recientes:**
```powershell
gcloud builds list --limit=10
```

### **Forzar nuevo deploy:**
```powershell
gcloud run deploy gestion-del-fin-api --source . --region us-central1
```

### **Ver info del servicio:**
```powershell
gcloud run services describe gestion-del-fin-api --region us-central1
```

---

## 📋 Roles del Sistema

| Rol | Nombre Interno | Permisos |
|-----|---------------|----------|
| Administrador del Sistema | `admin` | Gestiona ingresos de personas, ve todo el sistema |
| Trabajador | `worker` | Cambios de inventario autorizados |
| Gestor de Recursos | `resource_manager` | Traslados y envíos de recursos |
| Encargado de Viajes | `travel_comms` | Expediciones y negociaciones |

---

## 🔄 Procesos Automáticos

### **Cron Job Diario (Medianoche UTC):**
- Calcula producción de cada persona según profesión
- Resta consumo diario de raciones
- Actualiza inventario automáticamente
- Genera alertas de recursos críticos

### **Keep-Alive (Cada 5 minutos):**
- Cloud Scheduler hace ping a `/api/health`
- Reduce cold starts de 90% a ~20%

### **Inactividad de Sesión (20 minutos):**
- Guard automático cierra sesión tras 20 min sin actividad
- Campo `auto_logout` en tabla `session`

---

## 📞 Contacto y Soporte

- **Proyecto:** Gestión del Fin
- **Repositorio:** https://github.com/keylorpineda/ProjectProgrammingIV-BackEnd
- **API Docs:** https://gestion-del-fin-api-614190957140.us-central1.run.app/api/docs

---

**Última actualización:** 11 de Marzo, 2026
