import { Injectable } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { PROFESSIONS_CONFIG, DAILY_CONSUMPTION } from '../constants/professions.constants';

/**
 * Servicio especializado en cálculos de producción y consumo
 * Responsabilidad: Calcular producción diaria, consumo y balances
 */
@Injectable()
export class ProductionService {
  constructor(private readonly personsService: PersonsService) {}

  /**
   * Calcula la producción diaria total de un campamento
   */
  async calculateDailyProduction(campId: number): Promise<{
    totalFood: number;
    totalWater: number;
    byProfession: Array<{
      professionName: string;
      workers: number;
      foodProduction: number;
      waterProduction: number;
    }>;
  }> {
    const activeWorkers = await this.personsService.findActiveWorkersByCamp(campId);

    const productionByProfession = new Map<
      number,
      {
        name: string;
        workers: number;
        food: number;
        water: number;
      }
    >();

    let totalFood = 0;
    let totalWater = 0;

    for (const person of activeWorkers) {
      if (!person.profession) continue;

      const professionId = person.profession.id;
      const professionName = person.profession.name;

      // Buscar configuración de la profesión
      const professionConfig = Object.values(PROFESSIONS_CONFIG).find(
        (p) => p.name === professionName,
      );

      if (!professionConfig) continue;

      const foodProd = professionConfig.daily_food_production;
      const waterProd = professionConfig.daily_water_production;

      totalFood += foodProd;
      totalWater += waterProd;

      if (productionByProfession.has(professionId)) {
        const current = productionByProfession.get(professionId)!;
        current.workers++;
        current.food += foodProd;
        current.water += waterProd;
      } else {
        productionByProfession.set(professionId, {
          name: professionName,
          workers: 1,
          food: foodProd,
          water: waterProd,
        });
      }
    }

    return {
      totalFood,
      totalWater,
      byProfession: Array.from(productionByProfession.values()).map((p) => ({
        professionName: p.name,
        workers: p.workers,
        foodProduction: p.food,
        waterProduction: p.water,
      })),
    };
  }

  /**
   * Calcula el consumo diario total de un campamento
   */
  async calculateDailyConsumption(campId: number): Promise<{
    totalFood: number;
    totalWater: number;
    totalPersons: number;
  }> {
    const totalPersons = await this.personsService.countPersonsByCamp(campId, true);

    return {
      totalFood: totalPersons * DAILY_CONSUMPTION.FOOD_PER_PERSON,
      totalWater: totalPersons * DAILY_CONSUMPTION.WATER_PER_PERSON,
      totalPersons,
    };
  }

  /**
   * Calcula el balance neto diario (producción - consumo)
   */
  async calculateDailyBalance(campId: number): Promise<{
    production: { food: number; water: number };
    consumption: { food: number; water: number };
    balance: { food: number; water: number };
    persons: number;
  }> {
    const production = await this.calculateDailyProduction(campId);
    const consumption = await this.calculateDailyConsumption(campId);

    return {
      production: {
        food: production.totalFood,
        water: production.totalWater,
      },
      consumption: {
        food: consumption.totalFood,
        water: consumption.totalWater,
      },
      balance: {
        food: production.totalFood - consumption.totalFood,
        water: production.totalWater - consumption.totalWater,
      },
      persons: consumption.totalPersons,
    };
  }
}
