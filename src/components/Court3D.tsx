import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlayerPosition, PositionalFault, CourtTheme, SystemType } from '../types';
import {
  RotateCcw,
  Eye,
  Maximize2,
  AlertTriangle,
  Move,
  Layers,
  ChevronDown,
  ChevronUp,
  Compass,
} from 'lucide-react';

interface Court3DProps {
  players: PlayerPosition[];
  onPlayerMove?: (playerId: string, newX: number, newY: number) => void;
  onPlayerClick?: (player: PlayerPosition) => void;
  onPlayerDoubleClick?: (player: PlayerPosition) => void;
  faults?: PositionalFault[];
  theme?: CourtTheme;
  system: SystemType;
  showZoneNumbers?: boolean;
  selectedPlayerId?: string | null;
  interactive?: boolean;
}

type CameraPreset = 'arena' | 'top' | 'server' | 'net' | 'bench';

export const Court3D: React.FC<Court3DProps> = ({
  players,
  onPlayerMove,
  onPlayerClick,
  onPlayerDoubleClick,
  faults = [],
  theme = 'arena_teal',
  system,
  showZoneNumbers = true,
  selectedPlayerId = null,
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<CameraPreset>('arena');
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);

  // Click & Drag tracking refs (to differentiate drag from double click)
  const pointerDownInfoRef = useRef<{ x: number; y: number; time: number; player: PlayerPosition } | null>(null);
  const hasMovedRef = useRef<boolean>(false);
  const lastClickRef = useRef<{ playerId: string; time: number } | null>(null);

  // Mutable refs for Three.js instance
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const playerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const faultLinesGroupRef = useRef<THREE.Group | null>(null);
  const zoneLabelsGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Dragging state in 3D
  const isDraggingRef = useRef(false);
  const draggedPlayerIdRef = useRef<string | null>(null);
  const planeRaycast = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const mouseVec = useRef(new THREE.Vector2());

  // Camera target animation state
  const targetCamPos = useRef(new THREE.Vector3(16, 12, 18));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.8, 0));
  const isTransitioningCam = useRef(false);

  // Coordinate conversion helper functions
  // Court in 3D is 9m wide (X: -4.5 to +4.5) and 18m long (Z: -9 to +9, team A is 0 to +9)
  // PlayerPosition x: 0% = -4.5m, 100% = +4.5m
  // PlayerPosition y: 0% = net (Z = 0.45m), 100% = endline (Z = 8.65m)
  const mapPlayerTo3D = useCallback((p: PlayerPosition) => {
    const x3d = ((p.x / 100) - 0.5) * 9.0;
    const z3d = (p.y / 100) * 8.2 + 0.5;
    return { x: x3d, z: z3d };
  }, []);

  const map3DToPlayer = useCallback((x3d: number, z3d: number) => {
    const clampedX = Math.max(-4.4, Math.min(4.4, x3d));
    const clampedZ = Math.max(0.4, Math.min(8.8, z3d));
    const newX = Math.round(((clampedX / 9.0) + 0.5) * 100);
    const newY = Math.round(((clampedZ - 0.5) / 8.2) * 100);
    return {
      x: Math.max(4, Math.min(96, newX)),
      y: Math.max(4, Math.min(96, newY)),
    };
  }, []);

  // Set Camera Preset smoothly
  const applyCameraPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    isTransitioningCam.current = true;

    if (preset === 'arena') {
      // Perspective matching user uploaded reference image!
      targetCamPos.current.set(15.5, 12.0, 17.5);
      targetLookAt.current.set(0, 0.8, 0);
    } else if (preset === 'top') {
      // Direct Top-Down Tactical View
      targetCamPos.current.set(0.01, 21.0, 0.01);
      targetLookAt.current.set(0, 0, 0);
    } else if (preset === 'server') {
      // Behind server baseline view
      targetCamPos.current.set(0, 4.5, 14.5);
      targetLookAt.current.set(0, 1.8, 0);
    } else if (preset === 'net') {
      // Front referee / net block view
      targetCamPos.current.set(0, 2.8, 2.2);
      targetLookAt.current.set(0, 2.0, 0);
    } else if (preset === 'bench') {
      // Sideline coach bench view
      targetCamPos.current.set(16.0, 5.0, 4.5);
      targetLookAt.current.set(0, 1.2, 4.5);
    }
  };

  // Color palette based on theme
  const getThemeMaterials = (th?: string) => {
    if (th === 'taraflex_blue') {
      return {
        apronColor: 0x1e3a8a,
        courtColor: 0x2563eb,
        pedestalColor: 0x0f172a,
        lineColor: 0xffffff,
        attackLineColor: 0xf59e0b,
      };
    }
    if (th === 'classic_wood') {
      return {
        apronColor: 0x451a03,
        courtColor: 0xb45309,
        pedestalColor: 0x1c1917,
        lineColor: 0xffffff,
        attackLineColor: 0xfef3c7,
      };
    }
    if (th === 'beach_gold') {
      return {
        apronColor: 0x78350f,
        courtColor: 0xfcd34d,
        pedestalColor: 0x292524,
        lineColor: 0x1d4ed8,
        attackLineColor: 0x3b82f6,
      };
    }
    if (th === 'neon_night') {
      return {
        apronColor: 0x030712,
        courtColor: 0x1e1b4b,
        pedestalColor: 0x09090b,
        lineColor: 0x22d3ee,
        attackLineColor: 0xf43f5e,
      };
    }
    // Default & Arena Teal (Exact reproduction of uploaded reference image!)
    return {
      apronColor: 0x009688, // Tournament Teal Taraflex
      courtColor: 0xd4a373, // Warm Sand / Maple Court
      pedestalColor: 0x18181b, // Dark charcoal pedestal
      lineColor: 0xffffff,
      attackLineColor: 0xffffff,
    };
  };

  // Setup Three.js scene once on mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL per Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x18191c); // Sleek dark studio arena backdrop
    scene.fog = new THREE.FogExp2(0x18191c, 0.018);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.set(15.5, 12.0, 17.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Never look from underneath floor
    controls.minDistance = 6.0;
    controls.maxDistance = 42.0;
    controls.target.set(0, 0.8, 0);
    controlsRef.current = controls;

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.55);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // Key directional light with soft shadows
    const keyLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    keyLight.position.set(12, 18, 14);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 45;
    keyLight.shadow.camera.left = -16;
    keyLight.shadow.camera.right = 16;
    keyLight.shadow.camera.top = 16;
    keyLight.shadow.camera.bottom = -16;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Rim light from opposite side
    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    rimLight.position.set(-14, 12, -14);
    scene.add(rimLight);

    // Group for fault lines
    const faultLinesGroup = new THREE.Group();
    scene.add(faultLinesGroup);
    faultLinesGroupRef.current = faultLinesGroup;

    // Group for zone numbers
    const zoneLabelsGroup = new THREE.Group();
    scene.add(zoneLabelsGroup);
    zoneLabelsGroupRef.current = zoneLabelsGroup;

    // ==========================================
    // BUILD ARENA & COURT GEOMETRY (Matching Image)
    // ==========================================
    const colors = getThemeMaterials(theme);

    // 1. Dark Charcoal Pedestal Slab (Gives depth and podium appearance)
    const pedestalGeo = new THREE.BoxGeometry(21.0, 0.45, 29.0);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: colors.pedestalColor,
      roughness: 0.7,
      metalness: 0.1,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.set(0, -0.225, 0);
    pedestalMesh.receiveShadow = true;
    scene.add(pedestalMesh);

    // 2. Outer Taraflex Teal Apron (Free Zone)
    const apronGeo = new THREE.PlaneGeometry(20.4, 28.4);
    const apronMat = new THREE.MeshStandardMaterial({
      color: colors.apronColor,
      roughness: 0.38,
      metalness: 0.08,
    });
    const apronMesh = new THREE.Mesh(apronGeo, apronMat);
    apronMesh.rotation.x = -Math.PI / 2;
    apronMesh.position.set(0, 0.002, 0);
    apronMesh.receiveShadow = true;
    scene.add(apronMesh);

    // 3. Playing Court (18m x 9m) in Warm Sand / Maple Wood
    const courtGeo = new THREE.PlaneGeometry(9.0, 18.0);
    const courtMat = new THREE.MeshStandardMaterial({
      color: colors.courtColor,
      roughness: 0.45,
      metalness: 0.05,
    });
    const courtMesh = new THREE.Mesh(courtGeo, courtMat);
    courtMesh.rotation.x = -Math.PI / 2;
    courtMesh.position.set(0, 0.005, 0);
    courtMesh.receiveShadow = true;
    scene.add(courtMesh);

    // 4. Boundary Lines (Crisp White 5cm)
    const lineMat = new THREE.MeshBasicMaterial({ color: colors.lineColor });
    const lineThickness = 0.05;

    const createLine = (w: number, h: number, x: number, z: number) => {
      const g = new THREE.PlaneGeometry(w, h);
      const m = new THREE.Mesh(g, lineMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.008, z);
      scene.add(m);
    };

    // Sidelines (Left & Right)
    createLine(lineThickness, 18.0, -4.5, 0);
    createLine(lineThickness, 18.0, 4.5, 0);

    // Endlines (Team B Top & Team A Bottom)
    createLine(9.0, lineThickness, 0, -9.0);
    createLine(9.0, lineThickness, 0, 9.0);

    // Centerline directly below net (Z = 0)
    createLine(9.0, lineThickness, 0, 0);

    // Attack Lines (3m from center line on each side)
    const attackMat = new THREE.MeshBasicMaterial({ color: colors.attackLineColor });
    const createAttackLine = (z: number) => {
      const g = new THREE.PlaneGeometry(9.0, 0.05);
      const m = new THREE.Mesh(g, attackMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(0, 0.009, z);
      scene.add(m);

      // Dashed sideline extensions for attack line (FIVB standard)
      for (let i = 0; i < 5; i++) {
        const offset = 0.3 + i * 0.35;
        const dashL = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.05), attackMat);
        dashL.rotation.x = -Math.PI / 2;
        dashL.position.set(-4.5 - offset, 0.009, z);
        scene.add(dashL);

        const dashR = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.05), attackMat);
        dashR.rotation.x = -Math.PI / 2;
        dashR.position.set(4.5 + offset, 0.009, z);
        scene.add(dashR);
      }
    };
    createAttackLine(3.0);  // Team A attack line
    createAttackLine(-3.0); // Team B attack line

    // Service zone hash marks at the end lines
    const hashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const createServiceHash = (x: number, z: number) => {
      const g = new THREE.PlaneGeometry(0.05, 0.15);
      const m = new THREE.Mesh(g, hashMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.009, z);
      scene.add(m);
    };
    createServiceHash(-4.5, 9.1);
    createServiceHash(4.5, 9.1);
    createServiceHash(-4.5, -9.1);
    createServiceHash(4.5, -9.1);

    // ==========================================
    // 5. OFFICIAL 3D NET SYSTEM
    // ==========================================
    const netGroup = new THREE.Group();

    // Black Padded Posts (Outer Sidelines)
    const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.65, 24);
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.3,
      metalness: 0.2,
    });

    const postLeft = new THREE.Mesh(postGeo, postMat);
    postLeft.position.set(-5.3, 1.325, 0);
    postLeft.castShadow = !isSoftwareGl;
    netGroup.add(postLeft);

    const postRight = new THREE.Mesh(postGeo, postMat);
    postRight.position.set(5.3, 1.325, 0);
    postRight.castShadow = !isSoftwareGl;
    netGroup.add(postRight);

    // Top tension cable
    const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, 10.6, 12);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, metalness: 0.8 });
    const topCable = new THREE.Mesh(cableGeo, cableMat);
    topCable.rotation.z = Math.PI / 2;
    topCable.position.set(0, 2.45, 0);
    netGroup.add(topCable);

    // White Top Net Band (7cm height)
    const topBandGeo = new THREE.BoxGeometry(9.5, 0.07, 0.025);
    const topBandMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const topBand = new THREE.Mesh(topBandGeo, topBandMat);
    topBand.position.set(0, 2.40, 0);
    netGroup.add(topBand);

    // White Bottom Net Band (5cm height)
    const botBandGeo = new THREE.BoxGeometry(9.5, 0.05, 0.02);
    const botBand = new THREE.Mesh(botBandGeo, topBandMat);
    botBand.position.set(0, 1.43, 0);
    netGroup.add(botBand);

    // Net Mesh Surface (Translucent with fine procedural grid appearance)
    const netMeshGeo = new THREE.PlaneGeometry(9.5, 0.92, 38, 8);
    const netMeshMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.9,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const netMesh = new THREE.Mesh(netMeshGeo, netMeshMat);
    netMesh.position.set(0, 1.91, 0);
    netGroup.add(netMesh);

    // Antennas (Hastes com faixas vermelhas e brancas de 10cm - FIVB Standard)
    const createAntenna = (xPos: number) => {
      const antennaGroup = new THREE.Group();
      antennaGroup.position.set(xPos, 0, 0);

      const segmentHeight = 0.1;
      const numSegments = 18; // 1.80m total (height from 1.43 to 3.23)
      for (let i = 0; i < numSegments; i++) {
        const segGeo = new THREE.CylinderGeometry(0.015, 0.015, segmentHeight, 12);
        const isRed = i % 2 === 0;
        const segMat = new THREE.MeshStandardMaterial({
          color: isRed ? 0xef4444 : 0xffffff,
          roughness: 0.3,
        });
        const seg = new THREE.Mesh(segGeo, segMat);
        seg.position.set(0, 1.43 + i * segmentHeight + segmentHeight / 2, 0);
        antennaGroup.add(seg);
      }
      return antennaGroup;
    };

    netGroup.add(createAntenna(-4.5)); // Left antenna exactly above sideline
    netGroup.add(createAntenna(4.5));  // Right antenna exactly above sideline
    scene.add(netGroup);

    // ==========================================
    // 6. ZONE NUMBER MARKERS (1 to 6 on our court)
    // ==========================================
    const zoneCoords = [
      { z: 1, x: 2.8, y: 6.8, label: 'Zona 1 (Saque)' },
      { z: 2, x: 2.8, y: 1.8, label: 'Zona 2 (Saída)' },
      { z: 3, x: 0.0, y: 1.8, label: 'Zona 3 (Meio Rede)' },
      { z: 4, x: -2.8, y: 1.8, label: 'Zona 4 (Entrada)' },
      { z: 5, x: -2.8, y: 6.8, label: 'Zona 5 (Fundo Esq)' },
      { z: 6, x: 0.0, y: 6.8, label: 'Zona 6 (Fundo Meio)' },
    ];

    zoneCoords.forEach((zc) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(64, 64, 52, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 64px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(zc.z), 64, 64);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(zc.x, 0.012, zc.y);
      zoneLabelsGroup.add(mesh);
    });

    // ==========================================
    // 7. OPPONENT TEAM B SHADOW AT THE NET (Adds Context & Realism)
    // ==========================================
    const opponentGroup = new THREE.Group();
    // 2 blockers ready at the net on the other side (Z = -0.6)
    [-1.2, 1.2].forEach((xPos, idx) => {
      const oppPawn = new THREE.Group();
      oppPawn.position.set(xPos, 0, -0.6);

      const oppBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.4, 0.1, 18),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 })
      );
      oppBase.position.y = 0.05;
      oppPawn.add(oppBase);

      const oppBody = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.28, 0.7, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
      );
      oppBody.position.y = 0.75;
      oppPawn.add(oppBody);

      opponentGroup.add(oppPawn);
    });
    scene.add(opponentGroup);

    // ==========================================
    // ANIMATION & RENDER LOOP
    // ==========================================
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      // Smooth camera interpolation when transitioning presets
      if (isTransitioningCam.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPos.current, 0.08);
        controlsRef.current.target.lerp(targetLookAt.current, 0.08);

        if (cameraRef.current.position.distanceTo(targetCamPos.current) < 0.05) {
          isTransitioningCam.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [theme]);

  // Toggle zone visibility
  useEffect(() => {
    if (zoneLabelsGroupRef.current) {
      zoneLabelsGroupRef.current.visible = showZoneNumbers;
    }
  }, [showZoneNumbers]);

  // Create a stylized 3D Player Avatar Group
  const createPlayerTokenMesh = useCallback((player: PlayerPosition) => {
    const group = new THREE.Group();
    group.name = player.id;

    const isLibero = player.isLibero || player.role === 'L';
    const isSelected = selectedPlayerId === player.id;
    const hasFault = player.hasFault;

    // Team Jersey Colors:
    // Navy & Gold for regular team, White & Gold for Líbero (per FIVB contrasting jersey rule)
    const jerseyColor = isLibero ? 0xffffff : 0x1e3a8a;
    const trimColor = isLibero ? 0x0284c7 : 0xf59e0b;

    // 1. Ground Stance Base Ring
    const baseGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.08, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: hasFault ? 0xef4444 : isSelected ? 0x3b82f6 : 0x0f172a,
      roughness: 0.4,
      metalness: 0.3,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.04;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Outer Selection / Fault Ring
    if (isSelected || hasFault) {
      const ringGeo = new THREE.RingGeometry(0.55, 0.65, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hasFault ? 0xef4444 : 0x38bdf8,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.01;
      group.add(ringMesh);
    }

    // 2. Torso / Jersey (Smooth capsule/cylinder)
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.65, 18);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: jerseyColor,
      roughness: 0.5,
      metalness: 0.1,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.y = 0.44;
    torsoMesh.castShadow = true;
    group.add(torsoMesh);

    // Shoulder Accent Trim
    const trimGeo = new THREE.TorusGeometry(0.33, 0.03, 8, 24);
    const trimMat = new THREE.MeshStandardMaterial({ color: trimColor });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.rotation.x = Math.PI / 2;
    trimMesh.position.y = 0.72;
    group.add(trimMesh);

    // 3. Head / Athletic Figure
    const headGeo = new THREE.SphereGeometry(0.20, 18, 18);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.6 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 0.94;
    headMesh.castShadow = true;
    group.add(headMesh);

    // 4. Directional Visor Marker (shows which way the athlete is facing: towards net)
    const visorGeo = new THREE.ConeGeometry(0.08, 0.18, 12);
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.rotation.x = -Math.PI / 2;
    visorMesh.position.set(0, 0.94, -0.22);
    group.add(visorMesh);

    // 5. Floating Badge Sprite with Number & Role Abbreviation
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Rounded background plaque
      ctx.fillStyle = isSelected
        ? 'rgba(2, 132, 199, 0.95)'
        : hasFault
        ? 'rgba(220, 38, 38, 0.95)'
        : 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = isSelected ? '#38bdf8' : hasFault ? '#f87171' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 4;

      const r = 24;
      const x = 12, y = 12, w = 232, h = 104;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Jersey Number
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 44px "Outfit", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${player.jerseyNumber || player.rotationIndex}`, 30, 72);

      // Role Abbreviation
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(player.role, 226, 72);

      // Subtext for Libero or Front Row
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        isLibero ? 'LÍBERO' : `POS ${player.rotationIndex} · ${player.isFrontRow ? 'REDE' : 'FUNDO'}`,
        128,
        100
      );
    }

    const spriteTex = new THREE.CanvasTexture(canvas);
    spriteTex.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({
      map: spriteTex,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(0, 1.65, 0);
    sprite.scale.set(1.5, 0.75, 1);
    group.add(sprite);

    // User data for raycasting
    group.userData = { playerId: player.id, player };

    return group;
  }, [selectedPlayerId]);

  // Update or build 3D Player Meshes when players list changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean existing players
    playerMeshesRef.current.forEach((mesh) => scene.remove(mesh));
    playerMeshesRef.current.clear();

    // Re-create each player
    players.forEach((player) => {
      const mesh = createPlayerTokenMesh(player);
      const coords = mapPlayerTo3D(player);
      mesh.position.set(coords.x, 0, coords.z);
      scene.add(mesh);
      playerMeshesRef.current.set(player.id, mesh);
    });
  }, [players, mapPlayerTo3D, createPlayerTokenMesh]);

  // Render Positional Fault Connecting Lines in 3D
  useEffect(() => {
    const faultGroup = faultLinesGroupRef.current;
    if (!faultGroup) return;

    // Clear old lines
    while (faultGroup.children.length > 0) {
      faultGroup.remove(faultGroup.children[0]);
    }

    if (faults.length === 0) return;

    faults.forEach((fault) => {
      const p1 = players.find((p) => p.id === fault.player1Id);
      const p2 = players.find((p) => p.id === fault.player2Id);
      if (!p1 || !p2) return;

      const c1 = mapPlayerTo3D(p1);
      const c2 = mapPlayerTo3D(p2);

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(c1.x, 0.2, c1.z),
        new THREE.Vector3((c1.x + c2.x) / 2, 0.75, (c1.z + c2.z) / 2),
        new THREE.Vector3(c2.x, 0.2, c2.z),
      ]);

      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      faultGroup.add(tubeMesh);

      // Warning marker at apex
      const iconCanvas = document.createElement('canvas');
      iconCanvas.width = 64;
      iconCanvas.height = 64;
      const ctx = iconCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(32, 32, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 32, 32);
      }
      const iconTex = new THREE.CanvasTexture(iconCanvas);
      const iconMat = new THREE.SpriteMaterial({ map: iconTex, depthTest: false });
      const iconSprite = new THREE.Sprite(iconMat);
      iconSprite.position.set((c1.x + c2.x) / 2, 1.1, (c1.z + c2.z) / 2);
      iconSprite.scale.set(0.6, 0.6, 1);
      faultGroup.add(iconSprite);
    });
  }, [faults, players, mapPlayerTo3D]);

  // Pointer Interaction Handlers (Raycasting and 3D Dragging)
  const getPointerPos = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !cameraRef.current) return;
    const pointer = getPointerPos(e);
    mouseVec.current.set(pointer.x, pointer.y);

    raycaster.current.setFromCamera(mouseVec.current, cameraRef.current);

    // Check hit on player meshes
    const playerObjects: THREE.Object3D[] = [];
    playerMeshesRef.current.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) playerObjects.push(child);
      });
    });

    const intersects = raycaster.current.intersectObjects(playerObjects, false);

    if (intersects.length > 0) {
      let rootGroup: THREE.Object3D | null = intersects[0].object;
      while (rootGroup && !rootGroup.userData?.playerId) {
        rootGroup = rootGroup.parent;
      }

      if (rootGroup && rootGroup.userData?.player) {
        const p = rootGroup.userData.player as PlayerPosition;
        isDraggingRef.current = true;
        draggedPlayerIdRef.current = p.id;
        hasMovedRef.current = false;
        pointerDownInfoRef.current = {
          x: e.clientX,
          y: e.clientY,
          time: Date.now(),
          player: p,
        };

        // Temporarily disable OrbitControls while dragging
        if (controlsRef.current) controlsRef.current.enabled = false;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cameraRef.current) return;
    const pointer = getPointerPos(e);
    mouseVec.current.set(pointer.x, pointer.y);

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

      // Raycast to floor plane (Y = 0)
      raycaster.current.setFromCamera(mouseVec.current, cameraRef.current);
      const hitPoint = new THREE.Vector3();
      if (raycaster.current.ray.intersectPlane(planeRaycast.current, hitPoint)) {
        const newCoords = map3DToPlayer(hitPoint.x, hitPoint.z);
        onPlayerMove?.(draggedPlayerIdRef.current, newCoords.x, newCoords.y);
      }
    } else {
      // Hover highlight
      raycaster.current.setFromCamera(mouseVec.current, cameraRef.current);
      const playerObjects: THREE.Object3D[] = [];
      playerMeshesRef.current.forEach((group) => {
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) playerObjects.push(child);
        });
      });
      const intersects = raycaster.current.intersectObjects(playerObjects, false);
      if (intersects.length > 0) {
        let rootGroup: THREE.Object3D | null = intersects[0].object;
        while (rootGroup && !rootGroup.userData?.playerId) {
          rootGroup = rootGroup.parent;
        }
        setHoveredPlayerId(rootGroup?.userData?.playerId || null);
      } else {
        setHoveredPlayerId(null);
      }
    }
  };

  const handlePointerUp = () => {
    if (controlsRef.current) controlsRef.current.enabled = true;

    // Check if it was a clean click without dragging
    if (pointerDownInfoRef.current && !hasMovedRef.current) {
      const { player, time } = pointerDownInfoRef.current;
      const elapsed = Date.now() - time;

      if (elapsed < 280) {
        const now = Date.now();
        if (
          lastClickRef.current &&
          lastClickRef.current.playerId === player.id &&
          now - lastClickRef.current.time < 380
        ) {
          // Double-click confirmed! Open athlete popup modal
          if (onPlayerDoubleClick) {
            onPlayerDoubleClick(player);
          } else if (onPlayerClick) {
            onPlayerClick(player);
          }
          lastClickRef.current = null;
        } else {
          // Single-click: select/highlight player without opening modal
          lastClickRef.current = { playerId: player.id, time: now };
          if (onPlayerClick) {
            onPlayerClick(player);
          }
        }
      }
    } else {
      // If user dragged, reset any double-click history so next tap starts fresh
      lastClickRef.current = null;
    }

    isDraggingRef.current = false;
    draggedPlayerIdRef.current = null;
    pointerDownInfoRef.current = null;
    hasMovedRef.current = false;
  };

  return (
    <div className="relative w-full aspect-4/3 sm:aspect-16/10 max-h-[580px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none group">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Top Overlay Badge (Discreet & Professional per Anti-AI Slop Rules) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-white text-xs font-bold shadow-lg flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span className="tracking-wide">Simulador 3D Arena Pro</span>
          <span className="text-[10px] text-slate-400 font-mono">FIVB 18x9m</span>
        </div>

        {faults.length > 0 && (
          <div className="px-2.5 py-1.5 rounded-xl bg-red-950/80 backdrop-blur-md border border-red-800/80 text-red-200 text-xs font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Falta de Posição Detectada!</span>
          </div>
        )}
      </div>

      {/* Helper Tip Overlay */}
      <div className="hidden sm:flex absolute top-3 right-3 z-10 items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-800 text-slate-300 text-[11px] font-medium pointer-events-none">
        <Move className="w-3 h-3 text-slate-400" />
        <span>Gire com o mouse ou arraste qualquer atleta</span>
      </div>

      {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion per Three.js Directive) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-xl transition-all duration-300">
        <div className="flex flex-col items-center">
          {/* Collapse/Expand Toggle Tab */}
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="mb-1 px-3 py-1 rounded-t-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-t border-x border-slate-700/80 text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all"
            title={isDockCollapsed ? 'Expandir Controles de Câmera 3D' : 'Ocultar Controles para Tela Cheia'}
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-teal-400" />
                <span>Ver Câmeras 3D</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Modo Cinema</span>
              </>
            )}
          </button>

          {/* Main Control Strip */}
          {!isDockCollapsed && (
            <div className="w-full p-2 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-2xl flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
              {/* Camera Presets Segmented Controls */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
                <button
                  onClick={() => applyCameraPreset('arena')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activePreset === 'arena'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/30 font-black'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title="Visão 3D isométrica conforme modelo oficial de ensino"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Arena 3D</span>
                </button>

                <button
                  onClick={() => applyCameraPreset('top')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activePreset === 'top'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/30 font-black'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title="Visão superior zenital como na prancheta tática"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Superior</span>
                </button>

                <button
                  onClick={() => applyCameraPreset('server')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activePreset === 'server'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/30 font-black'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title="Visão de trás da linha de saque (Perspectiva do Atleta)"
                >
                  <span>Sacador</span>
                </button>

                <button
                  onClick={() => applyCameraPreset('net')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activePreset === 'net'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/30 font-black'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title="Visão frontal da rede e bloqueio"
                >
                  <span>Rede</span>
                </button>

                <button
                  onClick={() => applyCameraPreset('bench')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activePreset === 'bench'
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/30 font-black'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title="Visão lateral do banco técnico"
                >
                  <span>Banco</span>
                </button>
              </div>

              {/* Reset Camera Button */}
              <button
                onClick={() => applyCameraPreset('arena')}
                className="hidden sm:flex items-center gap-1 p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-all"
                title="Resetar Câmera"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
