// Orígenes del frontend que siempre están permitidos
const DEFAULT_ORIGINS = [
  "http://localhost:5173", // Para desarrollo local
  "https://doomsday-system-ui.vercel.app", // URL de producción en Vercel
  "https://doomsday-system-ui-keylor-pineda-s-projects.vercel.app", // URL del proyecto actual en Vercel
];

// Une los orígenes por defecto con los definidos en CORS_ORIGIN (separados por coma)
export function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];
}
