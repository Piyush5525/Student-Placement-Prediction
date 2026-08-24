import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { usePointerStore } from "@/stores/pointer-store";
import { useScrollStore } from "@/stores/scroll-store";

const ACCENT_FROM = new THREE.Color("#6E5BFF");
const ACCENT_TO = new THREE.Color("#22D3EE");
const ACCENT_WARM = new THREE.Color("#F5B14C");

interface NodeSpec {
  basePosition: [number, number, number];
  size: number;
  driftRadius: number;
  driftSpeed: number;
  phase: number;
  color: THREE.Color;
}

// A handful of soft glowing "nodes" — the Lumen reference's floating
// bioluminescent forms, abstracted to soft radial-glow billboards rather
// than literal jellyfish geometry (philosophy, not a copy). Positions are
// spread wide and deep so at least one or two are always in frame
// regardless of viewport size, since this canvas is never re-centered on a
// section the way the old per-section scenes were.
const NODES: NodeSpec[] = [
  { basePosition: [-2.8, 1.2, -1.2], size: 2.6, driftRadius: 0.4, driftSpeed: 0.15, phase: 0, color: ACCENT_FROM },
  { basePosition: [2.6, -0.5, -1.8], size: 1.9, driftRadius: 0.32, driftSpeed: 0.12, phase: 1.7, color: ACCENT_TO },
  { basePosition: [0.4, 2, -2.6], size: 1.4, driftRadius: 0.45, driftSpeed: 0.19, phase: 3.4, color: ACCENT_WARM },
  { basePosition: [-1.6, -1.8, -2.2], size: 1.6, driftRadius: 0.34, driftSpeed: 0.14, phase: 5.1, color: ACCENT_TO },
];

const TRAIL_COUNT = 90;

// Soft radial falloff painted into a canvas texture once at module load —
// billboarded planes with this texture read as a glowing orb from any
// angle, unlike a lit 3D mesh which needs an environment map to look
// convincing. Far cheaper too: no per-pixel lighting, just one blended quad.
function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * The persistent ambient field — replaces the old per-section Probability
 * Core / Showcase Core particle sphere. A handful of soft glowing "nodes"
 * drift slowly on independent orbits (idle, never scroll-triggered — this
 * canvas mounts once for the whole page and never unmounts), plus a sparse
 * field of small glowing points drifting behind them for depth, echoing
 * the reference video's wispy light trails.
 *
 * Nodes are billboarded glow sprites (screen-facing planes with a radial
 * gradient texture, additive blending) rather than lit 3D meshes — this
 * reads as a soft luminous orb reliably across GPUs/renderers, where a
 * transmissive glass material depends on environment reflections it
 * doesn't have here and tends to read as a flat dark circle instead.
 *
 * Deliberately abstract/minimal rather than literal — a handful of soft
 * glowing shapes read as "premium AI ambiance" without competing for
 * attention with page content, per the "support the content, don't cover
 * it" brief.
 */
export function AmbientField() {
  const groupRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.InstancedMesh>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const glowTexture = useMemo(() => createGlowTexture(), []);
  const camera = useThree((s) => s.camera);

  const trailParticles = useMemo(
    () =>
      Array.from({ length: TRAIL_COUNT }, () => ({
        base: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 7,
          -1 - Math.random() * 4,
        ),
        speed: 0.04 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 0.5,
      })),
    [],
  );

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const { x: pointerX, y: pointerY } = usePointerStore.getState();
    // Overall page scroll fraction (0–1 across the whole document) drives a
    // slow, continuous depth drift — not a per-section trigger, so the
    // field reads as one atmosphere the page scrolls through rather than
    // discrete scenes handing off to each other.
    const { scrollY } = useScrollStore.getState();
    const scrollFrac = typeof document !== "undefined"
      ? Math.min(scrollY / Math.max(document.documentElement.scrollHeight - window.innerHeight, 1), 1)
      : 0;

    if (groupRef.current) {
      // Whole field parallax-drifts opposite the scroll direction, gently —
      // reinforces depth without ever moving far enough to clip a node
      // off-canvas. Pointer adds a small additional drift on both axes so
      // the field reads as reactive without competing with page content.
      groupRef.current.position.y = scrollFrac * 1.2 + pointerY * 0.1;
      groupRef.current.position.x = pointerX * 0.15;
    }

    NODES.forEach((node, i) => {
      const mesh = nodeRefs.current[i];
      if (!mesh) return;
      const t = elapsed * node.driftSpeed + node.phase;
      mesh.position.set(
        node.basePosition[0] + Math.sin(t) * node.driftRadius,
        node.basePosition[1] + Math.cos(t * 0.8) * node.driftRadius * 0.7,
        node.basePosition[2] + Math.sin(t * 0.5) * node.driftRadius * 0.5,
      );
      // Billboard toward the camera — a plane, not a sphere, so it must
      // face the viewer to read as a soft round glow rather than a sliver.
      mesh.quaternion.copy(camera.quaternion);
      const pulse = 1 + Math.sin(t * 1.3) * 0.06;
      mesh.scale.setScalar(node.size * pulse);
    });

    if (trailRef.current) {
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const p = trailParticles[i];
        const drift = Math.sin(elapsed * p.speed + p.phase) * 0.4;
        dummy.position.set(p.base.x, p.base.y + drift, p.base.z);
        dummy.quaternion.copy(camera.quaternion);
        const twinkle = 0.6 + Math.sin(elapsed * 0.5 + p.phase) * 0.4;
        dummy.scale.setScalar(p.scale * twinkle * 0.09);
        dummy.updateMatrix();
        trailRef.current.setMatrixAt(i, dummy.matrix);

        const mix = (p.base.y + 3.5) / 7;
        const color = ACCENT_FROM.clone().lerp(ACCENT_TO, THREE.MathUtils.clamp(mix, 0, 1));
        trailRef.current.setColorAt(i, color);
      }
      trailRef.current.instanceMatrix.needsUpdate = true;
      if (trailRef.current.instanceColor) trailRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {NODES.map((node, i) => (
        <mesh key={i} ref={(el) => { nodeRefs.current[i] = el; }} position={node.basePosition}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={glowTexture}
            color={node.color}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      <instancedMesh ref={trailRef} args={[undefined, undefined, TRAIL_COUNT]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
