import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Rotating Molecular / Data-Lattice Ring
function OrbitalDataRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ringRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * speed;
      ringRef.current.rotation.x += delta * (speed * 0.5);
    }
  });

  return (
    <group ref={ringRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.02, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Interactive Central Biomarker Core
function BiomarkerCore() {
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      coreRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={coreRef} args={[1.2, 64, 64]}>
        <MeshDistortMaterial
          color="#06B6D4"
          emissive="#0891B2"
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.8}
          distort={0.35}
          speed={2.5}
        />
      </Sphere>
    </Float>
  );
}

// Floating Laboratory Analyte Particles
function AnalyteParticles({ count = 40 }: { count?: number }) {
  const points = useMemo(() => {
    const coords: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.2 + Math.random() * 1.5;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      coords.push([x, y, z]);
    }
    return coords;
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {points.map((pt, i) => (
        <mesh key={i} position={pt}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#22D3EE" : "#10B981"} />
        </mesh>
      ))}
    </group>
  );
}

// Static Fallback for reduced-motion or low-spec devices
function StaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-64 h-64 rounded-full border border-cyan-500/30 flex items-center justify-center animate-pulse">
        <div className="w-44 h-44 rounded-full bg-gradient-to-tr from-cyan-600/30 to-teal-500/20 blur-md"></div>
        <div className="absolute w-28 h-28 rounded-full border border-teal-400/50 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-cyan-400/40"></div>
        </div>
      </div>
    </div>
  );
}

export const ThreeHeroScene: React.FC = () => {
  // Check user reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return <StaticFallback />;
  }

  return (
    <div className="w-full h-full relative pointer-events-none">
      <Suspense fallback={<StaticFallback />}>
        <Canvas
          camera={{ position: [0, 0, 4.8], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          className="pointer-events-auto"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#E0F2FE" />
          <pointLight position={[-5, -5, -5]} intensity={0.8} color="#06B6D4" />

          <BiomarkerCore />
          <OrbitalDataRing radius={1.9} speed={0.4} color="#06B6D4" />
          <OrbitalDataRing radius={2.4} speed={-0.3} color="#10B981" />
          <AnalyteParticles count={35} />
        </Canvas>
      </Suspense>
    </div>
  );
};
