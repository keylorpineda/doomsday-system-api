// Estados posibles de una persona en el campamento
export enum PersonStatus {
  ACTIVE = 'active', // Trabajando normalmente
  SICK = 'sick', // Enfermo - no puede trabajar
  INJURED = 'injured', // Herido - no puede trabajar
  DECEASED = 'deceased', // Muerto/zombificado
  EXPLORING = 'exploring', // En expedición fuera del campamento
  TRAVELING = 'traveling', // Viajando entre campamentos
  RESTING = 'resting', // Descansando (recuperación)
  IDLE = 'idle', // Sin hacer nada / desempleado
  OUT_OF_CAMP = 'out_of_camp', // Fuera del campamento (otro motivo)
}

// Profesiones/Cargos en el campamento zombie
export const PROFESSIONS_CONFIG = {
  RECOLECTOR: {
    name: 'Recolector',
    can_explore: true,
    minimum_required: 2, // Crítico - debe haber al menos 2
    daily_food_production: 10, // unidades de comida por día
    daily_water_production: 0,
    description: 'Recolecta alimentos en zonas cercanas al campamento',
  },
  AGUATERO: {
    name: 'Aguatero',
    can_explore: false,
    minimum_required: 2, // Crítico - debe haber al menos 2
    daily_food_production: 0,
    daily_water_production: 15, // litros de agua por día
    description: 'Obtiene y purifica agua para el campamento',
  },
  EXPLORADOR: {
    name: 'Explorador',
    can_explore: true,
    minimum_required: 1,
    daily_food_production: 5, // Cuando está en campamento
    daily_water_production: 0,
    description: 'Especialista en expediciones y reconocimiento',
  },
  GUARDIA: {
    name: 'Guardia',
    can_explore: false,
    minimum_required: 2, // Importante para seguridad
    daily_food_production: 0,
    daily_water_production: 0,
    description: 'Protege el campamento de amenazas zombie y humanas',
  },
  MEDICO: {
    name: 'Médico',
    can_explore: false,
    minimum_required: 1, // Importante para curar
    daily_food_production: 0,
    daily_water_production: 0,
    description: 'Cura heridos y enfermos, mantiene la salud del grupo',
  },
  INGENIERO: {
    name: 'Ingeniero',
    can_explore: false,
    minimum_required: 1,
    daily_food_production: 0,
    daily_water_production: 5, // Arregla sistemas de agua
    description: 'Mantiene y mejora la infraestructura del campamento',
  },
  COCINERO: {
    name: 'Cocinero',
    can_explore: false,
    minimum_required: 1,
    daily_food_production: 3, // Aprovecha mejor los ingredientes
    daily_water_production: 0,
    description: 'Prepara alimentos y gestiona raciones eficientemente',
  },
  ALMACENISTA: {
    name: 'Almacenista',
    can_explore: false,
    minimum_required: 1,
    daily_food_production: 0,
    daily_water_production: 0,
    description: 'Gestiona el inventario y previene desperdicios',
  },
  AGRICULTOR: {
    name: 'Agricultor',
    can_explore: false,
    minimum_required: 1,
    daily_food_production: 8, // Cultiva alimentos
    daily_water_production: 0,
    description: 'Cultiva alimentos a largo plazo en el campamento',
  },
  CONSTRUCTOR: {
    name: 'Constructor',
    can_explore: false,
    minimum_required: 1,
    daily_food_production: 0,
    daily_water_production: 0,
    description: 'Construye y refuerza estructuras del campamento',
  },
};

// Consumo diario por persona
export const DAILY_CONSUMPTION = {
  FOOD_PER_PERSON: 2, // unidades de comida por día
  WATER_PER_PERSON: 3, // litros de agua por día
};

// Configuración de asignaciones temporales
export const TEMPORARY_ASSIGNMENT_CONFIG = {
  DEFAULT_DURATION_DAYS: 7, // Duración por defecto: 1 semana
  MAX_DURATION_DAYS: 30, // Máximo 30 días
  MIN_DURATION_DAYS: 1, // Mínimo 1 día
};

// Estados que permiten trabajar
export const WORKING_STATUSES = [PersonStatus.ACTIVE];

// Estados que NO permiten trabajar
export const NON_WORKING_STATUSES = [
  PersonStatus.SICK,
  PersonStatus.INJURED,
  PersonStatus.DECEASED,
  PersonStatus.EXPLORING,
  PersonStatus.TRAVELING,
  PersonStatus.RESTING,
  PersonStatus.IDLE,
  PersonStatus.OUT_OF_CAMP,
];
