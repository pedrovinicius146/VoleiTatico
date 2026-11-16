import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type RigSourceMode = 'procedural_keyframe_rig' | 'external_glb_skeletal';

export interface LoadedFundamentalAsset {
  mode: RigSourceMode;
  model?: THREE.Group;
  clip?: THREE.AnimationClip;
  statusNote: string;
}

/**
 * Manifest registry indicating which variants have pre-exported Blender GLTF/GLB
 * files available in `/public/models/fundamentals/`.
 *
 * When `.glb` skeletal models exported from Blender are added to `/public/models/fundamentals/`,
 * set their entry to `true` (or register them dynamically) and `Fundamentals3DViewer`
 * will load and bind them via `GLTFLoader` + `THREE.AnimationMixer` automatically.
 */
const EXTERNAL_GLB_AVAILABILITY: Record<string, boolean> = {};

class FundamentalAssetLoaderService {
  private loader: GLTFLoader;
  private loadingManager: THREE.LoadingManager;
  private gltfCache = new Map<string, GLTF>();

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.loader = new GLTFLoader(this.loadingManager);
    THREE.Cache.enabled = true;
  }

  public hasExternalGlb(glbModelPath: string): boolean {
    return Boolean(EXTERNAL_GLB_AVAILABILITY[glbModelPath]);
  }

  public async loadVariantAsset(
    glbModelPath: string,
    clipName: string,
    onProgress?: (percent: number) => void
  ): Promise<LoadedFundamentalAsset> {
    if (!this.hasExternalGlb(glbModelPath)) {
      return {
        mode: 'procedural_keyframe_rig',
        statusNote:
          'Modelo 3D articulado nativo (Three.js AnimationClip) ativo. Estrutura preparada para importação direta de malhas esqueletais Blender (.glb) sob demanda.',
      };
    }

    try {
      let gltf = this.gltfCache.get(glbModelPath);
      if (!gltf) {
        gltf = await new Promise<GLTF>((resolve, reject) => {
          this.loader.load(
            glbModelPath,
            (loaded) => resolve(loaded),
            (xhr) => {
              if (xhr.total > 0 && onProgress) {
                onProgress(Math.round((xhr.loaded / xhr.total) * 100));
              }
            },
            (err) => reject(err)
          );
        });
        this.gltfCache.set(glbModelPath, gltf);
      }

      const clonedModel = gltf.scene.clone(true);
      clonedModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const matchedClip =
        THREE.AnimationClip.findByName(gltf.animations, clipName) ||
        gltf.animations[0];

      return {
        mode: 'external_glb_skeletal',
        model: clonedModel,
        clip: matchedClip,
        statusNote: `Modelo esquelético GLB carregado (${glbModelPath}).`,
      };
    } catch {
      return {
        mode: 'procedural_keyframe_rig',
        statusNote:
          'Fallback para rig articulado Three.js ativo. Arquivo GLB externo indisponível no momento.',
      };
    }
  }

  public clearCache(): void {
    this.gltfCache.clear();
  }
}

export const gltfAnimationLoader = new FundamentalAssetLoaderService();
