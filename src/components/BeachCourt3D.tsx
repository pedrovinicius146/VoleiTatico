import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlayerPosition, BeachSignal, WindDirection } from '../types';
import { BeachAttackScenario } from '../constants/beachAttacksData';
import {
  RotateCcw,
  Eye,
  Wind,
  Compass,
  Layers,
  ChevronDown,
  ChevronUp,
  Move,
  Play,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

export type PlayOutcome = 'toco' | 'defense' | 'opponent_point';

export interface PlayResultInfo {
  outcome: PlayOutcome;
  defenderDistance: number;
  blockerMatched: boolean;
  scenario: BeachAttackScenario;
}

interface BeachCourt3DProps {
  players: PlayerPosition[];
  onPlayerMove?: (playerId: string, newX: number, newY: number) => void;
  onPlayerClick?: (player: PlayerPosition) => void;
  onPlayerDoubleClick?: (player: PlayerPosition) => void;
  beachSignal?: BeachSignal;
  attackerSide?: 'left' | 'right';
  showShadowCones?: boolean;
  wind?: WindDirection;
  selectedPlayerId?: string | null;
  interactive?: boolean;
  // Attack animation props
  attackScenario?: BeachAttackScenario | null;
  isExecutingPlay?: boolean;
  onStartPlay?: () => void;
  onResetPlay?: () => void;
  onPlayCompleted?: (result: PlayResultInfo) => void;
  playbackSpeed?: number;
  onChangePlaybackSpeed?: (speed: number) => void;
  forceOutcome?: 'auto' | 'block_point' | 'defense_dig';
}

type CameraPreset = 'arena' | 'top' | 'server' | 'net' | 'defender';

export const BeachCourt3D: React.FC<BeachCourt3DProps> = ({
  players,
  onPlayerMove,
  onPlayerClick,
  onPlayerDoubleClick,
  beachSignal = '1_finger',
  attackerSide = 'left',
  showShadowCones = true,
  wind = 'none',
  selectedPlayerId = null,
  interactive = true,
  attackScenario = null,
  isExecutingPlay = false,
  onStartPlay,
  onResetPlay,
  onPlayCompleted,
  playbackSpeed = 1.0,
  onChangePlaybackSpeed,
  forceOutcome = 'auto',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<CameraPreset>('arena');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [currentOutcome, setCurrentOutcome] = useState<PlayOutcome | null>(null);
  const [animationPhaseLabel, setAnimationPhaseLabel] = useState<string>('Arena Pronta');

  // Three.js mutable references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const playerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const shadowConeMeshRef = useRef<THREE.Mesh | null>(null);
  const windIndicatorGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // 3D Animated Humanoid Boneco References
  const blockerGroupRef = useRef<THREE.Group | null>(null);
  const defenderGroupRef = useRef<THREE.Group | null>(null);
  const oppAttackerGroupRef = useRef<THREE.Group | null>(null);
  const oppHittingArmRef = useRef<THREE.Group | null>(null);
  const blockerBackHandsGroupRef = useRef<THREE.Group | null>(null);
  const blockerDecalRef = useRef<THREE.Mesh | null>(null);
  const defenderDecalRef = useRef<THREE.Mesh | null>(null);
  const oppAttackerDecalRef = useRef<THREE.Mesh | null>(null);

  // 3D Volleyball & Particle References
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const ballShadowMeshRef = useRef<THREE.Mesh | null>(null);
  const trajectoryLineRef = useRef<THREE.Line | null>(null);
  const sandBurstParticlesRef = useRef<THREE.Points | null>(null);

  // User-placed starting positions stored when play starts
  const userPlacedDefenderStart = useRef<{ x: number; z: number }>({ x: 1.8, z: 5.5 });
  const userPlacedBlockerStart = useRef<{ x: number; z: number }>({ x: -2.0, z: 0.55 });
  const resolvedOutcomeRef = useRef<PlayOutcome>('defense');
  const playHasFinishedRef = useRef<boolean>(false);

  // Time & Animation Execution Control
  const animTimeRef = useRef<number>(0);
  const isExecutingRef = useRef<boolean>(isExecutingPlay);
  isExecutingRef.current = isExecutingPlay;
  const speedRef = useRef<number>(playbackSpeed);
  speedRef.current = playbackSpeed;
  const currentScenarioRef = useRef<BeachAttackScenario | null>(attackScenario);
  currentScenarioRef.current = attackScenario;
  const currentSignalRef = useRef<BeachSignal>(beachSignal);
  currentSignalRef.current = beachSignal;
  const playersRef = useRef<PlayerPosition[]>(players);
  playersRef.current = players;

  // Pointer dragging and double-click state
  const isDraggingRef = useRef(false);
  const draggedPlayerIdRef = useRef<string | null>(null);
  const pointerDownInfoRef = useRef<{ x: number; y: number; time: number; player: PlayerPosition } | null>(null);
  const hasMovedRef = useRef<boolean>(false);
  const lastClickRef = useRef<{ playerId: string; time: number } | null>(null);
  const planeRaycast = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const mouseVec = useRef(new THREE.Vector2());

  // Camera transition state
  const targetCamPos = useRef(new THREE.Vector3(13.5, 10.5, 15.0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.8, 0));
  const isTransitioningCam = useRef(false);

  // Official Beach Court Dimensions: 16m x 8m (X: -4.0 to +4.0; Z: -8.0 to +8.0, our half is 0 to +8.0)
  const mapPlayerTo3D = useCallback((p: { x: number; y: number }) => {
    const x3d = ((p.x / 100) - 0.5) * 8.0;
    const z3d = (p.y / 100) * 7.2 + 0.4;
    return { x: x3d, z: z3d };
  }, []);

  const map3DToPlayer = useCallback((x3d: number, z3d: number) => {
    const clampedX = Math.max(-3.8, Math.min(3.8, x3d));
    const clampedZ = Math.max(0.4, Math.min(7.6, z3d));
    const newX = Math.round(((clampedX / 8.0) + 0.5) * 100);
    const newY = Math.round(((clampedZ - 0.4) / 7.2) * 100);
    return {
      x: Math.max(5, Math.min(95, newX)),
      y: Math.max(5, Math.min(95, newY)),
    };
  }, []);

  const applyCameraPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    isTransitioningCam.current = true;

    if (preset === 'arena') {
      targetCamPos.current.set(13.5, 10.5, 15.0);
      targetLookAt.current.set(0, 0.8, 0);
    } else if (preset === 'top') {
      targetCamPos.current.set(0.01, 19.0, 0.01);
      targetLookAt.current.set(0, 0, 0);
    } else if (preset === 'server') {
      targetCamPos.current.set(0, 3.8, 13.5);
      targetLookAt.current.set(0, 1.6, 0);
    } else if (preset === 'net') {
      targetCamPos.current.set(0, 2.7, 2.5);
      targetLookAt.current.set(0, 1.8, 0);
    } else if (preset === 'defender') {
      targetCamPos.current.set(0, 3.0, 10.2);
      targetLookAt.current.set(0, 1.4, 1.2);
    }
  };

  // Helper to re-anchor the shadow cone to the blocker
  const updateShadowConeAnchor = useCallback((blockerPos: { x: number; z: number }, sig: BeachSignal, side: 'left' | 'right') => {
    const cone = shadowConeMeshRef.current;
    if (!cone) return;
    if (sig === '1_finger') {
      cone.position.set(blockerPos.x, 0.015, blockerPos.z + 3.0);
      cone.rotation.z = 0;
    } else if (sig === '2_fingers') {
      const angle = side === 'left' ? -Math.PI / 6 : Math.PI / 6;
      cone.position.set(blockerPos.x + (side === 'left' ? 1.4 : -1.4), 0.015, blockerPos.z + 2.8);
      cone.rotation.z = angle;
    } else {
      cone.position.set(blockerPos.x, 0.015, blockerPos.z + 2.5);
      cone.rotation.z = 0;
    }
  }, []);

  // When play is triggered, record starting positions & evaluate the true tactical outcome
  useEffect(() => {
    if (isExecutingPlay && attackScenario) {
      animTimeRef.current = 0;
      playHasFinishedRef.current = false;

      // 1. Get Defender 3D starting position from wherever user placed it
      const defPlayer = playersRef.current.find((p) => p.id === 'DEF');
      const blkPlayer = playersRef.current.find((p) => p.id === 'BLOQ');

      const def3D = defPlayer ? mapPlayerTo3D(defPlayer) : { x: 1.8, z: 5.5 };
      const blk3D = blkPlayer ? mapPlayerTo3D(blkPlayer) : { x: -2.0, z: 0.55 };

      userPlacedDefenderStart.current = def3D;
      userPlacedBlockerStart.current = blk3D;

      // 2. Evaluate Blocker check
      const signalMatches = beachSignal === attackScenario.blockDirectBlockSignal;
      const blockerNearNet = Math.abs(blk3D.z - 0.55) < 1.3;
      const blockerNearCorridor = Math.abs(blk3D.x - attackScenario.netCrossCoords.x) < 1.8;
      const isBlockSuccess =
        forceOutcome === 'block_point' ||
        (forceOutcome !== 'defense_dig' && signalMatches && blockerNearNet && blockerNearCorridor);

      // 3. Evaluate Defender check
      const targetCoords = attackScenario.targetContactCoords;
      const defDist = Math.hypot(def3D.x - targetCoords.x, def3D.z - targetCoords.z);
      // Realistic beach dig reachable radius: ~2.3 meters
      const isDefenseReachable = defDist <= 2.3 || forceOutcome === 'defense_dig';

      let resolved: PlayOutcome;
      if (isBlockSuccess) {
        resolved = 'toco';
      } else if (isDefenseReachable) {
        resolved = 'defense';
      } else {
        resolved = 'opponent_point';
      }

      resolvedOutcomeRef.current = resolved;
      setCurrentOutcome(resolved);
      setAnimationPhaseLabel('⚡ 1. O Atacante Adversário saltou para o golpe!');
    } else if (!isExecutingPlay) {
      animTimeRef.current = 0;
      playHasFinishedRef.current = false;
      setAnimationPhaseLabel('Arena Pronta • Posicione os bonecos e clique em "Iniciar Jogada"');
    }
  }, [isExecutingPlay, attackScenario, beachSignal, forceOutcome, mapPlayerTo3D]);

  // =========================================================================
  // HELPER: CREATE 3D HAND SIGNALS BEHIND BLOCKER'S LOWER BACK
  // =========================================================================
  const build3DHandSignalMesh = useCallback((signal: BeachSignal) => {
    const group = new THREE.Group();
    group.name = 'backHandsSignal';

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const fingerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });

    const createSingleHand = (isRightHand: boolean) => {
      const hand = new THREE.Group();
      hand.position.set(isRightHand ? 0.12 : -0.12, 0, 0);

      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.08, 0.025), skinMat);
      hand.add(palm);

      const fingerGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.07, 8);
      if (signal === '1_finger') {
        const f = new THREE.Mesh(fingerGeo, fingerMat);
        f.position.set(0, -0.065, 0);
        hand.add(f);
      } else if (signal === '2_fingers') {
        const f1 = new THREE.Mesh(fingerGeo, fingerMat);
        f1.position.set(-0.016, -0.065, 0);
        f1.rotation.z = Math.PI / 10;
        hand.add(f1);

        const f2 = new THREE.Mesh(fingerGeo, fingerMat);
        f2.position.set(0.016, -0.065, 0);
        f2.rotation.z = -Math.PI / 10;
        hand.add(f2);
      } else if (signal === 'open_hand') {
        for (let i = -2; i <= 2; i++) {
          const f = new THREE.Mesh(fingerGeo, fingerMat);
          f.position.set(i * 0.014, -0.065, 0);
          f.rotation.z = (i * Math.PI) / 20;
          hand.add(f);
        }
      } else if (signal === 'closed_fist') {
        const fist = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), skinMat);
        fist.position.set(0, -0.035, 0.01);
        hand.add(fist);
      } else if (signal === 'shade_cut') {
        const f1 = new THREE.Mesh(fingerGeo, fingerMat);
        f1.position.set(0, -0.065, 0);
        hand.add(f1);

        const thumb = new THREE.Mesh(fingerGeo, fingerMat);
        thumb.position.set(isRightHand ? 0.025 : -0.025, -0.04, 0);
        thumb.rotation.z = isRightHand ? Math.PI / 4 : -Math.PI / 4;
        hand.add(thumb);
      }

      return hand;
    };

    group.add(createSingleHand(false));
    group.add(createSingleHand(true));
    group.position.set(0, 0.45, 0.22);
    group.rotation.x = Math.PI / 8;
    return group;
  }, []);

  // Helper ground decal
  const createGroundDecal = useCallback((label: string, colorHex: number, radius = 0.70) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const cssColor = '#' + colorHex.toString(16).padStart(6, '0');

    ctx.strokeStyle = cssColor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(128, 128, 114, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(128, 128, 94, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = cssColor + '38';
    ctx.beginPath();
    ctx.arc(128, 128, 94, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = cssColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(128, 6);
    ctx.lineTo(128, 24);
    ctx.moveTo(128, 232);
    ctx.lineTo(128, 250);
    ctx.moveTo(6, 128);
    ctx.lineTo(24, 128);
    ctx.moveTo(232, 128);
    ctx.lineTo(250, 128);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 6;
    ctx.fillText(label, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.014;
    // Decals must NEVER capture pointer raycasting
    mesh.raycast = () => null;
    return mesh;
  }, []);

  // Helper Boneco 3D
  const createHumanoidBoneco = useCallback(
    (
      role: 'BLOQ' | 'DEF' | 'ATAC',
      jerseyNumber: number,
      label: string,
      currentSignal: BeachSignal,
      isSelected: boolean
    ) => {
      const group = new THREE.Group();
      group.name = role;

      const isBlocker = role === 'BLOQ';
      const isDefender = role === 'DEF';
      const isAttacker = role === 'ATAC';

      const skinColor = 0xd97706;
      const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.65 });
      const padMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

      const jerseyColor = isBlocker ? 0x0284c7 : isDefender ? 0xf59e0b : 0xdc2626;
      const shortsColor = isBlocker ? 0x0f172a : isDefender ? 0x1e293b : 0x991b1b;
      const jerseyMat = new THREE.MeshStandardMaterial({ color: jerseyColor, roughness: 0.6 });
      const shortsMat = new THREE.MeshStandardMaterial({ color: shortsColor, roughness: 0.7 });

      // 1. Sand Stance Ring / Shadow Anchor
      const baseGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.06, 24);
      const baseMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x38bdf8 : isAttacker ? 0x7f1d1d : 0x1e293b,
        roughness: 0.5,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.03;
      group.add(baseMesh);

      // 2. Legs
      const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.45, 12);
      const kneeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.12, 12);

      const leftLeg = new THREE.Mesh(legGeo, skinMat);
      leftLeg.position.set(-0.16, 0.22, isDefender ? -0.05 : 0);
      group.add(leftLeg);

      const leftKnee = new THREE.Mesh(kneeGeo, padMat);
      leftKnee.position.set(-0.16, 0.28, isDefender ? -0.02 : 0);
      group.add(leftKnee);

      const rightLeg = new THREE.Mesh(legGeo, skinMat);
      rightLeg.position.set(0.16, 0.22, isDefender ? 0.05 : 0);
      group.add(rightLeg);

      const rightKnee = new THREE.Mesh(kneeGeo, padMat);
      rightKnee.position.set(0.16, 0.28, isDefender ? 0.08 : 0);
      group.add(rightKnee);

      // 3. Bermuda
      const shortsGeo = new THREE.CylinderGeometry(0.28, 0.25, 0.28, 16);
      const shortsMesh = new THREE.Mesh(shortsGeo, shortsMat);
      shortsMesh.position.y = 0.48;
      shortsMesh.castShadow = true;
      group.add(shortsMesh);

      // 4. Regata
      const torsoGeo = new THREE.CylinderGeometry(0.32, 0.27, 0.48, 18);
      const torsoMesh = new THREE.Mesh(torsoGeo, jerseyMat);
      torsoMesh.position.y = 0.78;
      torsoMesh.castShadow = true;
      group.add(torsoMesh);

      // 5. Cabeça
      const neckGeo = new THREE.CylinderGeometry(0.09, 0.10, 0.12, 12);
      const neck = new THREE.Mesh(neckGeo, skinMat);
      neck.position.y = 1.04;
      group.add(neck);

      const headGeo = new THREE.SphereGeometry(0.20, 18, 18);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 1.20;
      head.castShadow = true;
      group.add(head);

      // Viseira
      const visorGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16, 1, false, 0, Math.PI);
      const visorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.rotation.y = isAttacker ? -Math.PI / 2 : Math.PI / 2;
      visor.position.set(0, 1.24, isAttacker ? -0.06 : 0.06);
      group.add(visor);

      // Óculos espelhados
      const glassesGeo = new THREE.BoxGeometry(0.26, 0.05, 0.08);
      const glassesMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 });
      const glasses = new THREE.Mesh(glassesGeo, glassesMat);
      glasses.position.set(0, 1.20, isAttacker ? -0.16 : 0.16);
      group.add(glasses);

      // 6. Braços
      if (isBlocker) {
        const armGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.65, 12);
        const handGeo = new THREE.BoxGeometry(0.12, 0.14, 0.03);

        const leftArmGroup = new THREE.Group();
        leftArmGroup.position.set(-0.32, 0.95, 0);
        leftArmGroup.rotation.z = Math.PI / 12;
        leftArmGroup.rotation.x = -Math.PI / 10;

        const leftArm = new THREE.Mesh(armGeo, skinMat);
        leftArm.position.y = 0.30;
        leftArmGroup.add(leftArm);

        const leftHand = new THREE.Mesh(handGeo, skinMat);
        leftHand.position.y = 0.65;
        leftArmGroup.add(leftHand);
        group.add(leftArmGroup);

        const rightArmGroup = new THREE.Group();
        rightArmGroup.position.set(0.32, 0.95, 0);
        rightArmGroup.rotation.z = -Math.PI / 12;
        rightArmGroup.rotation.x = -Math.PI / 10;

        const rightArm = new THREE.Mesh(armGeo, skinMat);
        rightArm.position.y = 0.30;
        rightArmGroup.add(rightArm);

        const rightHand = new THREE.Mesh(handGeo, skinMat);
        rightHand.position.y = 0.65;
        rightArmGroup.add(rightHand);
        group.add(rightArmGroup);

        const backHands = build3DHandSignalMesh(currentSignal);
        group.add(backHands);
        blockerBackHandsGroupRef.current = backHands;
      } else if (isDefender) {
        const mancheteGroup = new THREE.Group();
        mancheteGroup.position.set(0, 0.68, 0.28);
        mancheteGroup.rotation.x = Math.PI / 3.8;

        const forearmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.45, 12);
        const fistGeo = new THREE.BoxGeometry(0.10, 0.08, 0.07);

        const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
        leftForearm.position.set(-0.06, 0.16, 0);
        mancheteGroup.add(leftForearm);

        const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
        rightForearm.position.set(0.06, 0.16, 0);
        mancheteGroup.add(rightForearm);

        const hands = new THREE.Mesh(fistGeo, skinMat);
        hands.position.set(0, 0.40, 0);
        mancheteGroup.add(hands);

        group.add(mancheteGroup);
        group.rotation.x = THREE.MathUtils.degToRad(8);
      } else if (isAttacker) {
        const balanceArmGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.55, 12);
        const leftArm = new THREE.Mesh(balanceArmGeo, skinMat);
        leftArm.position.set(-0.35, 0.95, -0.15);
        leftArm.rotation.x = -Math.PI / 4;
        group.add(leftArm);

        const spikeArmPivot = new THREE.Group();
        spikeArmPivot.position.set(0.35, 1.0, 0);

        const hittingArm = new THREE.Mesh(balanceArmGeo, skinMat);
        hittingArm.position.y = 0.25;
        spikeArmPivot.add(hittingArm);

        const hittingHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.03), skinMat);
        hittingHand.position.y = 0.55;
        spikeArmPivot.add(hittingHand);

        group.add(spikeArmPivot);
        oppHittingArmRef.current = spikeArmPivot;
      }

      // 7. Badge Label
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = isBlocker ? '#0284c7' : isDefender ? '#f59e0b' : '#dc2626';
      ctx.beginPath();
      ctx.roundRect(14, 14, 228, 100, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${label} #${jerseyNumber}`, 128, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.y = 1.72;
      sprite.scale.set(1.15, 0.58, 1);
      group.add(sprite);

      group.userData = { playerId: label };
      return group;
    },
    [build3DHandSignalMesh]
  );

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a101d);
    scene.fog = new THREE.FogExp2(0x0a101d, 0.015);

    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.set(13.5, 10.5, 15.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 5.5;
    controls.maxDistance = 42.0;
    controls.target.set(0, 0.8, 0);
    controlsRef.current = controls;

    // Coastal Lighting
    const ambientLight = new THREE.AmbientLight(0xfffbeb, 0.8);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0xd97706, 0.7);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfef08a, 1.6);
    sunLight.position.set(12, 16, 12);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    const skyFill = new THREE.DirectionalLight(0x38bdf8, 0.5);
    skyFill.position.set(-12, 10, -12);
    scene.add(skyFill);

    // 1. ARENA BASE & SAND COURT
    const frameGeo = new THREE.BoxGeometry(20.0, 0.5, 28.0);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x3d1a04,
      roughness: 0.85,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, -0.25, 0);
    frameMesh.receiveShadow = true;
    frameMesh.raycast = () => null;
    scene.add(frameMesh);

    const sandApronGeo = new THREE.PlaneGeometry(19.4, 27.4);
    const sandApronMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.95,
    });
    const sandApronMesh = new THREE.Mesh(sandApronGeo, sandApronMat);
    sandApronMesh.rotation.x = -Math.PI / 2;
    sandApronMesh.position.set(0, 0.002, 0);
    sandApronMesh.receiveShadow = true;
    sandApronMesh.raycast = () => null;
    scene.add(sandApronMesh);

    const courtSandGeo = new THREE.PlaneGeometry(8.0, 16.0);
    const courtSandMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.92,
    });
    const courtSandMesh = new THREE.Mesh(courtSandGeo, courtSandMat);
    courtSandMesh.rotation.x = -Math.PI / 2;
    courtSandMesh.position.set(0, 0.006, 0);
    courtSandMesh.receiveShadow = true;
    courtSandMesh.raycast = () => null;
    scene.add(courtSandMesh);

    // Boundary Ribbons
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
    const createRibbon = (w: number, h: number, x: number, z: number) => {
      const g = new THREE.PlaneGeometry(w, h);
      const m = new THREE.Mesh(g, ribbonMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.012, z);
      m.raycast = () => null;
      scene.add(m);
    };

    const ribbonW = 0.06;
    createRibbon(ribbonW, 16.0, -4.0 + ribbonW / 2, 0);
    createRibbon(ribbonW, 16.0, 4.0 - ribbonW / 2, 0);
    createRibbon(8.0, ribbonW, 0, 8.0 - ribbonW / 2);
    createRibbon(8.0, ribbonW, 0, -8.0 + ribbonW / 2);

    // 2. NET & POSTS
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });
    const padMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.5 });

    const createPost = (x: number) => {
      const postGeo = new THREE.CylinderGeometry(0.065, 0.065, 3.2, 18);
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, 1.6, 0);
      post.castShadow = true;
      post.raycast = () => null;
      scene.add(post);

      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.8, 16), padMat);
      pad.position.set(x, 0.9, 0);
      pad.castShadow = true;
      pad.raycast = () => null;
      scene.add(pad);
    };

    createPost(-4.5);
    createPost(4.5);

    const netGeo = new THREE.PlaneGeometry(8.8, 1.0, 44, 10);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      wireframe: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const netMesh = new THREE.Mesh(netGeo, netMat);
    netMesh.position.set(0, 1.93, 0);
    netMesh.raycast = () => null;
    scene.add(netMesh);

    const topBand = new THREE.Mesh(
      new THREE.BoxGeometry(8.8, 0.07, 0.035),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 })
    );
    topBand.position.set(0, 2.43, 0);
    topBand.raycast = () => null;
    scene.add(topBand);

    const createAntenna = (x: number) => {
      const ant = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 1.8, 10),
        new THREE.MeshStandardMaterial({ color: 0xef4444 })
      );
      ant.position.set(x, 2.33, 0);
      ant.raycast = () => null;
      scene.add(ant);
    };
    createAntenna(-4.0);
    createAntenna(4.0);

    // 3. DEFENSIVE SHADOW CONE (STRICTLY NON-RAYCASTABLE & BOUND TO BLOCKER)
    const coneGroup = new THREE.Group();
    coneGroup.name = 'DefensiveShadowCone';
    const coneGeo = new THREE.ConeGeometry(2.8, 6.0, 16);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.rotation.x = Math.PI / 2;
    coneMesh.position.set(0, 0.015, 3.2);
    // CRITICAL: Disable raycasting completely so clicks never select or move the cone
    coneMesh.raycast = () => null;
    coneGroup.add(coneMesh);
    scene.add(coneGroup);
    shadowConeMeshRef.current = coneMesh;

    // 4. BIRUTA 3D (Windsock)
    const windGroup = new THREE.Group();
    windGroup.position.set(-5.5, 0, -9.0);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 3.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
    );
    pole.position.y = 1.6;
    pole.raycast = () => null;
    windGroup.add(pole);

    const sock = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 })
    );
    sock.rotation.z = Math.PI / 2;
    sock.position.set(0.4, 3.1, 0);
    sock.raycast = () => null;
    windGroup.add(sock);
    scene.add(windGroup);
    windIndicatorGroupRef.current = windGroup;

    // 5. BONECOS 3D
    playerMeshesRef.current.clear();

    // 5.1 Atacante Adversário (#9)
    const initialAttackerX = attackerSide === 'left' ? -2.4 : 2.4;
    const oppAttackerBoneco = createHumanoidBoneco('ATAC', 9, 'ATACANTE', currentSignalRef.current, false);
    oppAttackerBoneco.position.set(initialAttackerX, 0, -2.5);
    scene.add(oppAttackerBoneco);
    oppAttackerGroupRef.current = oppAttackerBoneco;

    const oppDecal = createGroundDecal('ATACANTE #9', 0xef4444, 0.72);
    oppDecal.position.set(initialAttackerX, 0.014, -2.5);
    scene.add(oppDecal);
    oppAttackerDecalRef.current = oppDecal;

    // 5.2 Bloqueador (#1)
    const blockerPlayer = players.find((p) => p.id === 'BLOQ') || {
      id: 'BLOQ',
      role: 'P2',
      label: 'BLOQ',
      roleName: 'Bloqueador da Rede',
      jerseyNumber: 1,
      rotationIndex: 2,
      x: 25,
      y: 12,
      isFrontRow: true,
    };
    const blkCoords = mapPlayerTo3D(blockerPlayer);
    const blockerBoneco = createHumanoidBoneco('BLOQ', 1, 'BLOQ', currentSignalRef.current, selectedPlayerId === 'BLOQ');
    blockerBoneco.position.set(blkCoords.x, 0, blkCoords.z);
    scene.add(blockerBoneco);
    blockerGroupRef.current = blockerBoneco;
    playerMeshesRef.current.set('BLOQ', blockerBoneco);

    const blkDecal = createGroundDecal('BLOQUEIO #1', 0x0284c7, 0.75);
    blkDecal.position.set(blkCoords.x, 0.014, blkCoords.z);
    scene.add(blkDecal);
    blockerDecalRef.current = blkDecal;

    // Initialize shadow cone glued to blocker
    updateShadowConeAnchor(blkCoords, currentSignalRef.current, attackerSide);

    // 5.3 Defensor (#2)
    const defenderPlayer = players.find((p) => p.id === 'DEF') || {
      id: 'DEF',
      role: 'P1',
      label: 'DEF',
      roleName: 'Defensor de Fundo',
      jerseyNumber: 2,
      rotationIndex: 1,
      x: 18,
      y: 78,
      isFrontRow: false,
    };
    const defCoords = mapPlayerTo3D(defenderPlayer);
    const defenderBoneco = createHumanoidBoneco('DEF', 2, 'DEF', currentSignalRef.current, selectedPlayerId === 'DEF');
    defenderBoneco.position.set(defCoords.x, 0, defCoords.z);
    scene.add(defenderBoneco);
    defenderGroupRef.current = defenderBoneco;
    playerMeshesRef.current.set('DEF', defenderBoneco);

    const defDecal = createGroundDecal('DEFESA #2', 0xf59e0b, 0.80);
    defDecal.position.set(defCoords.x, 0.014, defCoords.z);
    scene.add(defDecal);
    defenderDecalRef.current = defDecal;

    // 6. VOLLEYBALL
    const ballCanvas = document.createElement('canvas');
    ballCanvas.width = 512;
    ballCanvas.height = 256;
    const bCtx = ballCanvas.getContext('2d')!;
    bCtx.fillStyle = '#ffffff';
    bCtx.fillRect(0, 0, 512, 256);
    bCtx.fillStyle = '#facc15';
    bCtx.beginPath();
    bCtx.ellipse(140, 128, 120, 65, Math.PI / 4, 0, Math.PI * 2);
    bCtx.fill();
    bCtx.fillStyle = '#1d4ed8';
    bCtx.beginPath();
    bCtx.ellipse(370, 128, 120, 65, -Math.PI / 4, 0, Math.PI * 2);
    bCtx.fill();

    const ballTexture = new THREE.CanvasTexture(ballCanvas);
    const ballGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.45,
      metalness: 0.1,
    });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.castShadow = !isSoftwareGl;
    ball.position.set(0, -10, 0);
    ball.raycast = () => null;
    scene.add(ball);
    ballMeshRef.current = ball;

    const ballShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.22, 16),
      new THREE.MeshBasicMaterial({
        color: 0x78350f,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
    );
    ballShadow.rotation.x = -Math.PI / 2;
    ballShadow.position.set(0, 0.012, 0);
    ballShadow.raycast = () => null;
    scene.add(ballShadow);
    ballShadowMeshRef.current = ballShadow;

    // 7. TRAJECTORY LINE
    const trajLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({
        color: 0xf59e0b,
        dashSize: 0.25,
        gapSize: 0.12,
      })
    );
    trajLine.raycast = () => null;
    scene.add(trajLine);
    trajectoryLineRef.current = trajLine;

    // 8. SAND BURST PARTICLES
    const particleCount = 36;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const sandParticles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0xfde047,
        size: 0.14,
        transparent: true,
        opacity: 0.0,
      })
    );
    sandParticles.raycast = () => null;
    scene.add(sandParticles);
    sandBurstParticlesRef.current = sandParticles;

    // 9. ANIMATION TICK LOOP
    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();

      // Camera lerp
      if (isTransitioningCam.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.08);
        controlsRef.current.target.lerp(targetLookAt.current, 0.08);
        if (cameraRef.current.position.distanceTo(targetCamPos.current) < 0.05) {
          isTransitioningCam.current = false;
        }
      }

      // Action execution progression
      const activeScenario = currentScenarioRef.current;
      const isRunning = isExecutingRef.current;

      if (activeScenario && isRunning) {
        const totalDuration = (activeScenario.flightDuration / speedRef.current) + 0.9;
        animTimeRef.current += delta;
        const normalized = Math.min(1.0, animTimeRef.current / totalDuration);

        const outcome = resolvedOutcomeRef.current;
        const defStart = userPlacedDefenderStart.current;
        const blkStart = userPlacedBlockerStart.current;

        // 1. Boneco Atacante Animation
        if (oppAttackerGroupRef.current) {
          oppAttackerGroupRef.current.position.set(
            activeScenario.attackerCoords.x,
            0,
            activeScenario.attackerCoords.z
          );

          if (normalized < 0.22) {
            const jumpHeight = Math.sin((normalized / 0.22) * Math.PI) * 0.75;
            oppAttackerGroupRef.current.position.y = jumpHeight;
            if (oppHittingArmRef.current) {
              oppHittingArmRef.current.rotation.x = -Math.PI * 0.7 * (normalized / 0.22);
            }
            setAnimationPhaseLabel('1. Salto e armada do atacante adversário!');
          } else if (normalized < 0.35) {
            oppAttackerGroupRef.current.position.y = 0.5 * (1 - (normalized - 0.22) / 0.13);
            if (oppHittingArmRef.current) {
              oppHittingArmRef.current.rotation.x = Math.PI * 0.45;
            }
            setAnimationPhaseLabel('2. Pancada na bola sobre a fita da rede!');
          } else {
            oppAttackerGroupRef.current.position.y = 0;
            if (oppHittingArmRef.current) {
              oppHittingArmRef.current.rotation.x = 0;
            }
          }
        }

        // 2. Boneco Bloqueador Animation (Starts from user-placed position)
        if (blockerGroupRef.current) {
          if (outcome === 'toco') {
            // Blocker executes jump at net tape to stuff the ball
            let jumpY = 0;
            if (normalized >= 0.18 && normalized <= 0.70) {
              const prog = (normalized - 0.18) / 0.52;
              jumpY = Math.sin(prog * Math.PI) * 0.76;
            }
            blockerGroupRef.current.position.set(activeScenario.netCrossCoords.x, jumpY, 0.55);
            if (blockerDecalRef.current) {
              blockerDecalRef.current.position.set(activeScenario.netCrossCoords.x, 0.014, 0.55);
            }
          } else {
            // Blocker jumps from wherever user placed him
            let jumpY = 0;
            if (activeScenario.blockerJump && normalized >= 0.18 && normalized <= 0.65) {
              const prog = (normalized - 0.18) / 0.47;
              jumpY = Math.sin(prog * Math.PI) * 0.68;
            }
            blockerGroupRef.current.position.set(blkStart.x, jumpY, blkStart.z);
            if (blockerDecalRef.current) {
              blockerDecalRef.current.position.set(blkStart.x, 0.014, blkStart.z);
            }
          }
        }

        // 3. Boneco Defensor Animation (Starts STRICTLY from user-placed position)
        if (defenderGroupRef.current) {
          const targetCoords = activeScenario.targetContactCoords;

          if (outcome === 'toco') {
            // Defender stays at placed position, in stance, then celebrates
            defenderGroupRef.current.position.set(defStart.x, 0, defStart.z);
            defenderGroupRef.current.rotation.x = THREE.MathUtils.degToRad(normalized > 0.5 ? -10 : 8);
          } else if (outcome === 'defense') {
            // Defender sprints and dives from user-placed position to the ball contact point!
            if (normalized < 0.22) {
              defenderGroupRef.current.position.set(defStart.x, 0, defStart.z);
              defenderGroupRef.current.rotation.x = THREE.MathUtils.degToRad(8);
            } else if (normalized <= 0.85) {
              const sprintProg = (normalized - 0.22) / 0.63;
              defenderGroupRef.current.position.x = THREE.MathUtils.lerp(defStart.x, targetCoords.x, sprintProg);
              defenderGroupRef.current.position.z = THREE.MathUtils.lerp(defStart.z, targetCoords.z, sprintProg);
              defenderGroupRef.current.rotation.x = THREE.MathUtils.degToRad(16 * Math.sin(sprintProg * Math.PI * 4));
            } else {
              defenderGroupRef.current.position.set(targetCoords.x, 0, targetCoords.z);
              defenderGroupRef.current.rotation.x = THREE.MathUtils.degToRad(-14);
            }
          } else {
            // Opponent Point! Defender was placed too far away; dives in vain but falls short!
            if (normalized < 0.22) {
              defenderGroupRef.current.position.set(defStart.x, 0, defStart.z);
              defenderGroupRef.current.rotation.x = THREE.MathUtils.degToRad(8);
            } else if (normalized <= 0.85) {
              const sprintProg = (normalized - 0.22) / 0.63;
              // Reaches at most 1.5m towards the ball from user position
              const dirX = targetCoords.x - defStart.x;
              const dirZ = targetCoords.z - defStart.z;
              const totalDist = Math.hypot(dirX, dirZ);
              const maxReach = Math.min(1.6, totalDist * 0.65);
              const reachX = defStart.x + (dirX / (totalDist || 1)) * (maxReach * sprintProg);
              const reachZ = defStart.z + (dirZ / (totalDist || 1)) * (maxReach * sprintProg);

              defenderGroupRef.current.position.x = reachX;
              defenderGroupRef.current.position.z = reachZ;
              defenderGroupRef.current.rotation.x = THREE.MathUtils.degToRad(20 * sprintProg); // Desperation dive
            } else {
              // Fallen in the sand, missed ball
              defenderGroupRef.current.rotation.x = THREE.MathUtils.degToRad(35);
            }
          }
        }

        // 4. Ball Flight Animation
        if (ballMeshRef.current && ballShadowMeshRef.current) {
          if (normalized < 0.22) {
            ballMeshRef.current.position.set(
              activeScenario.attackerCoords.x,
              activeScenario.attackerCoords.y + (oppAttackerGroupRef.current?.position.y || 0) * 0.5,
              activeScenario.attackerCoords.z + 0.3
            );
            ballShadowMeshRef.current.position.set(ballMeshRef.current.position.x, 0.012, ballMeshRef.current.position.z);
          } else if (outcome === 'toco') {
            // MONSTER BLOCK (TOCO)
            if (normalized <= 0.48) {
              const flightProg = (normalized - 0.22) / 0.26;
              const p0 = activeScenario.attackerCoords;
              const curX = THREE.MathUtils.lerp(p0.x, activeScenario.netCrossCoords.x, flightProg);
              const curY = THREE.MathUtils.lerp(p0.y, 2.58, flightProg);
              const curZ = THREE.MathUtils.lerp(p0.z, 0.0, flightProg);

              ballMeshRef.current.position.set(curX, curY, curZ);
              ballMeshRef.current.rotation.x += delta * 18;
              ballShadowMeshRef.current.position.set(curX, 0.012, curZ);
              setAnimationPhaseLabel('⚡ 2. Bola na fita — Bloqueador sobe para fechar a porta!');
            } else if (normalized <= 0.82) {
              const reboundProg = (normalized - 0.48) / 0.34;
              const pTape = activeScenario.netCrossCoords;
              const pGround = activeScenario.blockReboundCoords;

              const oneMinus = 1 - reboundProg;
              const curX = oneMinus * pTape.x + reboundProg * pGround.x;
              const curY = (1 - reboundProg * reboundProg) * 2.58 + reboundProg * reboundProg * 0.05;
              const curZ = oneMinus * 0.0 + reboundProg * pGround.z;

              ballMeshRef.current.position.set(curX, curY, curZ);
              ballMeshRef.current.rotation.x -= delta * 25;
              ballShadowMeshRef.current.position.set(curX, 0.012, curZ);
              setAnimationPhaseLabel('🛑 3. IMPACTO NA FITA! O bloqueador amortece e crava para baixo!');
            } else {
              const groundProg = (normalized - 0.82) / 0.18;
              const bounceY = 0.05 + Math.sin(groundProg * Math.PI) * 0.20;
              ballMeshRef.current.position.set(
                activeScenario.blockReboundCoords.x,
                bounceY,
                activeScenario.blockReboundCoords.z
              );
              ballShadowMeshRef.current.position.set(
                activeScenario.blockReboundCoords.x,
                0.012,
                activeScenario.blockReboundCoords.z
              );
              setAnimationPhaseLabel('🛑 4. PONTO DE BLOQUEIO! TOCO NO CHÃO ADVERSÁRIO!');
            }
          } else if (outcome === 'defense') {
            // DEFESA SALVA
            if (normalized <= 0.85) {
              const flightProgress = (normalized - 0.22) / 0.63;
              const p0 = activeScenario.attackerCoords;
              const pApex = activeScenario.netCrossCoords;
              const pTarget = activeScenario.targetContactCoords;

              const oneMinus = 1 - flightProgress;
              const curX = oneMinus * oneMinus * p0.x + 2 * oneMinus * flightProgress * pApex.x + flightProgress * flightProgress * pTarget.x;
              const curY = oneMinus * oneMinus * p0.y + 2 * oneMinus * flightProgress * activeScenario.ballApexY + flightProgress * flightProgress * pTarget.y;
              const curZ = oneMinus * oneMinus * p0.z + 2 * oneMinus * flightProgress * pApex.z + flightProgress * flightProgress * pTarget.z;

              ballMeshRef.current.position.set(curX, curY, curZ);
              ballMeshRef.current.rotation.x += delta * 15;
              ballShadowMeshRef.current.position.set(curX, 0.012, curZ);
              setAnimationPhaseLabel('3. Bola cruzando a rede — Defensor em deslocamento...');
            } else {
              const postProg = (normalized - 0.85) / 0.15;
              const defPopY = activeScenario.targetContactCoords.y + Math.sin(postProg * Math.PI) * 1.85;
              const defPopX = THREE.MathUtils.lerp(activeScenario.targetContactCoords.x, 0.5, postProg);
              const defPopZ = THREE.MathUtils.lerp(activeScenario.targetContactCoords.z, 2.2, postProg);

              ballMeshRef.current.position.set(defPopX, defPopY, defPopZ);
              ballShadowMeshRef.current.position.set(defPopX, 0.012, defPopZ);
              setAnimationPhaseLabel('✅ 4. DEFESA PERFEITA! Bola erguida para contra-ataque!');
            }
          } else {
            // PONTO ADVERSÁRIO (BOLA NO CHÃO DA NOSSA QUADRA)
            if (normalized <= 0.85) {
              const flightProgress = (normalized - 0.22) / 0.63;
              const p0 = activeScenario.attackerCoords;
              const pApex = activeScenario.netCrossCoords;
              const pTarget = activeScenario.targetContactCoords;

              const oneMinus = 1 - flightProgress;
              const curX = oneMinus * oneMinus * p0.x + 2 * oneMinus * flightProgress * pApex.x + flightProgress * flightProgress * pTarget.x;
              const curY = oneMinus * oneMinus * p0.y + 2 * oneMinus * flightProgress * activeScenario.ballApexY + flightProgress * flightProgress * 0.05;
              const curZ = oneMinus * oneMinus * p0.z + 2 * oneMinus * flightProgress * pApex.z + flightProgress * flightProgress * pTarget.z;

              ballMeshRef.current.position.set(curX, curY, curZ);
              ballMeshRef.current.rotation.x += delta * 16;
              ballShadowMeshRef.current.position.set(curX, 0.012, curZ);
              setAnimationPhaseLabel('3. Bola em voo rápido em direção à zona desprotegida!');
            } else {
              // Ball struck the sand on our court
              const deadProg = (normalized - 0.85) / 0.15;
              const smallBounce = 0.05 + Math.sin(deadProg * Math.PI) * 0.18 * (1 - deadProg);
              ballMeshRef.current.position.set(
                activeScenario.targetContactCoords.x,
                smallBounce,
                activeScenario.targetContactCoords.z
              );
              ballShadowMeshRef.current.position.set(
                activeScenario.targetContactCoords.x,
                0.012,
                activeScenario.targetContactCoords.z
              );
              setAnimationPhaseLabel('💥 4. PONTO DO ADVERSÁRIO! A bola tocou na areia da sua quadra!');
            }
          }
        }

        // 5. Sand Burst Particles
        if (sandBurstParticlesRef.current) {
          const burstContact = outcome === 'toco'
            ? activeScenario.blockReboundCoords
            : activeScenario.targetContactCoords;
          const burstStart = 0.82;
          const burstEnd = 0.98;

          if (normalized >= burstStart && normalized <= burstEnd) {
            const burstProg = (normalized - burstStart) / (burstEnd - burstStart);
            const positions = sandBurstParticlesRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < particleCount; i++) {
              const angle = (i / particleCount) * Math.PI * 2;
              const radius = 0.2 + burstProg * 0.95;
              positions[i * 3] = burstContact.x + Math.cos(angle) * radius;
              positions[i * 3 + 1] = 0.05 + Math.sin(burstProg * Math.PI) * 0.70;
              positions[i * 3 + 2] = burstContact.z + Math.sin(angle) * radius;
            }
            sandBurstParticlesRef.current.geometry.attributes.position.needsUpdate = true;
            (sandBurstParticlesRef.current.material as THREE.PointsMaterial).opacity = 0.95 * (1 - burstProg);
          } else {
            (sandBurstParticlesRef.current.material as THREE.PointsMaterial).opacity = 0.0;
          }
        }

        // Check if finished (normalized reached 1.0)
        if (normalized >= 1.0 && !playHasFinishedRef.current) {
          playHasFinishedRef.current = true;
          if (onPlayCompleted) {
            const target = activeScenario.targetContactCoords;
            const defDistance = Math.hypot(defStart.x - target.x, defStart.z - target.z);
            onPlayCompleted({
              outcome,
              defenderDistance: defDistance,
              blockerMatched: outcome === 'toco',
              scenario: activeScenario,
            });
          }
        }
      } else {
        // Idle / Positioning State: Keep bonecos anchored to user-defined coordinates
        const currentPlayers = playersRef.current;
        const blkPlayer = currentPlayers.find((p) => p.id === 'BLOQ');
        const defPlayer = currentPlayers.find((p) => p.id === 'DEF');

        if (blockerGroupRef.current && blkPlayer && !isDraggingRef.current) {
          const c = mapPlayerTo3D(blkPlayer);
          blockerGroupRef.current.position.set(c.x, 0, c.z);
          if (blockerDecalRef.current) blockerDecalRef.current.position.set(c.x, 0.014, c.z);
          updateShadowConeAnchor(c, currentSignalRef.current, attackerSide);
        }

        if (defenderGroupRef.current && defPlayer && !isDraggingRef.current) {
          const c = mapPlayerTo3D(defPlayer);
          defenderGroupRef.current.position.set(c.x, 0, c.z);
          if (defenderDecalRef.current) defenderDecalRef.current.position.set(c.x, 0.014, c.z);
        }

        if (oppAttackerGroupRef.current && activeScenario) {
          oppAttackerGroupRef.current.position.set(activeScenario.attackerCoords.x, 0, activeScenario.attackerCoords.z);
          if (oppAttackerDecalRef.current) {
            oppAttackerDecalRef.current.position.set(activeScenario.attackerCoords.x, 0.014, activeScenario.attackerCoords.z);
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [attackerSide, mapPlayerTo3D, createHumanoidBoneco, updateShadowConeAnchor]);

  // Update Trajectory Preview line
  useEffect(() => {
    const line = trajectoryLineRef.current;
    if (!line || !attackScenario) return;

    const points: THREE.Vector3[] = [];
    const p0 = new THREE.Vector3(attackScenario.attackerCoords.x, attackScenario.attackerCoords.y, attackScenario.attackerCoords.z);
    const pApex = new THREE.Vector3(attackScenario.netCrossCoords.x, attackScenario.ballApexY, attackScenario.netCrossCoords.z);

    const isBlock =
      forceOutcome === 'block_point' ||
      (forceOutcome !== 'defense_dig' && beachSignal === attackScenario.blockDirectBlockSignal);

    if (isBlock) {
      for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        const oneMinus = 1 - t;
        const x = THREE.MathUtils.lerp(p0.x, pApex.x, t);
        const y = oneMinus * oneMinus * p0.y + 2 * oneMinus * t * attackScenario.ballApexY + t * t * 2.58;
        const z = THREE.MathUtils.lerp(p0.z, 0.0, t);
        points.push(new THREE.Vector3(x, y, z));
      }
      const pRebound = new THREE.Vector3(
        attackScenario.blockReboundCoords.x,
        0.05,
        attackScenario.blockReboundCoords.z
      );
      for (let i = 1; i <= 16; i++) {
        const t = i / 16;
        const x = THREE.MathUtils.lerp(pApex.x, pRebound.x, t);
        const y = (1 - t * t) * 2.58 + t * t * 0.05;
        const z = THREE.MathUtils.lerp(0.0, pRebound.z, t);
        points.push(new THREE.Vector3(x, y, z));
      }
      (line.material as THREE.LineDashedMaterial).color.setHex(0xef4444);
    } else {
      const pTarget = new THREE.Vector3(attackScenario.targetContactCoords.x, attackScenario.targetContactCoords.y, attackScenario.targetContactCoords.z);
      for (let i = 0; i <= 32; i++) {
        const t = i / 32;
        const oneMinus = 1 - t;
        const x = oneMinus * oneMinus * p0.x + 2 * oneMinus * t * pApex.x + t * t * pTarget.x;
        const y = oneMinus * oneMinus * p0.y + 2 * oneMinus * t * pApex.y + t * t * pTarget.y;
        const z = oneMinus * oneMinus * p0.z + 2 * oneMinus * t * pApex.z + t * t * pTarget.z;
        points.push(new THREE.Vector3(x, y, z));
      }
      (line.material as THREE.LineDashedMaterial).color.setHex(0xf59e0b);
    }

    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints(points);
    line.computeLineDistances();
  }, [attackScenario, beachSignal, forceOutcome]);

  // Update Shadow Cone visibility & anchor
  useEffect(() => {
    const cone = shadowConeMeshRef.current;
    if (!cone) return;
    cone.visible = showShadowCones;

    const blocker = players.find((p) => p.id === 'BLOQ');
    if (blocker) {
      const coords = mapPlayerTo3D(blocker);
      updateShadowConeAnchor(coords, beachSignal, attackerSide);
    }
  }, [beachSignal, attackerSide, showShadowCones, players, mapPlayerTo3D, updateShadowConeAnchor]);

  // Update Windsock
  useEffect(() => {
    const windGroup = windIndicatorGroupRef.current;
    if (!windGroup) return;

    if (wind === 'favor') {
      windGroup.rotation.y = 0;
    } else if (wind === 'against') {
      windGroup.rotation.y = Math.PI;
    } else if (wind === 'cross_left') {
      windGroup.rotation.y = Math.PI / 2;
    } else if (wind === 'cross_right') {
      windGroup.rotation.y = -Math.PI / 2;
    } else {
      windGroup.rotation.y = 0;
    }
  }, [wind]);

  // Update 3D Hand Signals on Blocker's Lower Back
  useEffect(() => {
    if (blockerGroupRef.current) {
      if (blockerBackHandsGroupRef.current) {
        blockerGroupRef.current.remove(blockerBackHandsGroupRef.current);
      }
      const newBackHands = build3DHandSignalMesh(beachSignal);
      blockerGroupRef.current.add(newBackHands);
      blockerBackHandsGroupRef.current = newBackHands;
    }
  }, [beachSignal, build3DHandSignalMesh]);

  // Synchronize player positions
  useEffect(() => {
    if (!isExecutingPlay) {
      players.forEach((player) => {
        const coords = mapPlayerTo3D(player);
        if (player.id === 'BLOQ' && blockerGroupRef.current) {
          blockerGroupRef.current.position.set(coords.x, 0, coords.z);
          if (blockerDecalRef.current) blockerDecalRef.current.position.set(coords.x, 0.014, coords.z);
          updateShadowConeAnchor(coords, beachSignal, attackerSide);
        } else if (player.id === 'DEF' && defenderGroupRef.current) {
          defenderGroupRef.current.position.set(coords.x, 0, coords.z);
          if (defenderDecalRef.current) defenderDecalRef.current.position.set(coords.x, 0.014, coords.z);
        }
      });
    }
  }, [players, attackerSide, beachSignal, isExecutingPlay, mapPlayerTo3D, updateShadowConeAnchor]);

  // Pointer Interaction Handlers (STRICTLY ON BLOQ AND DEF BONECOS ONLY)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !mountRef.current || !cameraRef.current || !sceneRef.current) return;
    if (isExecutingPlay) return; // Disallow dragging while ball is in motion

    const rect = mountRef.current.getBoundingClientRect();
    mouseVec.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouseVec.current, cameraRef.current);

    // STRICT: Only gather meshes from BLOQ and DEF
    const playerObjects: THREE.Object3D[] = [];
    const bloq = playerMeshesRef.current.get('BLOQ');
    const def = playerMeshesRef.current.get('DEF');

    [bloq, def].forEach((group) => {
      if (group) {
        group.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) playerObjects.push(child);
        });
      }
    });

    const intersects = raycaster.current.intersectObjects(playerObjects, false);
    if (intersects.length > 0) {
      let rootGroup: THREE.Object3D | null = intersects[0].object;
      while (rootGroup && !rootGroup.userData?.playerId) {
        rootGroup = rootGroup.parent;
      }

      if (rootGroup && rootGroup.userData?.playerId) {
        const pId = rootGroup.userData.playerId;
        const playerObj = players.find((p) => p.id === pId);
        if (playerObj) {
          isDraggingRef.current = true;
          draggedPlayerIdRef.current = pId;
          hasMovedRef.current = false;
          pointerDownInfoRef.current = {
            x: e.clientX,
            y: e.clientY,
            time: Date.now(),
            player: playerObj,
          };

          if (controlsRef.current) controlsRef.current.enabled = false;
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !mountRef.current || !cameraRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    mouseVec.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (isDraggingRef.current && draggedPlayerIdRef.current) {
      if (pointerDownInfoRef.current) {
        const dist = Math.hypot(
          e.clientX - pointerDownInfoRef.current.x,
          e.clientY - pointerDownInfoRef.current.y
        );
        if (dist > 4) {
          hasMovedRef.current = true;
        }
      }

      raycaster.current.setFromCamera(mouseVec.current, cameraRef.current);
      const intersectPoint = new THREE.Vector3();
      if (raycaster.current.ray.intersectPlane(planeRaycast.current, intersectPoint)) {
        const meshGroup = playerMeshesRef.current.get(draggedPlayerIdRef.current);
        if (meshGroup) {
          meshGroup.position.x = Math.max(-3.8, Math.min(3.8, intersectPoint.x));
          meshGroup.position.z = Math.max(0.4, Math.min(7.6, intersectPoint.z));

          // Also move the decal
          if (draggedPlayerIdRef.current === 'BLOQ' && blockerDecalRef.current) {
            blockerDecalRef.current.position.set(meshGroup.position.x, 0.014, meshGroup.position.z);
            updateShadowConeAnchor({ x: meshGroup.position.x, z: meshGroup.position.z }, beachSignal, attackerSide);
          } else if (draggedPlayerIdRef.current === 'DEF' && defenderDecalRef.current) {
            defenderDecalRef.current.position.set(meshGroup.position.x, 0.014, meshGroup.position.z);
          }

          if (onPlayerMove) {
            const newPos = map3DToPlayer(meshGroup.position.x, meshGroup.position.z);
            onPlayerMove(draggedPlayerIdRef.current, newPos.x, newPos.y);
          }
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (controlsRef.current) controlsRef.current.enabled = true;

    if (pointerDownInfoRef.current && !hasMovedRef.current) {
      const { player, time } = pointerDownInfoRef.current;
      const elapsed = Date.now() - time;

      if (elapsed < 300) {
        const now = Date.now();
        if (
          lastClickRef.current &&
          lastClickRef.current.playerId === player.id &&
          now - lastClickRef.current.time < 400
        ) {
          if (onPlayerDoubleClick) {
            onPlayerDoubleClick(player);
          }
          lastClickRef.current = null;
        } else {
          lastClickRef.current = { playerId: player.id, time: now };
        }
      }
    } else {
      lastClickRef.current = null;
    }

    isDraggingRef.current = false;
    draggedPlayerIdRef.current = null;
    pointerDownInfoRef.current = null;
    hasMovedRef.current = false;
  };

  return (
    <div className="relative w-full h-[600px] sm:h-[680px] lg:h-[720px] rounded-2xl overflow-hidden bg-slate-950 border border-amber-900/40 shadow-2xl select-none group">
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Top Left Badge: Title, Signal & Wind Status */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none max-w-[85%] sm:max-w-none">
        <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-amber-500/50 text-amber-300 text-xs font-bold shadow-lg flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="tracking-wide">Arena 3D Vôlei de Praia</span>
          <span className="text-[10px] text-amber-400/80 font-mono">16x8m FIVB</span>
        </div>

        {attackScenario && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-lg flex items-center gap-2 border border-amber-400">
            <span>{attackScenario.icon}</span>
            <span>Ataque: {attackScenario.name}</span>
          </div>
        )}

        <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 text-[11px] font-bold border border-slate-700 flex items-center gap-1.5">
          <span>🖐️ Marcação de Bloqueio:</span>
          <span className="text-amber-400">
            {beachSignal === '1_finger'
              ? '👉 1 Dedo (Linha)'
              : beachSignal === '2_fingers'
              ? '✌️ 2 Dedos (Diagonal)'
              : beachSignal === 'open_hand'
              ? '✋ Mão Aberta (Bola)'
              : beachSignal === 'closed_fist'
              ? '✊ Punho Fechado (Recuo)'
              : '👌 Cut Shade'}
          </span>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-200 text-[11px] font-bold border border-slate-700/90 items-center gap-2 shadow-sm">
          <span className="text-slate-400 font-semibold">Posicionados:</span>
          <span className="flex items-center gap-1 text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>Bloqueio #1
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>Defesa #2 (Você escolhe onde colocar)
          </span>
        </div>
      </div>

      {/* Top Right Live Animation HUD */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 pointer-events-none">
        {attackScenario && (
          <div className="flex flex-col items-end gap-1">
            {currentOutcome && isExecutingPlay && (
              <div
                className={`px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-black shadow-lg flex items-center gap-2 ${
                  currentOutcome === 'toco'
                    ? 'bg-rose-950/95 border-rose-500 text-rose-200 ring-2 ring-rose-500/40'
                    : currentOutcome === 'defense'
                    ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40'
                    : 'bg-red-950/95 border-red-500 text-red-200 ring-2 ring-red-500/40'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-pulse shrink-0 ${
                    currentOutcome === 'toco'
                      ? 'bg-rose-400'
                      : currentOutcome === 'defense'
                      ? 'bg-emerald-400'
                      : 'bg-red-500'
                  }`}
                />
                <span>
                  {currentOutcome === 'toco'
                    ? '🛑 MONSTER BLOCK (TOCO NA FITA)!'
                    : currentOutcome === 'defense'
                    ? '🛡️ DEFESA RECUPERADA (SALVA!)'
                    : '💥 PONTO DO ADVERSÁRIO (BOLA NO CHÃO!)'}
                </span>
              </div>
            )}
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 text-[11px] font-bold shadow-md flex items-center gap-2">
              <span>{animationPhaseLabel}</span>
            </div>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-800 text-slate-300 text-[11px] font-medium">
          <Move className="w-3 h-3 text-slate-400" />
          <span>Gire a arena 3D com o mouse · Duplo clique no boneco para detalhes</span>
        </div>
      </div>

      {/* Primary Action Button (Centralized Bottom Dock) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-2xl transition-all duration-300">
        <div className="flex flex-col items-center">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="mb-1 px-3 py-1 rounded-t-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-t border-x border-slate-700/80 text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Câmeras & Controles 3D</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Minimizar Controles</span>
              </>
            )}
          </button>

          {!isDockCollapsed && (
            <div className="w-full p-2.5 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-slate-800 shadow-2xl flex flex-col gap-2">
              {/* Row 1: Primary Action Button: INICIAR JOGADA */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={onStartPlay}
                    disabled={isExecutingPlay}
                    className={`py-2 px-4 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                      isExecutingPlay
                        ? 'bg-amber-600/60 text-slate-900 cursor-not-allowed opacity-80'
                        : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 ring-2 ring-amber-400/50'
                    }`}
                    title="Executar a jogada a partir das posições onde você colocou o bloqueador e defensor"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>{isExecutingPlay ? 'Executando Jogada...' : '▶️ Iniciar Jogada'}</span>
                  </button>

                  <button
                    onClick={onResetPlay}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                    title="Reposicionar bonecos para tentar novamente"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>↺ Reposicionar</span>
                  </button>
                </div>

                {/* Playback speed toggle */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 hidden sm:inline">
                    Velocidade:
                  </span>
                  <button
                    onClick={() => onChangePlaybackSpeed && onChangePlaybackSpeed(1.0)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all ${
                      playbackSpeed === 1.0
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    1.0x
                  </button>
                  <button
                    onClick={() => onChangePlaybackSpeed && onChangePlaybackSpeed(0.5)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all ${
                      playbackSpeed === 0.5
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    0.5x Lenta
                  </button>
                </div>
              </div>

              {/* Row 2: Camera Presets */}
              <div className="flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
                  <button
                    onClick={() => applyCameraPreset('arena')}
                    className={`px-2.5 py-1.2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      activePreset === 'arena'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Arena Geral</span>
                  </button>

                  <button
                    onClick={() => applyCameraPreset('top')}
                    className={`px-2.5 py-1.2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      activePreset === 'top'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Visão Superior</span>
                  </button>

                  <button
                    onClick={() => applyCameraPreset('net')}
                    className={`px-2.5 py-1.2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      activePreset === 'net'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>Bloqueio</span>
                  </button>

                  <button
                    onClick={() => applyCameraPreset('defender')}
                    className={`px-2.5 py-1.2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      activePreset === 'defender'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>Defesa Fundo</span>
                  </button>

                  <button
                    onClick={() => applyCameraPreset('server')}
                    className={`px-2.5 py-1.2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      activePreset === 'server'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>Sacador</span>
                  </button>
                </div>

                <button
                  onClick={() => applyCameraPreset('arena')}
                  className="hidden sm:flex items-center gap-1 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-all"
                  title="Resetar Câmera"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
