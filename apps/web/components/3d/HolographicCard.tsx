"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Html, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface HolographicCardProps {
  name: string;
  role: string;
  email: string;
  batch?: string;
  image?: string;
  clubMemberships?: Array<{ club: { name: string }; role: string }>;
}

function CardModel({ profile }: { profile: HolographicCardProps }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Holographic tilt based on mouse position
      // Normalize pointer coordinates
      const targetX = (state.pointer.x * Math.PI) / 6;
      const targetY = (state.pointer.y * Math.PI) / 6;
      
      // Smooth interpolation
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -targetY, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, 0.1);
    }
  });

  return (
    <group>
      <RoundedBox
        ref={meshRef}
        args={[3, 4.5, 0.1]} // Width, Height, Depth
        radius={0.2}
        smoothness={4}
      >
        <meshPhysicalMaterial
          color="#0A0A0A"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          iridescence={1.0}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[100, 400]}
          envMapIntensity={2}
        />
        
        {/* HTML Overlay */}
        <Html
          position={[0, 0, 0.06]}
          transform
          scale={0.01}
          occlude="blending"
          style={{ width: "300px", height: "450px", pointerEvents: "none" }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none" style={{ color: "#fff" }}>
            <div className="h-24 w-24 rounded-full border-[3px] border-[#E9D5FF]/50 overflow-hidden shadow-[0_0_20px_rgba(233,213,255,0.4)] mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {profile.image ? (
                <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-neutral-900">
                  {profile.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-black bg-gradient-to-br from-[#E9D5FF] to-[#BAE6FD] bg-clip-text text-transparent mb-1 leading-tight line-clamp-2">
              {profile.name}
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-3">
              {profile.role} {profile.batch ? `• ${profile.batch}` : ''}
            </p>

            <div className="text-xs text-neutral-300 font-medium opacity-80 mb-6">
              {profile.email}
            </div>

            {profile.clubMemberships && profile.clubMemberships.length > 0 && (
              <div className="w-full pt-4 border-t border-white/10 flex flex-col gap-2">
                {profile.clubMemberships.slice(0, 2).map((m, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-300 font-semibold">{m.role}</span>
                    <span className="text-[9px] text-[#A7F3D0] uppercase tracking-wider">{m.club.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Html>
      </RoundedBox>
      <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={5} blur={2} far={4} color="#E9D5FF" />
    </group>
  );
}

export function HolographicCard(props: HolographicCardProps) {
  return (
    <div className="w-full h-[500px] cursor-crosshair">
      <Canvas
        frameloop="always"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 5, 5]} angle={0.25} penumbra={1} intensity={1} color="#E9D5FF" />
        <spotLight position={[-5, -5, 5]} angle={0.25} penumbra={1} intensity={1} color="#BAE6FD" />
        
        <CardModel profile={props} />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
