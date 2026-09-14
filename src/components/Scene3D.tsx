import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const TICK_INTERVAL_MS = 60;

function Ticker() {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") invalidate();
    }, TICK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [invalidate]);

  return null;
}

function FloatingParticles() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 600;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cyan = new THREE.Color("#00D4FF");
    const violet = new THREE.Color("#7C3AED");
    const amber = new THREE.Color("#F59E0B");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const r = Math.random();
      const color = r < 0.5 ? cyan : r < 0.8 ? violet : amber;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingRing({ radius, speed, color, offset }: { radius: number; speed: number; color: string; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * speed + offset;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.5 + offset;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.005, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.15} />
    </mesh>
  );
}

function FloatingOrb({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.5;
    ref.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.3 + position[1]) * 0.3;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[scale, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.06} />
    </mesh>
  );
}

function AnimatedScene() {
  return (
    <>
      <FloatingParticles />
      <FloatingRing radius={3} speed={0.15} color="#00D4FF" offset={0} />
      <FloatingRing radius={4} speed={-0.1} color="#7C3AED" offset={1} />
      <FloatingRing radius={5} speed={0.08} color="#F59E0B" offset={2} />
      <FloatingOrb position={[-5, 2, -3]} color="#00D4FF" scale={1.5} />
      <FloatingOrb position={[5, -2, -4]} color="#7C3AED" scale={1.2} />
      <FloatingOrb position={[0, 4, -5]} color="#F59E0B" scale={0.8} />
    </>
  );
}

const Scene3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 1.5s ease" }}
    >
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Ticker />
        <AnimatedScene />
      </Canvas>
    </div>
  );
};

export default Scene3D;