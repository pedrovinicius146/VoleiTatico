export type FundamentalId =
  | 'serve'
  | 'reception'
  | 'setting'
  | 'attack'
  | 'block'
  | 'defense'
  | 'footwork';

export type FundamentalDifficulty = 'Iniciante' | 'Intermediário' | 'Avançado';

export type FundamentalCategory =
  | 'inicio_bola'
  | 'controle_passe'
  | 'rede_ofensiva'
  | 'rede_defensiva'
  | 'base_quadra';

export type BodyHighlightPart =
  | 'legs_knees'
  | 'feet_base'
  | 'torso_core'
  | 'forearms_platform'
  | 'hands_fingers'
  | 'hitting_arm'
  | 'both_arms';

export type FundamentalCameraPreset =
  | 'arena'
  | 'side'
  | 'front'
  | 'top'
  | 'feet';

export interface JointEuler {
  x: number;
  y: number;
  z: number;
}

export interface AnimationPoseKeyframe {
  /** Timestamp in seconds relative to clip start */
  time: number;
  /** Pelvis world position [x, y, z] in meters */
  pelvisPos: [number, number, number];
  /** Pelvis overall orientation [rx, ry, rz] in radians */
  pelvisRot?: [number, number, number];
  /** Torso lean/twist */
  torsoRot: [number, number, number];
  /** Head/neck gaze orientation */
  headRot: [number, number, number];
  /** Left arm joints (shoulder, elbow) */
  lShoulderRot: [number, number, number];
  lElbowRot: [number, number, number];
  /** Right arm joints (shoulder, elbow) */
  rShoulderRot: [number, number, number];
  rElbowRot: [number, number, number];
  /** Left leg joints (hip, knee, ankle) */
  lHipRot: [number, number, number];
  lKneeRot: [number, number, number];
  lAnkleRot?: [number, number, number];
  /** Right leg joints (hip, knee, ankle) */
  rHipRot: [number, number, number];
  rKneeRot: [number, number, number];
  rAnkleRot?: [number, number, number];
  /** Ball world position [x, y, z] in meters */
  ballPos: [number, number, number];
  /** Ball visibility */
  ballVisible?: boolean;
}

export interface FundamentalStep {
  stepNumber: number;
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
  keyCue: string;
  highlightParts: BodyHighlightPart[];
  recommendedCamera?: FundamentalCameraPreset;
}

export interface FundamentalTechniqueVariant {
  id: string;
  name: string;
  difficulty: FundamentalDifficulty;
  duration: number;
  description: string;
  /** Target path for future external Blender-exported GLTF/GLB skeletal file */
  glbModelPath: string;
  /** Target AnimationClip name inside the GLTF/GLB asset */
  glbClipName: string;
  /** Pre-baked keyframe data compiled to THREE.AnimationClip */
  keyframes: AnimationPoseKeyframe[];
  steps: FundamentalStep[];
  /** Number of extra partner blockers on net (0 for single, 1 for double, 2 for triple) */
  extraBlockersCount?: number;
  /** Whether to highlight the ball trajectory arc */
  showTrajectoryArc?: boolean;
}

export interface CommonErrorItem {
  error: string;
  consequence: string;
  correction: string;
}

export interface PracticalDrill {
  title: string;
  level: string;
  reps: string;
  focus: string;
  instructions: string;
}

export interface FundamentalData {
  id: FundamentalId;
  order: number;
  title: string;
  subtitle: string;
  shortDescription: string;
  difficulty: FundamentalDifficulty;
  category: FundamentalCategory;
  categoryLabel: string;
  estimatedMinutes: number;
  subTopics: string[];
  variants: FundamentalTechniqueVariant[];
  didactic: {
    howToExecute: string;
    bodyPositioning: {
      legsAndFeet: string;
      torsoAndCore: string;
      armsAndHands: string;
      visionAndTiming: string;
    };
    commonErrors: CommonErrorItem[];
    technicalTips: string[];
    practicalDrills: PracticalDrill[];
  };
}
