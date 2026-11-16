import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CourtTheme } from '../../types';
import {
  BodyHighlightPart,
  FundamentalCameraPreset,
  FundamentalData,
  FundamentalStep,
  FundamentalTechniqueVariant,
} from '../../types/fundamentals';
import {
  applyAnatomicalHighlight,
  ArticulatedAthleteRig,
  buildBallTrajectoryLine,
  buildFundamentalsCourtScene,
  compileVariantAnimationClip,
  createArticulatedAthleteRig,
  createVolleyballTexture,
} from '../../engine/fundamentals3DRig';
import {
  gltfAnimationLoader,
  RigSourceMode,
} from '../../services/gltfAnimationLoader';
import { FundamentalIllustration } from './FundamentalIllustration';
import { FundamentalAnimationControls } from './FundamentalAnimationControls';
import { Rotate3d, AlertTriangle, Layers } from 'lucide-react';

interface Fundamentals3DViewerProps {
  fundamental: FundamentalData;
  variant: FundamentalTechniqueVariant;
  theme: CourtTheme;
  onActiveStepChange?: (step: FundamentalStep) => void;
  externalSeekRequest?: { time: number; seq: number } | null;
  resetSignal?: number;
}

// Reusable scratch math objects outside animation loop (zero GC)
const _ballShadowScale = new THREE.Vector3();

const PART_LABEL_MAP: Record<BodyHighlightPart, string> = {
  legs_knees: 'Joelhos e coxas',
  feet_base: 'Pés e base de apoio',
  torso_core: 'Tronco e quadril',
  forearms_platform: 'Antebraços (plataforma)',
  hands_fingers: 'Mãos, punhos e dedos',
  hitting_arm: 'Ombro e braço de golpe',
  both_arms: 'Braços coordenados',
};

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export const Fundamentals3DViewer: React.FC<Fundamentals3DViewerProps> = ({
  fundamental,
  variant,
  theme,
  onActiveStepChange,
  externalSeekRequest,
  resetSignal = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Accessibility & fallback states
  const [webglAvailable, setWebglAvailable] = useState<boolean>(() =>
    typeof window !== 'undefined' ? checkWebGLSupport() : true
  );
  const [contextLost, setContextLost] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  // Playback & UI state
  const [isPlaying, setIsPlaying] = useState<boolean>(() => !prefersReducedMotion);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [activeCamera, setActiveCamera] = useState<FundamentalCameraPreset>('arena');
  const [showBodyHighlight, setShowBodyHighlight] = useState<boolean>(true);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(
    variant.showTrajectoryArc ?? true
  );
  const [focusedStepNumber, setFocusedStepNumber] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<FundamentalStep>(variant.steps[0]);
  const [rigSourceMode, setRigSourceMode] = useState<RigSourceMode>(
    'procedural_keyframe_rig'
  );
  const [rigStatusNote, setRigStatusNote] = useState<string>(
    'Rig 3D articulado nativo ativo (AnimationClip).'
  );

  // Mutable refs accessed cleanly inside Three.js RAF loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const showBodyHighlightRef = useRef(showBodyHighlight);
  showBodyHighlightRef.current = showBodyHighlight;
  const showTrajectoryRef = useRef(showTrajectory);
  showTrajectoryRef.current = showTrajectory;
  const focusedStepRef = useRef<FundamentalStep | null>(null);
  const variantRef = useRef(variant);
  variantRef.current = variant;
  const onActiveStepChangeRef = useRef(onActiveStepChange);
  onActiveStepChangeRef.current = onActiveStepChange;

  // Three.js scene objects refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const athleteRigRef = useRef<ArticulatedAthleteRig | null>(null);
  const partnerRigsRef = useRef<ArticulatedAthleteRig[]>([]);
  const animRootRef = useRef<THREE.Group | null>(null);
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const ballShadowRef = useRef<THREE.Mesh | null>(null);
  const trajectoryLineRef = useRef<THREE.Line | null>(null);
  const courtGroupRef = useRef<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const externalModelRef = useRef<THREE.Group | null>(null);

  // Smooth camera transition targets
  const targetCamPos = useRef(new THREE.Vector3(4.2, 2.7, 8.2));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.1, 4.2));
  const isCamTransitioning = useRef(false);

  // Reduced motion media listener
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) setIsPlaying(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Compute smart camera preset relative to athlete starting zone
  const applyCameraPreset = useCallback(
    (preset: FundamentalCameraPreset, v: FundamentalTechniqueVariant) => {
      setActiveCamera(preset);
      const midKf = v.keyframes[Math.floor(v.keyframes.length / 2)] || v.keyframes[0];
      const anchorX = midKf.pelvisPos[0] * 0.65;
      const anchorZ = Math.min(7.5, Math.max(0.5, midKf.pelvisPos[2] * 0.75));

      if (preset === 'arena') {
        targetCamPos.current.set(anchorX + 4.4, 3.0, anchorZ + 4.2);
        targetLookAt.current.set(anchorX, 1.15, anchorZ - 0.6);
      } else if (preset === 'side') {
        targetCamPos.current.set(anchorX + 5.2, 1.55, anchorZ);
        targetLookAt.current.set(anchorX, 1.1, anchorZ);
      } else if (preset === 'front') {
        targetCamPos.current.set(anchorX, 1.85, Math.max(-2.8, anchorZ - 4.6));
        targetLookAt.current.set(anchorX, 1.15, anchorZ);
      } else if (preset === 'top') {
        targetCamPos.current.set(anchorX + 0.01, 11.5, anchorZ + 0.05);
        targetLookAt.current.set(anchorX, 0, anchorZ - 1.0);
      } else if (preset === 'feet') {
        targetCamPos.current.set(anchorX + 2.3, 0.65, anchorZ + 2.2);
        targetLookAt.current.set(anchorX, 0.35, anchorZ);
      }

      isCamTransitioning.current = true;
    },
    []
  );

  // Initialize Three.js WebGL Viewport once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!checkWebGLSupport()) {
      setWebglAvailable(false);
      return;
    }

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);
    scene.fog = new THREE.FogExp2(0x0b1120, 0.022);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 85);
    camera.position.set(4.2, 3.0, 8.8);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglAvailable(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // WebGL Context loss safety listeners
    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onLost);
    renderer.domElement.addEventListener('webglcontextrestored', onRestored);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Reflections (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 3-Point Studio Lighting (Key, Hemisphere Fill, Rim)
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.55);
    keyLight.position.set(7, 13, 9);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 36;
    const d = 9.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.7);
    rimLight.position.set(-8, 6, -9);
    scene.add(rimLight);

    // OrbitControls (zoom & rotation)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 2.0;
    controls.maxDistance = 22.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.target.set(0, 1.1, 4.2);
    controls.addEventListener('start', () => {
      // Cancel preset animation immediately when user grabs camera
      isCamTransitioning.current = false;
    });
    controlsRef.current = controls;

    // Animation Root Group holding Pelvis/Skeleton + Ball
    const animRoot = new THREE.Group();
    animRoot.name = 'fundamentalAnimRoot';
    scene.add(animRoot);
    animRootRef.current = animRoot;

    const maxAnisotropy = isSoftwareGl
      ? 1
      : renderer.capabilities.getMaxAnisotropy();

    // Main Articulated Athlete Rig
    const rig = createArticulatedAthleteRig({
      jerseyColor: '#1d4ed8',
      accentColor: '#f59e0b',
      jerseyNumber: '10',
      maxAnisotropy,
    });
    animRoot.add(rig.root);
    athleteRigRef.current = rig;

    // Optional Partner Blockers (for Bloqueio Duplo / Triplo)
    const partner1 = createArticulatedAthleteRig({
      jerseyColor: '#0369a1',
      accentColor: '#38bdf8',
      jerseyNumber: '12',
      maxAnisotropy,
      namePrefix: 'partner1_',
    });
    partner1.root.visible = false;
    animRoot.add(partner1.root);

    const partner2 = createArticulatedAthleteRig({
      jerseyColor: '#0f766e',
      accentColor: '#34d399',
      jerseyNumber: '07',
      maxAnisotropy,
      namePrefix: 'partner2_',
    });
    partner2.root.visible = false;
    animRoot.add(partner2.root);
    partnerRigsRef.current = [partner1, partner2];

    // 3D Volleyball with procedural textured surface
    const ballGeo = new THREE.SphereGeometry(0.11, 24, 20);
    const ballMat = new THREE.MeshStandardMaterial({
      map: createVolleyballTexture(maxAnisotropy),
      roughness: 0.42,
      metalness: 0.05,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.name = 'ball';
    ballMesh.castShadow = true;
    animRoot.add(ballMesh);
    ballMeshRef.current = ballMesh;

    // Ground Ball Shadow
    const ballShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.18, 20),
      new THREE.MeshBasicMaterial({
        color: 0x020617,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      })
    );
    ballShadow.rotation.x = -Math.PI / 2;
    ballShadow.position.y = 0.022;
    scene.add(ballShadow);
    ballShadowRef.current = ballShadow;

    // AnimationMixer bound to animRoot
    const mixer = new THREE.AnimationMixer(animRoot);
    mixerRef.current = mixer;

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // ResizeObserver for responsive fluid sizing
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Frame Loop (with software WebGL pacing via afterDraw)
    let frameId = 0;
    let lastTimestamp = performance.now();
    let uiSyncAccum = 0;
    let lastEmittedStepNum = -1;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = (now = performance.now()) => {
      if (disposed) return;

      const rawDt = Math.min(0.06, Math.max(0.001, (now - lastTimestamp) / 1000));
      lastTimestamp = now;

      const v = variantRef.current;
      const action = actionRef.current;

      if (action && mixerRef.current) {
        if (isPlayingRef.current) {
          mixerRef.current.update(rawDt * speedRef.current);

          // If isolated step loop is active, clamp & loop inside step range
          const focusStep = focusedStepRef.current;
          if (focusStep) {
            if (action.time >= focusStep.endTime || action.time < focusStep.startTime) {
              action.time = focusStep.startTime;
              mixerRef.current.update(0);
            }
          }
        } else {
          mixerRef.current.update(0);
        }

        const t = action.time % (v.duration || 1);

        // Update contact shadow under main athlete pelvis
        if (athleteRigRef.current) {
          const pPos = athleteRigRef.current.pelvis.position;
          athleteRigRef.current.contactShadow.position.set(pPos.x, 0.018, pPos.z);
          const heightScale = Math.max(0.55, 1.0 - Math.max(0, pPos.y - 0.9) * 0.45);
          athleteRigRef.current.contactShadow.scale.setScalar(heightScale);
        }

        // Update 3D ball rotation & floor shadow
        if (ballMeshRef.current && ballShadowRef.current) {
          const bp = ballMeshRef.current.position;
          if (isPlayingRef.current) {
            ballMeshRef.current.rotation.x += rawDt * speedRef.current * 4.5;
            ballMeshRef.current.rotation.z += rawDt * speedRef.current * 1.8;
          }
          ballShadowRef.current.position.set(bp.x, 0.022, bp.z);
          const s = Math.max(0.45, 1.0 - bp.y * 0.14);
          _ballShadowScale.set(s, s, 1);
          ballShadowRef.current.scale.copy(_ballShadowScale);
          (ballShadowRef.current.material as THREE.MeshBasicMaterial).opacity =
            Math.max(0.12, 0.42 - bp.y * 0.06);
        }

        // Sync partner blockers when Bloqueio Duplo or Triplo is selected
        const extraBlockers = v.extraBlockersCount || 0;
        const mainPelvis = athleteRigRef.current?.pelvis;
        partnerRigsRef.current.forEach((pRig, idx) => {
          const shouldShow = idx < extraBlockers;
          pRig.root.visible = shouldShow;
          if (shouldShow && mainPelvis && athleteRigRef.current) {
            const offsetX = idx === 0 ? 0.85 : -0.85;
            pRig.pelvis.position.set(
              mainPelvis.position.x + offsetX,
              mainPelvis.position.y,
              mainPelvis.position.z
            );
            pRig.contactShadow.position.set(
              pRig.pelvis.position.x,
              0.018,
              pRig.pelvis.position.z
            );
            pRig.torso.quaternion.copy(athleteRigRef.current.torso.quaternion);
            pRig.lShoulder.quaternion.copy(athleteRigRef.current.lShoulder.quaternion);
            pRig.lElbow.quaternion.copy(athleteRigRef.current.lElbow.quaternion);
            pRig.rShoulder.quaternion.copy(athleteRigRef.current.rShoulder.quaternion);
            pRig.rElbow.quaternion.copy(athleteRigRef.current.rElbow.quaternion);
            pRig.lHip.quaternion.copy(athleteRigRef.current.lHip.quaternion);
            pRig.lKnee.quaternion.copy(athleteRigRef.current.lKnee.quaternion);
            pRig.rHip.quaternion.copy(athleteRigRef.current.rHip.quaternion);
            pRig.rKnee.quaternion.copy(athleteRigRef.current.rKnee.quaternion);
          }
        });

        // Match active step to current timeline timestamp
        const matchedStep =
          v.steps.find((s) => t >= s.startTime && t <= s.endTime) ||
          v.steps[v.steps.length - 1];

        if (athleteRigRef.current && matchedStep) {
          applyAnatomicalHighlight(
            athleteRigRef.current,
            matchedStep.highlightParts,
            showBodyHighlightRef.current,
            now / 1000
          );
        }

        // Throttle React state sync (~18fps is silky smooth for timeline slider)
        uiSyncAccum += rawDt;
        if (uiSyncAccum >= 0.055) {
          uiSyncAccum = 0;
          setCurrentTime(t);
          if (matchedStep && matchedStep.stepNumber !== lastEmittedStepNum) {
            lastEmittedStepNum = matchedStep.stepNumber;
            setActiveStep(matchedStep);
            onActiveStepChangeRef.current?.(matchedStep);
          }
        }
      }

      // Trajectory visibility sync
      if (trajectoryLineRef.current) {
        trajectoryLineRef.current.visible = showTrajectoryRef.current;
      }

      // Smooth exponential camera preset damping
      if (isCamTransitioning.current) {
        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          targetCamPos.current.x,
          5.5,
          rawDt
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          targetCamPos.current.y,
          5.5,
          rawDt
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          targetCamPos.current.z,
          5.5,
          rawDt
        );

        controls.target.x = THREE.MathUtils.damp(
          controls.target.x,
          targetLookAt.current.x,
          5.5,
          rawDt
        );
        controls.target.y = THREE.MathUtils.damp(
          controls.target.y,
          targetLookAt.current.y,
          5.5,
          rawDt
        );
        controls.target.z = THREE.MathUtils.damp(
          controls.target.z,
          targetLookAt.current.z,
          5.5,
          rawDt
        );

        if (camera.position.distanceTo(targetCamPos.current) < 0.04) {
          isCamTransitioning.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(() => tick(performance.now()));
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      afterDraw(() => tick(performance.now()));
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onRestored);
      controls.dispose();
      envTarget.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  // Rebuild court when theme changes
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!scene || !renderer) return;

    if (courtGroupRef.current) {
      scene.remove(courtGroupRef.current);
      courtGroupRef.current.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
    }

    const court = buildFundamentalsCourtScene(
      theme,
      renderer.capabilities.getMaxAnisotropy()
    );
    scene.add(court);
    courtGroupRef.current = court;
  }, [theme]);

  // Load / Compile AnimationClip whenever variant changes
  useEffect(() => {
    const scene = sceneRef.current;
    const mixer = mixerRef.current;
    if (!scene || !mixer) return;

    let cancelled = false;

    // Reset step & focus state for new variant
    focusedStepRef.current = null;
    setFocusedStepNumber(null);
    setCurrentTime(0);
    setActiveStep(variant.steps[0]);
    setShowTrajectory(variant.showTrajectoryArc ?? true);

    // Rebuild ball trajectory line
    if (trajectoryLineRef.current) {
      scene.remove(trajectoryLineRef.current);
      trajectoryLineRef.current.geometry.dispose();
      (trajectoryLineRef.current.material as THREE.Material).dispose();
      trajectoryLineRef.current = null;
    }
    if (variant.showTrajectoryArc !== false) {
      const traj = buildBallTrajectoryLine(variant.keyframes);
      scene.add(traj);
      trajectoryLineRef.current = traj;
    }

    // Load asset on demand (external Blender .glb if present, else pre-compiled procedural AnimationClip)
    gltfAnimationLoader
      .loadVariantAsset(variant.glbModelPath, variant.glbClipName)
      .then((loaded) => {
        if (cancelled) return;
        setRigSourceMode(loaded.mode);
        setRigStatusNote(loaded.statusNote);

        // Clean up any prior external GLB model
        if (externalModelRef.current && animRootRef.current) {
          animRootRef.current.remove(externalModelRef.current);
          externalModelRef.current = null;
        }

        mixer.stopAllAction();

        if (
          loaded.mode === 'external_glb_skeletal' &&
          loaded.model &&
          loaded.clip &&
          animRootRef.current
        ) {
          if (athleteRigRef.current) {
            athleteRigRef.current.root.visible = false;
          }
          externalModelRef.current = loaded.model;
          animRootRef.current.add(loaded.model);

          const glbMixer = new THREE.AnimationMixer(loaded.model);
          mixerRef.current = glbMixer;
          const action = glbMixer.clipAction(loaded.clip);
          action.reset();
          action.loop = THREE.LoopRepeat;
          action.time = 0;
          action.play();
          actionRef.current = action;
          glbMixer.update(0);
          return;
        }

        // Native articulated Three.js keyframe rig
        if (athleteRigRef.current) {
          athleteRigRef.current.root.visible = true;
        }
        if (animRootRef.current) {
          const nativeMixer = new THREE.AnimationMixer(animRootRef.current);
          mixerRef.current = nativeMixer;
          const clip = compileVariantAnimationClip(variant);
          const action = nativeMixer.clipAction(clip);
          action.reset();
          action.loop = THREE.LoopRepeat;
          action.time = 0;
          action.play();
          actionRef.current = action;
          nativeMixer.update(0);
        }
      });

    // Aim camera cleanly at the variant's starting posture
    applyCameraPreset(
      variant.steps[0]?.recommendedCamera || 'arena',
      variant
    );

    if (prefersReducedMotion) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }

    return () => {
      cancelled = true;
    };
  }, [variant, applyCameraPreset, prefersReducedMotion]);

  // Handle external step jump from Didactic step list
  useEffect(() => {
    if (!externalSeekRequest || !actionRef.current || !mixerRef.current) return;
    focusedStepRef.current = null;
    setFocusedStepNumber(null);
    actionRef.current.time = externalSeekRequest.time;
    mixerRef.current.update(0);
    setCurrentTime(externalSeekRequest.time);
  }, [externalSeekRequest]);

  // Handle Repeat Lesson reset signal
  useEffect(() => {
    if (!resetSignal) return;
    handleRestart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  // Control Handlers
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    focusedStepRef.current = null;
    setFocusedStepNumber(null);
    if (actionRef.current && mixerRef.current) {
      actionRef.current.time = 0;
      mixerRef.current.update(0);
    }
    setCurrentTime(0);
    setActiveStep(variant.steps[0]);
    setIsPlaying(true);
  };

  const handleScrub = (nextTime: number) => {
    focusedStepRef.current = null;
    setFocusedStepNumber(null);
    if (actionRef.current && mixerRef.current) {
      actionRef.current.time = nextTime;
      mixerRef.current.update(0);
    }
    setCurrentTime(nextTime);
    const matched =
      variant.steps.find(
        (s) => nextTime >= s.startTime && nextTime <= s.endTime
      ) || variant.steps[variant.steps.length - 1];
    if (matched) {
      setActiveStep(matched);
      onActiveStepChange?.(matched);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    const next = Math.max(0, currentTime - 0.12);
    handleScrub(next);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    const next = Math.min(variant.duration, currentTime + 0.12);
    handleScrub(next);
  };

  const handleSelectStep = (step: FundamentalStep, loopFocused: boolean) => {
    if (loopFocused) {
      focusedStepRef.current = step;
      setFocusedStepNumber(step.stepNumber);
      if (actionRef.current && mixerRef.current) {
        actionRef.current.time = step.startTime;
        mixerRef.current.update(0);
      }
      setCurrentTime(step.startTime);
      setActiveStep(step);
      onActiveStepChange?.(step);
      if (step.recommendedCamera) {
        applyCameraPreset(step.recommendedCamera, variant);
      }
      setIsPlaying(true);
    } else {
      focusedStepRef.current = null;
      setFocusedStepNumber(null);
    }
  };

  const handleChangeCamera = (preset: FundamentalCameraPreset) => {
    applyCameraPreset(preset, variant);
  };

  return (
    <div className="space-y-4">
      {/* 3D Interactive Stage */}
      <div className="relative w-full h-[420px] sm:h-[510px] lg:h-[570px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
        {webglAvailable && !contextLost ? (
          <div
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-200">
            <FundamentalIllustration
              id={fundamental.id}
              className="w-full max-w-md h-48 rounded-xl border border-slate-800 mb-4"
            />
            <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Visualização alternativa 2D ativa</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Seu navegador ou dispositivo está com aceleração WebGL indisponível
              no momento. As etapas didáticas, postura corporal e exercícios
              seguem funcionando normalmente abaixo.
            </p>
          </div>
        )}

        {/* Top-Left Compact Active Step Overlay */}
        <div className="absolute top-3 left-3 z-10 max-w-[85%] sm:max-w-md pointer-events-none">
          <div className="bg-slate-950/88 border border-white/15 rounded-xl px-3.5 py-2.5 text-white shadow-md">
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400">
              <span className="tabular-nums">
                Etapa {activeStep.stepNumber} de {variant.steps.length}
              </span>
              {focusedStepNumber !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-sky-300">Foco na etapa</span>
                </>
              )}
            </div>
            <p className="text-sm font-bold text-white leading-snug mt-0.5">
              {activeStep.title}
            </p>
            {showBodyHighlight && activeStep.highlightParts.length > 0 && (
              <p className="text-[11px] text-emerald-300 mt-1">
                Foco corporal:{' '}
                {activeStep.highlightParts
                  .map((p) => PART_LABEL_MAP[p])
                  .join(' · ')}
              </p>
            )}
          </div>
        </div>

        {/* Top-Right Orbit Hint & Reset Camera */}
        <div className="hidden sm:flex absolute top-3 right-3 z-10 items-center gap-2">
          <div className="bg-slate-950/85 border border-white/15 rounded-xl px-3 py-1.5 text-[11px] font-medium text-slate-300 inline-flex items-center gap-1.5 pointer-events-none">
            <Rotate3d className="w-3.5 h-3.5 text-sky-400" />
            <span>Arraste para girar · Scroll para zoom</span>
          </div>
        </div>

        {/* Bottom-Left Key Cue Caption */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-lg z-10 pointer-events-none">
          <div className="bg-slate-950/88 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-slate-200">
            <span className="font-bold text-amber-400 mr-1.5">Dica-chave:</span>
            <span>{activeStep.keyCue}</span>
          </div>
        </div>
      </div>

      {/* Unified Animation Playback & Step Controls */}
      <FundamentalAnimationControls
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onRestart={handleRestart}
        currentTime={currentTime}
        duration={variant.duration}
        onScrub={handleScrub}
        onStepBackward={handleStepBackward}
        onStepForward={handleStepForward}
        speed={speed}
        onChangeSpeed={setSpeed}
        activeCamera={activeCamera}
        onChangeCamera={handleChangeCamera}
        steps={variant.steps}
        activeStepNumber={activeStep.stepNumber}
        focusedStepNumber={focusedStepNumber}
        onSelectStep={handleSelectStep}
        showBodyHighlight={showBodyHighlight}
        onToggleBodyHighlight={() => setShowBodyHighlight((v) => !v)}
        showTrajectory={showTrajectory}
        onToggleTrajectory={() => setShowTrajectory((v) => !v)}
      />

      {/* Transparent Architecture Note on 3D Model / GLTF Readiness */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <span>{rigStatusNote}</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          Slot GLTF/GLB:{' '}
          {rigSourceMode === 'external_glb_skeletal'
            ? variant.glbModelPath
            : `${variant.glbClipName} (Pronto para .glb Blender)`}
        </span>
      </div>
    </div>
  );
};
