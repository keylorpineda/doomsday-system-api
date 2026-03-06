# 📸 Módulo de Upload - Cloudinary

Módulo para subida y gestión de imágenes usando Cloudinary.

## 🎯 Casos de uso implementados

### 1. **Personas** (Person)
- Foto de la persona
- Tarjeta de identificación
- Endpoint: `POST /upload/person`

### 2. **Recursos** (Resource)
- Imagen del recurso (comida, armas, etc.)
- Endpoint: `POST /upload/resource`

### 3. **Campamentos** (Camp)
- Logo del campamento
- Mapa del campamento
- Endpoint: `POST /upload/camp`

### 4. **Avatares** (UserAccount)
- Avatar de usuario (optimizado circular)
- Endpoint: `POST /upload/avatar`

### 5. **Assets Genéricos** (Badge/Logro/Medalla)
- Badges de gamificación
- Logros
- Medallas
- Iconos personalizados
- Endpoint: `POST /upload/badge`

### 6. **Múltiples imágenes**
- Evidencia de exploraciones
- Múltiples fotos de recursos
- Endpoint: `POST /upload/multiple`

## 🔧 Configuración

### 1. Variables de entorno (.env)
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 2. Obtener credenciales de Cloudinary
1. Crear cuenta gratuita: https://cloudinary.com/users/register/free
2. Ir a Dashboard > Settings > Access Keys
3. Copiar: Cloud Name, API Key, API Secret

## 📝 Uso desde el Frontend

### Ejemplo: Subir foto de persona
```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/upload/person', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
// result = { url: "...", publicId: "...", thumbnailUrl: "..." }
```

### Ejemplo: Subir múltiples imágenes
```typescript
const formData = new FormData();
files.forEach(file => formData.append('files', file));
formData.append('folder', 'resource'); // person, resource, camp, badge, avatar

const response = await fetch('http://localhost:3000/upload/multiple', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## 📊 Entidades actualizadas

### Person (Ya existía)
```typescript
photo_url: string         // URL foto
id_card_url: string       // URL tarjeta ID
```

### Resource
```typescript
image_url: string         // URL imagen
image_public_id: string   // ID para eliminar
description: string       // Descripción
```

### Camp
```typescript
logo_url: string          // URL logo
logo_public_id: string    // ID para eliminar
map_url: string           // URL mapa
map_public_id: string     // ID para eliminar
```

### UserAccount
```typescript
avatar_url: string        // URL avatar
avatar_public_id: string  // ID para eliminar
```

### Asset (Nueva entidad genérica)
```typescript
name: string              // Nombre del asset
description: string       // Descripción
asset_type: string        // badge, achievement, medal, logo, icon, etc.
category: string          // survival, exploration, leadership, combat, etc.
url: string               // URL imagen
public_id: string         // ID para eliminar
thumbnail_url: string     // URL thumbnail
rarity: number            // 1=común, 2=raro, 3=épico, 4=legendario
metadata: object          // Datos flexibles adicionales
```

### UserAsset (Relación usuario-asset)
```typescript
user_account_id: number   // ID usuario
asset_id: number          // ID asset
relation_type: string     // earned, assigned, favorite
acquired_at: Date         // Fecha de adquisición
is_displayed: boolean     // Mostrar en perfil
context_data: object      // Datos del contexto
```

## ✨ Características

### Optimización automática
- Compresión inteligente
- Formato automático (WebP cuando es soportado)
- Calidad adaptativa

### Validaciones
- Tipos permitidos: JPEG, PNG, WEBP
- Tamaño máximo: 5MB
- Validación de archivo requerido

### Transformaciones automáticas
- **Person**: Thumbnails 200x200px
- **Resource**: Thumbnails 150x150px
- **Camp**: Thumbnails 300x200px
- **Avatar**: Circular 100x100px con crop en cara

### Organización en Cloudinary
```
zombie-camp/
  ├── person/      (fotos e IDs de personas)
  ├── resource/    (imágenes de recursos)
  ├── camp/        (logos y mapas)
  ├── avatar/      (avatares de usuarios)
  └── badge/       (assets genéricos: badges, logros, medallas)
```

## 🗑️ Eliminar imágenes

```typescript
await fetch('http://localhost:3000/upload/delete', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    publicId: 'zombie-camp/person/abc123'
  })
});
```

## 🎮 Gamificación con Assets

Los assets genéricos permiten implementar:
- 🏆 **Badges**: Logros desbloqueables
- 🎖️ **Medallas**: Reconocimientos especiales
- ⭐ **Rangos**: Niveles de experiencia
- 📛 **Insignias**: Roles especiales
- 🎨 **Avatares temáticos**: Personalizaciones

## 📌 Próximos pasos

1. Crear seeders con badges iniciales
2. Implementar lógica de desbloqueo automático
3. Agregar endpoints para gestionar assets
4. Crear sistema de puntos/XP
5. Dashboard de progreso del usuario
