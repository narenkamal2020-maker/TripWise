import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function GlobeMesh() {
  const outerRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.1;
      outerRef.current.rotation.x = THREE.MathUtils.lerp(
        outerRef.current.rotation.x,
        pointer.current.y * 0.35,
        0.04,
      );
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = t * 0.1;
      wireRef.current.rotation.x = outerRef.current.rotation.x;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = t * 0.1;
    }
  });

  return (
    <>
      {/* Core sphere */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshPhongMaterial
          color="#14291F"
          specular="#3D6B5A"
          shininess={25}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Wireframe grid lines */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[1.63, 24, 18]} />
        <meshBasicMaterial
          color="#3D6B5A"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Atmospheric glow ring */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.72, 32, 32]} />
        <meshBasicMaterial
          color="#3D6B5A"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Accent highlight dot — simulates a city light */}
      <mesh position={[0.8, 0.9, 1.1]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#F97316" />
      </mesh>
      <mesh position={[-0.6, 0.3, 1.4]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#FB923C" transparent opacity={0.7} />
      </mesh>
      <mesh position={[1.2, -0.4, 0.9]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#F97316" transparent opacity={0.6} />
      </mesh>
    </>
  );
}

function GlobeScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 4]} intensity={1.2} color="#FB923C" />
      <pointLight position={[-4, -2, -4]} intensity={0.4} color="#3D6B5A" />
      <directionalLight position={[2, 5, 2]} intensity={0.3} color="#FAF6EE" />
      <Stars radius={80} depth={60} count={2500} factor={3} saturation={0} fade speed={0.5} />
      <GlobeMesh />
    </>
  );
}

interface Props {
  className?: string;
}

export function Globe3D({ className = '' }: Props) {
  const fallback = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-48 h-48 rounded-full border-2 border-forest-500/30 animate-spin-slow relative">
        <div className="absolute inset-4 rounded-full border border-forest-500/20" />
        <div className="absolute inset-8 rounded-full border border-accent/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className={className} aria-hidden="true">
      <Suspense fallback={fallback}>
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <GlobeScene />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Lazy export for use with React.lazy()
export default Globe3D;
