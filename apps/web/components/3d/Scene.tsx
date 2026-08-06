"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { TorusKnot, MeshTransmissionMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useUIStore } from "@/store/useUIStore";

function AbstractShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const activeTile = useUIStore((state) => state.activeTile);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Determine target rotation based on the active tile
    let targetX = 0;
    let targetY = 0;

    if (activeTile === "academic") {
      targetX = Math.PI / 4;
      targetY = Math.PI / 4;
    } else if (activeTile === "marketplace") {
      targetX = -Math.PI / 4;
      targetY = Math.PI / 2;
    } else if (activeTile === "events") {
      targetX = Math.PI / 6;
      targetY = -Math.PI / 3;
    } else if (activeTile === "profile") {
      targetX = -Math.PI / 6;
      targetY = -Math.PI / 6;
    } else if (activeTile === "clubs") {
      targetX = Math.PI / 3;
      targetY = Math.PI;
    } else if (activeTile === "connections") {
      targetX = -Math.PI / 3;
      targetY = -Math.PI;
    }

    if (activeTile) {
      // Fast lerp towards the target when a tile is hovered
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetX, 0.05);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.05);
    } else {
      // Idle animation when nothing is hovered
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <TorusKnot ref={meshRef} args={[2.5, 0.8, 200, 32]} position={[0, 0, -2]}>
      <MeshTransmissionMaterial
        backside
        backsideThickness={2}
        thickness={1.5}
        roughness={0.2}
        transmission={1}
        ior={1.5}
        chromaticAberration={0.06}
        anisotropy={0.3}
        color="#ffffff"
        attenuationColor="#E9D5FF"
        attenuationDistance={5}
      />
    </TorusKnot>
  );
}

export function GlobalScene() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        frameloop="always"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={2}
          color="#E9D5FF"
        />
        <spotLight
          position={[-10, -10, -10]}
          angle={0.15}
          penumbra={1}
          intensity={2}
          color="#BAE6FD"
        />
        <Environment preset="city" />
        <AbstractShape />
      </Canvas>
    </div>
  );
}
