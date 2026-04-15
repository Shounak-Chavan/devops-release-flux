"use client";

/**
 * @file HeroScene.tsx
 * @description Three.js 3D scene for the landing page hero section.
 * Renders a dynamic particle sphere and floating geometric objects using
 * @react-three/fiber and @react-three/drei.
 * Uses Suspense boundary with a fallback for graceful loading.
 */

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars, OrbitControls, Torus } from "@react-three/drei";
import * as THREE from "three";

// --------------------------------------------------------------------------
// Sub-components
// --------------------------------------------------------------------------

/**
 * AnimatedOrb — The central glowing distorted sphere.
 * Slowly rotates and distorts over time to appear alive.
 */
function AnimatedOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.12;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.18;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1.6, 100, 100]}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.45}
          speed={2.5}
          roughness={0}
          metalness={0.3}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </Float>
  );
}

/**
 * OrbitingRing — A spinning torus orbiting the central orb.
 */
function OrbitingRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 3 + clock.getElapsedTime() * 0.3;
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Torus ref={ringRef} args={[2.6, 0.04, 16, 120]}>
      <meshStandardMaterial
        color="#a5b4fc"
        emissive="#6366f1"
        emissiveIntensity={0.6}
        transparent
        opacity={0.6}
      />
    </Torus>
  );
}

/**
 * SecondRing — A second wider ring at a different orbital angle.
 */
function SecondRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      ringRef.current.rotation.x = Math.PI / 6;
    }
  });

  return (
    <Torus ref={ringRef} args={[3.5, 0.025, 16, 120]}>
      <meshStandardMaterial
        color="#22d3ee"
        emissive="#06b6d4"
        emissiveIntensity={0.5}
        transparent
        opacity={0.4}
      />
    </Torus>
  );
}

/**
 * FloatingCubes — Small geometric cubes floating around the scene.
 * Positioned at various points in a circular arrangement.
 */
function FloatingCubes() {
  const positions: [number, number, number][] = [
    [3.5, 1.5, -1],
    [-3.2, -1, 0.5],
    [2.5, -2, 1],
    [-2, 2.5, -0.5],
    [0.5, 3.2, 1],
    [-1, -3, 0],
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <Float key={i} speed={1.5 + i * 0.3} rotationIntensity={1.5} floatIntensity={1}>
          <mesh position={pos}>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#6366f1" : "#22d3ee"}
              emissive={i % 2 === 0 ? "#6366f1" : "#22d3ee"}
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// --------------------------------------------------------------------------
// Main Scene
// --------------------------------------------------------------------------

/**
 * SceneContent — All 3D objects within the Canvas context.
 * Separated so we can wrap in Suspense outside Canvas.
 */
function SceneContent() {
  return (
    <>
      {/* Ambient glow */}
      <ambientLight intensity={0.3} />
      {/* Key light — indigo toned */}
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#6366f1" />
      {/* Fill light — cyan toned */}
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#22d3ee" />
      {/* Rim light */}
      <directionalLight position={[0, 10, 0]} intensity={0.5} color="#a5b4fc" />

      {/* Stars background depth */}
      <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={1} />

      {/* Main objects */}
      <AnimatedOrb />
      <OrbitingRing />
      <SecondRing />
      <FloatingCubes />

      {/* Allow subtle user interaction on desktop */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

// --------------------------------------------------------------------------
// Exported Component
// --------------------------------------------------------------------------

/**
 * HeroScene — The full Canvas wrapper with the 3D scene.
 * Designed to be placed as an absolutely positioned overlay in the hero section.
 *
 * @example
 * <div className="relative h-screen">
 *   <HeroScene />
 *   <div className="relative z-10">...hero content...</div>
 * </div>
 */
export default function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]} // Limit pixel ratio for performance
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
