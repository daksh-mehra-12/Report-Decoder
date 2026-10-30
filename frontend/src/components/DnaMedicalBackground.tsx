import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// =============================================================
// CINEMATIC MEDICAL-SCIENCE LIVE WALLPAPER
// Deep dark blue/teal atmosphere · Rotating DNA double helix
// Neural network mesh · Floating molecular particles · Hex grid
// =============================================================

// --- Color Palette matching reference screenshot ---
const COLORS = {
  bgDark: '#040d1a',
  bgMid: '#07162c',
  helix1: '#38bdf8',   // Light cyan / sky blue strand
  helix2: '#2dd4bf',   // Bright turquoise strand
  helix3: '#0f766e',   // Deep cyan
  rung: '#5eead4',     // Cyan rungs
  particle1: '#38bdf8',
  particle2: '#22d3ee',
  particle3: '#67e8f9',
  network: '#0284c7',  // Vibrant neural network lines
  networkBright: '#38bdf8',
  glow1: '#22d3ee',
  glow2: '#0284c7',
  ambient: '#e0f2fe',
};

// =============================================================
// 1. LARGE DNA DOUBLE HELIX — left side, prominent realistic look
// =============================================================
function DnaHelix({ strandCount = 70 }: { strandCount?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const { strandA, strandB, rungs } = useMemo(() => {
    const a: [number, number, number][] = [];
    const b: [number, number, number][] = [];
    const r: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];

    const radius = 2.4;
    const height = 20;
    const turns = 3.2;

    for (let i = 0; i < strandCount; i++) {
      const t = (i / strandCount) * Math.PI * 2 * turns;
      const y = (i / strandCount) * height - height / 2;
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      const x2 = -x1;
      const z2 = -z1;

      a.push([x1, y, z1]);
      b.push([x2, y, z2]);
      r.push({ start: [x1, y, z1], end: [x2, y, z2] });
    }

    return { strandA: a, strandB: b, rungs: r };
  }, [strandCount]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Continuous smooth live rotation
      groupRef.current.rotation.y += delta * 0.35;
      // Gentle breathing / floating wave motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.45;
      // Organic tilt sway
      groupRef.current.rotation.z = -0.22 + Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
      groupRef.current.rotation.x = 0.12 + Math.cos(state.clock.elapsedTime * 0.4) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[-4.8, 0, -0.2]} rotation={[0.12, 0.4, -0.22]}>
      {/* Strand A — cyan/sky nodes */}
      {strandA.map((pt, i) => (
        <mesh key={`a-${i}`} position={pt}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.8}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
      ))}

      {/* Strand B — teal/turquoise nodes */}
      {strandB.map((pt, i) => (
        <mesh key={`b-${i}`} position={pt}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial
            color="#2dd4bf"
            emissive="#0f766e"
            emissiveIntensity={1.6}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
      ))}

      {/* Connecting base-pair rungs like real DNA */}
      {rungs.map((rung, i) => {
        const vS = new THREE.Vector3(...rung.start);
        const vE = new THREE.Vector3(...rung.end);
        const mid = new THREE.Vector3().addVectors(vS, vE).multiplyScalar(0.5);
        const length = vS.distanceTo(vE);

        return (
          <group key={`rung-${i}`} position={[mid.x, mid.y, mid.z]}>
            <mesh rotation={[Math.PI / 2, 0, Math.atan2(rung.end[2] - rung.start[2], rung.end[0] - rung.start[0])]}>
              <cylinderGeometry args={[0.025, 0.025, length, 8]} />
              <meshStandardMaterial
                color="#5eead4"
                emissive="#0f766e"
                emissiveIntensity={0.9}
                opacity={0.7}
                transparent
              />
            </mesh>
          </group>
        );
      })}

      {/* Backbone tube A */}
      {strandA.length > 2 && (() => {
        const curve = new THREE.CatmullRomCurve3(strandA.map(p => new THREE.Vector3(...p)));
        const tubeGeo = new THREE.TubeGeometry(curve, 120, 0.045, 8, false);
        return (
          <mesh geometry={tubeGeo}>
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={1.2}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })()}

      {/* Backbone tube B */}
      {strandB.length > 2 && (() => {
        const curve = new THREE.CatmullRomCurve3(strandB.map(p => new THREE.Vector3(...p)));
        const tubeGeo = new THREE.TubeGeometry(curve, 120, 0.045, 8, false);
        return (
          <mesh geometry={tubeGeo}>
            <meshStandardMaterial
              color="#2dd4bf"
              emissive="#0f766e"
              emissiveIntensity={1.1}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })()}
    </group>
  );
}

// =============================================================
// 2. SECONDARY SMALLER DNA — right side, subtle
// =============================================================
function SecondaryDna() {
  const groupRef = useRef<THREE.Group>(null);

  const points = useMemo(() => {
    const a: [number, number, number][] = [];
    const b: [number, number, number][] = [];
    const count = 30;
    const radius = 0.9;
    const height = 8;
    const turns = 2.5;

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2 * turns;
      const y = (i / count) * height - height / 2;
      a.push([Math.cos(t) * radius, y, Math.sin(t) * radius]);
      b.push([-Math.cos(t) * radius, y, -Math.sin(t) * radius]);
    }
    return { a, b };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4 + 2) * 0.25;
    }
  });

  return (
    <group ref={groupRef} position={[5.2, 1, -3]} rotation={[0.3, -0.5, 0.1]}>
      {points.a.length > 2 && (() => {
        const curve = new THREE.CatmullRomCurve3(points.a.map(p => new THREE.Vector3(...p)));
        const geo = new THREE.TubeGeometry(curve, 50, 0.03, 6, false);
        return (
          <mesh geometry={geo}>
            <meshStandardMaterial color={COLORS.helix1} emissive={COLORS.helix1} emissiveIntensity={0.5} transparent opacity={0.35} />
          </mesh>
        );
      })()}
      {points.b.length > 2 && (() => {
        const curve = new THREE.CatmullRomCurve3(points.b.map(p => new THREE.Vector3(...p)));
        const geo = new THREE.TubeGeometry(curve, 50, 0.03, 6, false);
        return (
          <mesh geometry={geo}>
            <meshStandardMaterial color={COLORS.helix2} emissive={COLORS.helix2} emissiveIntensity={0.5} transparent opacity={0.35} />
          </mesh>
        );
      })()}
      {points.a.map((pt, i) => (
        <mesh key={`sa-${i}`} position={pt}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color={COLORS.helix1} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// =============================================================
// 3. NEURAL NETWORK CONSTELLATION — right side dense mesh
// =============================================================
function NeuralNetwork() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const nodesRef = useRef<THREE.Group>(null);

  const { geometry, nodes } = useMemo(() => {
    const coords: number[] = [];
    const nodeCount = 95;
    const nodeList: THREE.Vector3[] = [];

    // Dense cluster centered towards the right (x: 2.5 to 7.5, y: -4 to 4, z: -3 to 1)
    for (let i = 0; i < nodeCount; i++) {
      const radius = 1.0 + Math.random() * 3.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      nodeList.push(
        new THREE.Vector3(
          4.8 + radius * Math.cos(theta) * Math.cos(phi),
          radius * Math.sin(phi) * 1.3,
          -1.5 + radius * Math.sin(theta) * 0.9
        )
      );
    }

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodeList[i].distanceTo(nodeList[j]);
        if (dist < 1.9) {
          coords.push(nodeList[i].x, nodeList[i].y, nodeList[i].z);
          coords.push(nodeList[j].x, nodeList[j].y, nodeList[j].z);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
    return { geometry: geo, nodes: nodeList };
  }, []);

  useFrame((state, delta) => {
    if (linesRef.current) {
      linesRef.current.rotation.y += delta * 0.08;
      linesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
    }
    if (nodesRef.current) {
      nodesRef.current.rotation.y += delta * 0.08;
      nodesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
      nodesRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.45 + Math.sin(state.clock.elapsedTime * 2 + i * 0.4) * 0.35;
      });
    }
  });

  return (
    <>
      <lineSegments ref={linesRef} geometry={geometry}>
        <lineBasicMaterial color="#0284c7" transparent opacity={0.35} />
      </lineSegments>
      <group ref={nodesRef}>
        {nodes.map((n, i) => (
          <mesh key={`nn-${i}`} position={[n.x, n.y, n.z]}>
            <sphereGeometry args={[0.035 + (i % 3) * 0.02, 8, 8]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? '#38bdf8' : i % 2 === 0 ? '#22d3ee' : '#0284c7'}
              transparent
              opacity={0.65}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

// =============================================================
// 4. FLOATING MOLECULAR PARTICLES — multi-layer
// =============================================================
function FloatingParticles({ count = 120 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; speed: number; size: number; color: string; phase: number }> = [];
    const colors = [COLORS.particle1, COLORS.particle2, COLORS.particle3, '#ffffff'];
    for (let i = 0; i < count; i++) {
      list.push({
        pos: [
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 14,
          -4 + Math.random() * 8
        ],
        speed: 0.15 + Math.random() * 0.5,
        size: 0.015 + Math.random() * 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      });
    }
    return list;
  }, [count]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02;
      groupRef.current.children.forEach((child, i) => {
        const p = particles[i];
        if (p) {
          child.position.y += Math.sin(state.clock.elapsedTime * p.speed + p.phase) * 0.002;
          child.position.x += Math.cos(state.clock.elapsedTime * p.speed * 0.5 + p.phase) * 0.001;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, idx) => (
        <mesh key={idx} position={p.pos}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.55 + Math.random() * 0.3} />
        </mesh>
      ))}
    </group>
  );
}

// =============================================================
// 5. HEXAGONAL GRID PATTERN — bottom layer
// =============================================================
function HexGrid() {
  const linesRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const coords: number[] = [];
    const hexSize = 0.6;
    const rows = 14;
    const cols = 20;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexSize * 1.75 - (cols * hexSize * 1.75) / 2 + (row % 2 === 0 ? 0 : hexSize * 0.875);
        const y = row * hexSize * 1.5 - (rows * hexSize * 1.5) / 2;
        const z = -6;

        for (let corner = 0; corner < 6; corner++) {
          const angle1 = (Math.PI / 3) * corner;
          const angle2 = (Math.PI / 3) * ((corner + 1) % 6);
          coords.push(
            x + Math.cos(angle1) * hexSize * 0.5, y + Math.sin(angle1) * hexSize * 0.5, z,
            x + Math.cos(angle2) * hexSize * 0.5, y + Math.sin(angle2) * hexSize * 0.5, z
          );
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (linesRef.current) {
      linesRef.current.rotation.z += delta * 0.005;
    }
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color={COLORS.network} transparent opacity={0.08} />
    </lineSegments>
  );
}

// =============================================================
// 6. PULSE RING ANIMATIONS
// =============================================================
function PulseRing({ position, color, delay = 0 }: { position: [number, number, number]; color: string; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = (state.clock.elapsedTime + delay) % 4;
      const scale = 0.3 + t * 0.8;
      const opacity = Math.max(0, 1 - t / 4) * 0.35;
      meshRef.current.scale.set(scale, scale, 1);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, 0]}>
      <ringGeometry args={[0.8, 0.85, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

// =============================================================
// STATIC FALLBACK — for reduced motion / no WebGL
// =============================================================
function StaticMedicalFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 40%, #0a2a3a 70%, #0a1628 100%)' }}>
      <div className="absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full blur-[180px]" style={{ background: 'radial-gradient(circle, rgba(0,229,195,0.25) 0%, transparent 70%)' }} />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: 'radial-gradient(circle, rgba(0,102,204,0.2) 0%, transparent 70%)' }} />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(0,255,170,0.12) 0%, transparent 70%)' }} />
    </div>
  );
}

// =============================================================
// MAIN EXPORT — Complete cinematic live wallpaper
// =============================================================
export const DnaMedicalBackground: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (prefersReducedMotion || !webglSupported) {
    return <StaticMedicalFallback />;
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      {/* Deep blue/teal gradient base */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 35%, #0a2a3a 65%, #071422 100%)' }} />

      {/* Atmospheric glow blobs */}
      <div className="absolute -top-20 -left-32 w-[700px] h-[700px] rounded-full blur-[200px] animate-pulse" style={{ background: 'radial-gradient(circle, rgba(0,229,195,0.18) 0%, transparent 70%)' }} />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full blur-[180px]" style={{ background: 'radial-gradient(circle, rgba(0,102,204,0.15) 0%, transparent 70%)', animation: 'pulse 5s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px]" style={{ background: 'radial-gradient(circle, rgba(0,255,170,0.1) 0%, transparent 70%)', animation: 'pulse 7s ease-in-out 2s infinite alternate' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(26,107,170,0.12) 0%, transparent 70%)' }} />

      {/* Three.js Canvas */}
      <Suspense fallback={<StaticMedicalFallback />}>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.4} color={COLORS.ambient} />
          <directionalLight position={[5, 8, 4]} intensity={1.2} color="#c0f0ff" />
          <pointLight position={[-5, 3, 2]} intensity={3.0} color={COLORS.glow1} distance={12} decay={2} />
          <pointLight position={[4, -2, 1]} intensity={2.5} color={COLORS.glow2} distance={10} decay={2} />
          <pointLight position={[0, 0, 5]} intensity={1.5} color="#1a8fff" distance={8} decay={2} />

          <fog attach="fog" args={['#0a1628', 6, 16]} />

          {/* Main DNA helix — left side */}
          <DnaHelix strandCount={50} />

          {/* Secondary DNA — right, subtle */}
          <SecondaryDna />

          {/* Neural network mesh */}
          <NeuralNetwork />

          {/* Floating particles */}
          <FloatingParticles count={120} />

          {/* Hexagonal grid background */}
          <HexGrid />

          {/* Pulse rings */}
          <PulseRing position={[-3.5, 0, -2]} color={COLORS.helix1} delay={0} />
          <PulseRing position={[4, 2, -3]} color={COLORS.glow2} delay={1.5} />
          <PulseRing position={[0, -3, -2.5]} color={COLORS.particle3} delay={3} />
        </Canvas>
      </Suspense>

      {/* Cinematic vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 40%, rgba(10,22,40,0.5) 80%, rgba(7,20,34,0.85) 100%),
            linear-gradient(to top, rgba(10,22,40,0.7) 0%, transparent 25%, transparent 75%, rgba(10,22,40,0.5) 100%)
          `,
        }}
      />

      {/* Subtle horizontal scan line effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,195,0.15) 2px, rgba(0,229,195,0.15) 3px)',
        }}
      />
    </div>
  );
};
