import * as THREE from 'three';
import {
  AnimationPoseKeyframe,
  BodyHighlightPart,
  FundamentalTechniqueVariant,
} from '../types/fundamentals';
import { CourtTheme } from '../types';

export interface ArticulatedAthleteRig {
  root: THREE.Group;
  pelvis: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  lShoulder: THREE.Group;
  lElbow: THREE.Group;
  rShoulder: THREE.Group;
  rElbow: THREE.Group;
  lHip: THREE.Group;
  lKnee: THREE.Group;
  lAnkle: THREE.Group;
  rHip: THREE.Group;
  rKnee: THREE.Group;
  rAnkle: THREE.Group;
  partMaterials: Map<BodyHighlightPart, THREE.MeshStandardMaterial[]>;
  contactShadow: THREE.Mesh;
}

const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();

function pushPartMaterial(
  map: Map<BodyHighlightPart, THREE.MeshStandardMaterial[]>,
  part: BodyHighlightPart,
  mat: THREE.MeshStandardMaterial
) {
  const existing = map.get(part) || [];
  if (!existing.includes(mat)) {
    existing.push(mat);
    map.set(part, existing);
  }
}

/**
 * Generates a procedural 18-panel volleyball albedo CanvasTexture (no external 404s).
 */
export function createVolleyballTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base warm white leather
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 256);

  // Curved aerodynamic yellow & royal blue panels
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(0, 42);
  ctx.bezierCurveTo(140, 10, 220, 115, 360, 75);
  ctx.lineTo(512, 35);
  ctx.lineTo(512, 115);
  ctx.bezierCurveTo(360, 155, 220, 195, 110, 125);
  ctx.lineTo(0, 145);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.moveTo(0, 165);
  ctx.bezierCurveTo(145, 130, 270, 220, 410, 175);
  ctx.lineTo(512, 145);
  ctx.lineTo(512, 232);
  ctx.bezierCurveTo(340, 252, 160, 240, 0, 225);
  ctx.closePath();
  ctx.fill();

  // Panel seams
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 42);
  ctx.bezierCurveTo(140, 10, 220, 115, 360, 75);
  ctx.lineTo(512, 35);
  ctx.moveTo(0, 165);
  ctx.bezierCurveTo(145, 130, 270, 220, 410, 175);
  ctx.lineTo(512, 145);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates procedural jersey number / stripe texture for athlete torso.
 */
function createJerseyTexture(
  primaryHex: string,
  accentHex: string,
  jerseyNum: string,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = primaryHex;
  ctx.fillRect(0, 0, 256, 256);

  // Athletic side chevrons
  ctx.fillStyle = accentHex;
  ctx.fillRect(0, 0, 24, 256);
  ctx.fillRect(232, 0, 24, 256);

  // Subtle fabric weave
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let y = 0; y < 256; y += 8) {
    ctx.fillRect(0, y, 256, 2);
  }

  // Front & back number
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 72px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(jerseyNum, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Generates procedural indoor wood/taraflex court floor texture.
 */
function createCourtSurfaceTexture(
  innerHex: string,
  lineHex: string,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = innerHex;
  ctx.fillRect(0, 0, 512, 1024);

  // Subtle Taraflex micro-grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 64; i++) {
    ctx.fillRect(0, i * 16, 512, 1);
  }

  // Court lines (5cm scaled crisp lines)
  ctx.strokeStyle = lineHex;
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 1016);

  // Center line (y = 512)
  ctx.beginPath();
  ctx.moveTo(0, 512);
  ctx.lineTo(512, 512);
  ctx.stroke();

  // 3m attack lines (3m / 9m = 1/3 of half court = 170.6px from center)
  ctx.beginPath();
  ctx.moveTo(0, 512 - 171);
  ctx.lineTo(512, 512 - 171);
  ctx.moveTo(0, 512 + 171);
  ctx.lineTo(512, 512 + 171);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Builds an articulated, anatomically proportioned 3D volleyball athlete rig
 * whose joints are named for direct `THREE.AnimationMixer` keyframe binding.
 */
export function createArticulatedAthleteRig(options?: {
  jerseyColor?: string;
  accentColor?: string;
  jerseyNumber?: string;
  maxAnisotropy?: number;
  namePrefix?: string;
}): ArticulatedAthleteRig {
  const jerseyColor = options?.jerseyColor ?? '#1d4ed8';
  const accentColor = options?.accentColor ?? '#f59e0b';
  const jerseyNumber = options?.jerseyNumber ?? '10';
  const maxAnisotropy = options?.maxAnisotropy ?? 4;
  const prefix = options?.namePrefix ?? '';

  const partMaterials = new Map<BodyHighlightPart, THREE.MeshStandardMaterial[]>();

  const skinBaseColor = 0xe8b48a;
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.78,
    metalness: 0.05,
  });

  const headbandMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.55,
    metalness: 0.08,
  });

  const jerseyMat = new THREE.MeshStandardMaterial({
    map: createJerseyTexture(jerseyColor, accentColor, jerseyNumber, maxAnisotropy),
    roughness: 0.65,
    metalness: 0.05,
  });
  pushPartMaterial(partMaterials, 'torso_core', jerseyMat);

  const shortsMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.72,
    metalness: 0.06,
  });
  pushPartMaterial(partMaterials, 'torso_core', shortsMat);

  const skinHeadMat = new THREE.MeshStandardMaterial({
    color: skinBaseColor,
    roughness: 0.62,
    metalness: 0.02,
  });

  // Dedicated cloneable materials per highlightable body zone so highlights are precise!
  const lForearmSkinMat = new THREE.MeshStandardMaterial({
    color: skinBaseColor,
    roughness: 0.6,
    metalness: 0.02,
  });
  const rForearmSkinMat = new THREE.MeshStandardMaterial({
    color: skinBaseColor,
    roughness: 0.6,
    metalness: 0.02,
  });
  const rUpperArmSkinMat = new THREE.MeshStandardMaterial({
    color: skinBaseColor,
    roughness: 0.6,
    metalness: 0.02,
  });
  const lUpperArmSkinMat = new THREE.MeshStandardMaterial({
    color: skinBaseColor,
    roughness: 0.6,
    metalness: 0.02,
  });
  const lHandMat = new THREE.MeshStandardMaterial({
    color: skinBaseColor,
    roughness: 0.55,
    metalness: 0.02,
  });
  const rHandMat = new THREE.MeshStandardMaterial({
    color: skinBaseColor,
    roughness: 0.55,
    metalness: 0.02,
  });
  const thighMat = new THREE.MeshStandardMaterial({
    color: skinBaseColor,
    roughness: 0.62,
    metalness: 0.02,
  });
  const kneePadMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.12,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.18,
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.48,
    metalness: 0.12,
  });

  // Map anatomical highlight parts
  pushPartMaterial(partMaterials, 'both_arms', lUpperArmSkinMat);
  pushPartMaterial(partMaterials, 'both_arms', rUpperArmSkinMat);
  pushPartMaterial(partMaterials, 'both_arms', lForearmSkinMat);
  pushPartMaterial(partMaterials, 'both_arms', rForearmSkinMat);

  pushPartMaterial(partMaterials, 'hitting_arm', rUpperArmSkinMat);
  pushPartMaterial(partMaterials, 'hitting_arm', rForearmSkinMat);
  pushPartMaterial(partMaterials, 'hitting_arm', rHandMat);

  pushPartMaterial(partMaterials, 'forearms_platform', lForearmSkinMat);
  pushPartMaterial(partMaterials, 'forearms_platform', rForearmSkinMat);

  pushPartMaterial(partMaterials, 'hands_fingers', lHandMat);
  pushPartMaterial(partMaterials, 'hands_fingers', rHandMat);

  pushPartMaterial(partMaterials, 'legs_knees', thighMat);
  pushPartMaterial(partMaterials, 'legs_knees', kneePadMat);

  pushPartMaterial(partMaterials, 'feet_base', shoeMat);
  pushPartMaterial(partMaterials, 'feet_base', soleMat);

  const root = new THREE.Group();
  root.name = `${prefix}athleteRoot`;

  // Soft radial contact shadow under the athlete on the court
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, 'rgba(2, 6, 23, 0.55)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);

  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.95),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.018;
  root.add(contactShadow);

  // 1. PELVIS (Root articulated joint)
  const pelvis = new THREE.Group();
  pelvis.name = `${prefix}pelvis`;
  pelvis.position.set(0, 0.92, 0);
  root.add(pelvis);

  const pelvisMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.145, 0.16, 16),
    shortsMat
  );
  pelvisMesh.scale.set(1.12, 1, 0.78);
  pelvisMesh.castShadow = true;
  pelvis.add(pelvisMesh);

  // 2. TORSO & CHEST
  const torso = new THREE.Group();
  torso.name = `${prefix}torso`;
  torso.position.set(0, 0.08, 0);
  pelvis.add(torso);

  const chestMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.185, 0.145, 0.44, 18),
    jerseyMat
  );
  chestMesh.position.set(0, 0.22, 0);
  chestMesh.scale.set(1.15, 1, 0.72);
  chestMesh.castShadow = true;
  chestMesh.receiveShadow = true;
  torso.add(chestMesh);

  // Shoulder yoke accent bar
  const shoulderBar = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.065, 0.28, 6, 12),
    jerseyMat
  );
  shoulderBar.rotation.z = Math.PI / 2;
  shoulderBar.position.set(0, 0.41, 0);
  shoulderBar.castShadow = true;
  torso.add(shoulderBar);

  // 3. HEAD & NECK (with headband + eyes to communicate gaze direction)
  const head = new THREE.Group();
  head.name = `${prefix}head`;
  head.position.set(0, 0.47, 0);
  torso.add(head);

  const neckMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.06, 0.1, 12),
    skinHeadMat
  );
  neckMesh.position.set(0, 0.04, 0);
  head.add(neckMesh);

  const skullMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 20, 16),
    skinHeadMat
  );
  skullMesh.scale.set(0.92, 1.05, 0.98);
  skullMesh.position.set(0, 0.19, 0);
  skullMesh.castShadow = true;
  head.add(skullMesh);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.123, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat
  );
  hairCap.position.set(0, 0.2, 0.01);
  hairCap.rotation.x = 0.18;
  hairCap.castShadow = true;
  head.add(hairCap);

  const headband = new THREE.Mesh(
    new THREE.TorusGeometry(0.114, 0.016, 8, 24),
    headbandMat
  );
  headband.rotation.x = Math.PI / 2 + 0.12;
  headband.position.set(0, 0.23, 0);
  head.add(headband);

  // Eyes facing -Z
  const eyeGeo = new THREE.SphereGeometry(0.013, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
  const lEye = new THREE.Mesh(eyeGeo, eyeMat);
  lEye.position.set(-0.04, 0.19, -0.108);
  const rEye = new THREE.Mesh(eyeGeo, eyeMat);
  rEye.position.set(0.04, 0.19, -0.108);
  head.add(lEye, rEye);

  // 4. ARMS BUILDER
  const buildArm = (
    side: 'l' | 'r',
    upperMat: THREE.MeshStandardMaterial,
    forearmMat: THREE.MeshStandardMaterial,
    handMat: THREE.MeshStandardMaterial
  ) => {
    const sign = side === 'l' ? -1 : 1;
    const shoulder = new THREE.Group();
    shoulder.name = `${prefix}${side}Shoulder`;
    shoulder.position.set(sign * 0.235, 0.41, 0);
    torso.add(shoulder);

    const shoulderJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.058, 12, 12),
      upperMat
    );
    shoulder.add(shoulderJoint);

    const upperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.044, 0.21, 6, 12),
      upperMat
    );
    upperArm.position.set(0, -0.14, 0);
    upperArm.castShadow = true;
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.name = `${prefix}${side}Elbow`;
    elbow.position.set(0, -0.28, 0);
    shoulder.add(elbow);

    const elbowJoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 10, 10),
      forearmMat
    );
    elbow.add(elbowJoint);

    const forearm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.036, 0.2, 6, 12),
      forearmMat
    );
    forearm.position.set(0, -0.13, 0);
    forearm.castShadow = true;
    elbow.add(forearm);

    // Athletic wristband
    const wristband = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.036, 0.045, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })
    );
    wristband.position.set(0, -0.22, 0);
    elbow.add(wristband);

    // Hand + sculpted palm/fingers silhouette
    const handGroup = new THREE.Group();
    handGroup.position.set(0, -0.275, 0);
    elbow.add(handGroup);

    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.085, 0.072),
      handMat
    );
    palm.castShadow = true;
    handGroup.add(palm);

    return { shoulder, elbow };
  };

  const leftArm = buildArm('l', lUpperArmSkinMat, lForearmSkinMat, lHandMat);
  const rightArm = buildArm('r', rUpperArmSkinMat, rForearmSkinMat, rHandMat);

  // 5. LEGS BUILDER (Hip -> Thigh -> Knee w/ kneepad -> Shin -> Ankle w/ court shoe)
  const buildLeg = (side: 'l' | 'r') => {
    const sign = side === 'l' ? -1 : 1;
    const hip = new THREE.Group();
    hip.name = `${prefix}${side}Hip`;
    hip.position.set(sign * 0.1, -0.04, 0);
    pelvis.add(hip);

    const shortsLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.074, 0.066, 0.16, 14),
      shortsMat
    );
    shortsLeg.position.set(0, -0.07, 0);
    shortsLeg.castShadow = true;
    hip.add(shortsLeg);

    const thigh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.056, 0.24, 6, 12),
      thighMat
    );
    thigh.position.set(0, -0.23, 0);
    thigh.castShadow = true;
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.name = `${prefix}${side}Knee`;
    knee.position.set(0, -0.42, 0);
    hip.add(knee);

    // Volleyball Kneepad!
    const kneepad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.056, 0.052, 0.11, 14),
      kneePadMat
    );
    kneepad.position.set(0, -0.01, -0.008);
    kneepad.castShadow = true;
    knee.add(kneepad);

    const shin = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.043, 0.24, 6, 12),
      thighMat
    );
    shin.position.set(0, -0.21, 0);
    shin.castShadow = true;
    knee.add(shin);

    // Athletic sock cuff
    const sock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.043, 0.08, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 })
    );
    sock.position.set(0, -0.34, 0);
    knee.add(sock);

    const ankle = new THREE.Group();
    ankle.name = `${prefix}${side}Ankle`;
    ankle.position.set(0, -0.4, 0);
    knee.add(ankle);

    // Court shoe upper + rubber outsole facing -Z
    const shoeUpper = new THREE.Mesh(
      new THREE.BoxGeometry(0.095, 0.052, 0.21),
      shoeMat
    );
    shoeUpper.position.set(0, -0.025, -0.045);
    shoeUpper.castShadow = true;
    ankle.add(shoeUpper);

    const shoeSole = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.018, 0.22),
      soleMat
    );
    shoeSole.position.set(0, -0.051, -0.045);
    shoeSole.castShadow = true;
    ankle.add(shoeSole);

    return { hip, knee, ankle };
  };

  const leftLeg = buildLeg('l');
  const rightLeg = buildLeg('r');

  return {
    root,
    pelvis,
    torso,
    head,
    lShoulder: leftArm.shoulder,
    lElbow: leftArm.elbow,
    rShoulder: rightArm.shoulder,
    rElbow: rightArm.elbow,
    lHip: leftLeg.hip,
    lKnee: leftLeg.knee,
    lAnkle: leftLeg.ankle,
    rHip: rightLeg.hip,
    rKnee: rightLeg.knee,
    rAnkle: rightLeg.ankle,
    partMaterials,
    contactShadow,
  };
}

/**
 * Compiles pre-baked biomechanical keyframes into a native `THREE.AnimationClip`
 * driving pelvis translation, all body joint quaternions, and the 3D volleyball trajectory.
 */
export function compileVariantAnimationClip(
  variant: FundamentalTechniqueVariant
): THREE.AnimationClip {
  const keyframes = variant.keyframes;
  const times = keyframes.map((k) => k.time);

  const tracks: THREE.KeyframeTrack[] = [];

  // Helper to push VectorKeyframeTrack
  const pushVecTrack = (
    name: string,
    getter: (k: AnimationPoseKeyframe) => [number, number, number]
  ) => {
    const flat: number[] = [];
    for (const kf of keyframes) {
      const v = getter(kf);
      flat.push(v[0], v[1], v[2]);
    }
    const track = new THREE.VectorKeyframeTrack(name, times, flat);
    track.setInterpolation(THREE.InterpolateSmooth);
    tracks.push(track);
  };

  // Helper to push QuaternionKeyframeTrack from Euler XYZ
  const pushQuatTrack = (
    name: string,
    getter: (k: AnimationPoseKeyframe) => [number, number, number]
  ) => {
    const flat: number[] = [];
    for (const kf of keyframes) {
      const r = getter(kf);
      _euler.set(r[0], r[1], r[2], 'XYZ');
      _quat.setFromEuler(_euler);
      flat.push(_quat.x, _quat.y, _quat.z, _quat.w);
    }
    const track = new THREE.QuaternionKeyframeTrack(name, times, flat);
    track.setInterpolation(THREE.InterpolateSmooth);
    tracks.push(track);
  };

  pushVecTrack('pelvis.position', (k) => k.pelvisPos);
  pushQuatTrack('pelvis.quaternion', (k) => k.pelvisRot || [0, 0, 0]);
  pushQuatTrack('torso.quaternion', (k) => k.torsoRot);
  pushQuatTrack('head.quaternion', (k) => k.headRot);

  pushQuatTrack('lShoulder.quaternion', (k) => k.lShoulderRot);
  pushQuatTrack('lElbow.quaternion', (k) => k.lElbowRot);
  pushQuatTrack('rShoulder.quaternion', (k) => k.rShoulderRot);
  pushQuatTrack('rElbow.quaternion', (k) => k.rElbowRot);

  pushQuatTrack('lHip.quaternion', (k) => k.lHipRot);
  pushQuatTrack('lKnee.quaternion', (k) => k.lKneeRot);
  pushQuatTrack('lAnkle.quaternion', (k) => k.lAnkleRot || [0, 0, 0]);

  pushQuatTrack('rHip.quaternion', (k) => k.rHipRot);
  pushQuatTrack('rKnee.quaternion', (k) => k.rKneeRot);
  pushQuatTrack('rAnkle.quaternion', (k) => k.rAnkleRot || [0, 0, 0]);

  // Synchronized 3D Volleyball track
  pushVecTrack('ball.position', (k) => k.ballPos);

  const clip = new THREE.AnimationClip(variant.id, variant.duration, tracks);
  return clip;
}

/**
 * Applies gentle emissive highlight to the anatomical body parts active in the current step.
 */
export function applyAnatomicalHighlight(
  rig: ArticulatedAthleteRig,
  activeParts: BodyHighlightPart[],
  enabled: boolean,
  pulsePhase: number
) {
  const activeSet = new Set(activeParts);
  const glowIntensity = enabled ? 0.42 + 0.16 * Math.sin(pulsePhase * 4.5) : 0;

  // Reset all emissives first
  rig.partMaterials.forEach((mats) => {
    for (const mat of mats) {
      mat.emissive.setHex(0x000000);
      mat.emissiveIntensity = 0;
    }
  });

  if (!enabled || activeSet.size === 0) return;

  activeSet.forEach((part) => {
    const mats = rig.partMaterials.get(part);
    if (!mats) return;
    const glowHex =
      part === 'hitting_arm' || part === 'hands_fingers'
        ? 0xf59e0b
        : part === 'forearms_platform'
        ? 0x0ea5e9
        : 0x10b981;
    for (const mat of mats) {
      mat.emissive.setHex(glowHex);
      mat.emissiveIntensity = glowIntensity;
    }
  });
}

/**
 * Builds the curved visual trajectory guide for the 3D volleyball from keyframes.
 */
export function buildBallTrajectoryLine(
  keyframes: AnimationPoseKeyframe[]
): THREE.Line {
  const points = keyframes.map(
    (k) => new THREE.Vector3(k.ballPos[0], k.ballPos[1], k.ballPos[2])
  );
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.35);
  const sampled = curve.getPoints(72);
  const geometry = new THREE.BufferGeometry().setFromPoints(sampled);
  const material = new THREE.LineDashedMaterial({
    color: 0xf59e0b,
    dashSize: 0.22,
    gapSize: 0.12,
    transparent: true,
    opacity: 0.85,
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
}

/**
 * Builds an official 18m x 9m indoor volleyball arena with court lines,
 * net, antennas, poles, surrounding free zone, and crisp studio PBR shading.
 */
export function buildFundamentalsCourtScene(
  theme: CourtTheme,
  maxAnisotropy = 4
): THREE.Group {
  const courtGroup = new THREE.Group();

  let innerColor = '#2563eb';
  let outerColor = '#0f766e';
  let lineColor = '#ffffff';

  if (theme === 'classic_wood') {
    innerColor = '#d97706';
    outerColor = '#92400e';
  } else if (theme === 'neon_night') {
    innerColor = '#1e1b4b';
    outerColor = '#090d16';
    lineColor = '#38bdf8';
  } else if (theme === 'taraflex_blue') {
    innerColor = '#1d4ed8';
    outerColor = '#0369a1';
  } else if (theme === 'beach_gold') {
    innerColor = '#e5b869';
    outerColor = '#c89643';
  } else if (theme === 'high_contrast') {
    innerColor = '#111827';
    outerColor = '#000000';
    lineColor = '#facc15';
  }

  // Wide arena surrounding floor (34m x 26m)
  const arenaFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 28),
    new THREE.MeshStandardMaterial({
      color: outerColor,
      roughness: 0.78,
      metalness: 0.05,
    })
  );
  arenaFloor.rotation.x = -Math.PI / 2;
  arenaFloor.position.y = 0;
  arenaFloor.receiveShadow = true;
  courtGroup.add(arenaFloor);

  // Official 9m x 18m Court Playable Surface (offset +0.01 to avoid Z-fighting)
  const courtTex = createCourtSurfaceTexture(innerColor, lineColor, maxAnisotropy);
  const courtPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(9.0, 18.0),
    new THREE.MeshStandardMaterial({
      map: courtTex,
      roughness: 0.56,
      metalness: 0.04,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    })
  );
  courtPlane.rotation.x = -Math.PI / 2;
  courtPlane.position.y = 0.01;
  courtPlane.receiveShadow = true;
  courtGroup.add(courtPlane);

  // Net Posts (outside 9m court at +/- 5.0m)
  const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.55, 14);
  const postMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.65,
  });
  const padMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.7,
    metalness: 0.05,
  });

  [-5.05, 5.05].forEach((xPos) => {
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(xPos, 1.275, 0);
    post.castShadow = true;
    courtGroup.add(post);

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.75, 14),
      padMat
    );
    pad.position.set(xPos, 0.9, 0);
    pad.castShadow = true;
    courtGroup.add(pad);
  });

  // Net Top & Bottom Tapes (height 2.38m top, 1.38m bottom, span 9.5m)
  const topTape = new THREE.Mesh(
    new THREE.BoxGeometry(9.5, 0.07, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
  );
  topTape.position.set(0, 2.365, 0);
  topTape.castShadow = true;
  courtGroup.add(topTape);

  const bottomTape = new THREE.Mesh(
    new THREE.BoxGeometry(9.5, 0.04, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
  );
  bottomTape.position.set(0, 1.38, 0);
  courtGroup.add(bottomTape);

  // Procedural Net Mesh Texture
  const netCanvas = document.createElement('canvas');
  netCanvas.width = 64;
  netCanvas.height = 64;
  const nCtx = netCanvas.getContext('2d')!;
  nCtx.clearRect(0, 0, 64, 64);
  nCtx.strokeStyle = 'rgba(226, 232, 240, 0.65)';
  nCtx.lineWidth = 4;
  nCtx.strokeRect(0, 0, 64, 64);
  const netTex = new THREE.CanvasTexture(netCanvas);
  netTex.wrapS = THREE.RepeatWrapping;
  netTex.wrapT = THREE.RepeatWrapping;
  netTex.repeat.set(95, 10);
  netTex.colorSpace = THREE.SRGBColorSpace;

  const netMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(9.5, 0.98),
    new THREE.MeshStandardMaterial({
      map: netTex,
      transparent: true,
      alphaTest: 0.15,
      side: THREE.DoubleSide,
      roughness: 0.85,
    })
  );
  netMesh.position.set(0, 1.88, 0);
  courtGroup.add(netMesh);

  // Official Red/White Antennas at X = +/- 4.5m
  const antMatWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const antMatRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });

  [-4.5, 4.5].forEach((xPos) => {
    for (let seg = 0; seg < 8; seg++) {
      const piece = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8),
        seg % 2 === 0 ? antMatRed : antMatWhite
      );
      piece.position.set(xPos, 1.48 + seg * 0.22, 0);
      courtGroup.add(piece);
    }
  });

  // Subtle Perimeter Court Bench & LED Advertising Boards far enough not to clutter
  const boardGeo = new THREE.BoxGeometry(8.5, 0.72, 0.18);
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.55,
    metalness: 0.2,
  });
  [-6.8, 6.8].forEach((xSide) => {
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.rotation.y = Math.PI / 2;
    board.position.set(xSide, 0.36, 0);
    board.receiveShadow = true;
    courtGroup.add(board);
  });

  return courtGroup;
}
