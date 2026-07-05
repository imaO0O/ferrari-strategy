import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";

/* Процедурный красный трактор в студийном свете — фирменная шутка про
   «стратегию Ferrari». Глянцевая ливрея (clearcoat), зеркальный пол.
   Ни одного стороннего 3D-ассета и ни одного чужого логотипа. */

const paint = {
  rosso: { color: "#c81800", roughness: 0.18, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08 },
  black: { color: "#0b0b0f", roughness: 0.25, metalness: 0.6, clearcoat: 0.8, clearcoatRoughness: 0.15 },
  carbon: { color: "#141418", roughness: 0.45, metalness: 0.55 },
  giallo: { color: "#ffd400", roughness: 0.4, metalness: 0.2 },
  tire: { color: "#0a0a0c", roughness: 0.94, metalness: 0.02 },
  rim: { color: "#101014", roughness: 0.15, metalness: 0.95, clearcoat: 0.5 },
};

function Rosso() {
  return <meshPhysicalMaterial {...paint.rosso} />;
}
function Black() {
  return <meshPhysicalMaterial {...paint.black} />;
}

function Wheel({ position, radius = 0.34, width = 0.3, spinRef }) {
  return (
    <group position={position} ref={(el) => el && spinRef.current.push(el)}>
      {/* покрышка */}
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[radius, radius, width, 28]} />
        <meshStandardMaterial {...paint.tire} />
      </mesh>
      {/* грунтозацепы — рёбра по окружности */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[0, Math.cos(a) * radius * 0.92, Math.sin(a) * radius * 0.92]}
            rotation-x={-a}
          >
            <boxGeometry args={[width + 0.02, 0.05, radius * 0.22]} />
            <meshStandardMaterial {...paint.tire} />
          </mesh>
        );
      })}
      {/* ступица */}
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[radius * 0.55, radius * 0.55, width + 0.02, 20]} />
        <meshPhysicalMaterial {...paint.rim} />
      </mesh>
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[radius * 0.34, radius * 0.34, width + 0.04, 16]} />
        <meshStandardMaterial {...paint.giallo} />
      </mesh>
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[radius * 0.12, radius * 0.12, width + 0.06, 12]} />
        <Rosso />
      </mesh>
    </group>
  );
}

function Tractor() {
  const tractor = useRef();
  const wheels = useRef([]);

  useFrame((state, delta) => {
    if (!tractor.current) return;
    tractor.current.rotation.y += delta * 0.16;
    const targetTilt = state.pointer.y * 0.04;
    tractor.current.rotation.x += (targetTilt - tractor.current.rotation.x) * 0.04;
    for (const w of wheels.current) w.rotation.x += delta * 0.5;
  });

  return (
    <group ref={tractor} rotation-y={-0.85}>
      {/* рама */}
      <mesh position={[0, 0.55, 0.2]}>
        <boxGeometry args={[0.5, 0.22, 2.9]} />
        <Black />
      </mesh>

      {/* капот */}
      <mesh position={[0, 1.02, 0.85]}>
        <boxGeometry args={[0.6, 0.52, 1.6]} />
        <Rosso />
      </mesh>
      <mesh position={[0, 1.3, 0.85]}>
        <boxGeometry args={[0.44, 0.06, 1.5]} />
        <Rosso />
      </mesh>
      {/* жёлтая полоса по борту капота */}
      {[-0.305, 0.305].map((x) => (
        <mesh key={x} position={[x, 1.05, 0.85]}>
          <boxGeometry args={[0.01, 0.07, 1.55]} />
          <meshStandardMaterial {...paint.giallo} />
        </mesh>
      ))}

      {/* решётка и фары */}
      <mesh position={[0, 1.0, 1.68]}>
        <boxGeometry args={[0.54, 0.46, 0.08]} />
        <meshStandardMaterial color="#050507" roughness={0.7} />
      </mesh>
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 1.16, 1.71]}>
          <boxGeometry args={[0.12, 0.08, 0.04]} />
          <meshStandardMaterial {...paint.giallo} emissive="#8a6a00" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* выхлопная труба с колпаком */}
      <mesh position={[0.2, 1.75, 1.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.85, 12]} />
        <Black />
      </mesh>
      <mesh position={[0.2, 2.18, 1.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.06, 12]} />
        <Black />
      </mesh>

      {/* приборная консоль и руль */}
      <mesh position={[0, 1.28, 0.0]}>
        <boxGeometry args={[0.5, 0.34, 0.24]} />
        <Rosso />
      </mesh>
      <mesh position={[0, 1.52, -0.08]} rotation-x={-0.95}>
        <torusGeometry args={[0.17, 0.025, 10, 24]} />
        <Black />
      </mesh>
      <mesh position={[0, 1.45, -0.03]} rotation-x={-0.95}>
        <cylinderGeometry args={[0.02, 0.02, 0.22, 8]} />
        <Black />
      </mesh>

      {/* сиденье */}
      <mesh position={[0, 1.02, -0.62]}>
        <boxGeometry args={[0.44, 0.12, 0.42]} />
        <Black />
      </mesh>
      <mesh position={[0, 1.32, -0.82]}>
        <boxGeometry args={[0.44, 0.5, 0.1]} />
        <Black />
      </mesh>

      {/* каркас кабины и крыша */}
      {[
        [-0.42, 0.18],
        [0.42, 0.18],
        [-0.42, -1.0],
        [0.42, -1.0],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 1.66, z]}>
          <boxGeometry args={[0.07, 0.95, 0.07]} />
          <Black />
        </mesh>
      ))}
      <mesh position={[0, 2.16, -0.41]}>
        <boxGeometry args={[1.02, 0.09, 1.42]} />
        <Rosso />
      </mesh>
      {/* маячок на крыше */}
      <mesh position={[0, 2.26, -0.41]}>
        <cylinderGeometry args={[0.07, 0.09, 0.12, 12]} />
        <meshStandardMaterial {...paint.giallo} emissive="#8a6a00" emissiveIntensity={0.8} />
      </mesh>

      {/* крылья над задними колёсами */}
      {[-0.66, 0.66].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.34, -0.7]}>
            <boxGeometry args={[0.3, 0.07, 1.25]} />
            <Rosso />
          </mesh>
          <mesh position={[x + (x > 0 ? 0.13 : -0.13), 1.1, -0.7]}>
            <boxGeometry args={[0.04, 0.42, 1.25]} />
            <Rosso />
          </mesh>
        </group>
      ))}

      {/* передний противовес и фаркоп */}
      <mesh position={[0, 0.52, 1.92]}>
        <boxGeometry args={[0.42, 0.3, 0.22]} />
        <Black />
      </mesh>
      <mesh position={[0, 0.5, -1.42]}>
        <boxGeometry args={[0.16, 0.12, 0.32]} />
        <Black />
      </mesh>

      {/* колёса: огромные задние, маленькие передние */}
      <Wheel position={[-0.62, 0.66, -0.7]} radius={0.66} width={0.4} spinRef={wheels} />
      <Wheel position={[0.62, 0.66, -0.7]} radius={0.66} width={0.4} spinRef={wheels} />
      <Wheel position={[-0.5, 0.36, 1.3]} radius={0.36} width={0.26} spinRef={wheels} />
      <Wheel position={[0.5, 0.36, 1.3]} radius={0.36} width={0.26} spinRef={wheels} />
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [7.0, 2.1, 6.7], fov: 26 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => camera.lookAt(0, 0.75, 0)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      <group position={[0.45, 0, 0]}>
        <Tractor />
        {/* зеркальный студийный пол: большой и тёмный, чтобы край не попадал в кадр */}
        <mesh rotation-x={-Math.PI / 2} position-y={0.005}>
          <circleGeometry args={[22, 48]} />
          <MeshReflectorMaterial
            blur={[220, 70]}
            resolution={1024}
            mixBlur={1}
            mixStrength={5}
            roughness={1}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color="#070709"
            metalness={0.25}
          />
        </mesh>
        <ContactShadows position={[0, 0.01, 0]} opacity={0.7} scale={10} blur={2.2} far={2.6} />
      </group>

      {/* студийный свет из локальных панелей — без сетевых HDRI */}
      <Environment resolution={256}>
        <Lightformer intensity={3.5} position={[0, 5, 0]} scale={[10, 5, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={2.6} color="#ff2f10" position={[-5.5, 1.4, -3]} scale={[5, 2.2, 1]} rotation-y={Math.PI / 3} />
        <Lightformer intensity={2.2} color="#ffe8d0" position={[5.5, 1.6, 3.5]} scale={[4, 2, 1]} rotation-y={-Math.PI / 3} />
        <Lightformer intensity={1.4} color="#ff4020" position={[0, 1.4, -6]} scale={[7, 1.4, 1]} />
      </Environment>

      <spotLight position={[3, 6, 3]} intensity={1.1} angle={0.45} penumbra={0.9} />
      <pointLight color="#ff2800" intensity={1.6} position={[-3.5, 0.8, -2.5]} />
      <ambientLight intensity={0.2} />
    </Canvas>
  );
}
