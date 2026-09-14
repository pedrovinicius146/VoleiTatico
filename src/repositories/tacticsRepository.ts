import { SystemType, RotationIndex, GamePhase, PlayerPosition } from '../types';
import { SYSTEMS_CATALOG, TACTICAL_FORMATIONS, SystemInfo } from '../constants/tacticsData';

export interface TacticalFormationData {
  players: PlayerPosition[];
  pedagogicalTip: string;
}

/**
 * Repositório de táticas, presets e regras de formação do voleibol.
 * Desacopla a camada de apresentação das constantes locais, permitindo sincronização remota futura.
 */
export class TacticsRepository {
  public getAllSystems(): SystemInfo[] {
    return SYSTEMS_CATALOG;
  }

  public getSystemInfo(system: SystemType): SystemInfo | undefined {
    return SYSTEMS_CATALOG.find((s) => s.id === system);
  }

  public getFormation(
    system: SystemType,
    rotation: RotationIndex,
    phase: GamePhase
  ): TacticalFormationData | undefined {
    return TACTICAL_FORMATIONS[system]?.[rotation]?.[phase];
  }
}

export const tacticsRepository = new TacticsRepository();
