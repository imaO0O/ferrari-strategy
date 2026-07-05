import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from "@react-three/drei";

/* Процедурный болид Ф1 в духе студийного рендера: глянцевая красно-чёрная
   ливрея (clearcoat), зеркальный пол, тёмно-красная студия.
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
function Carbon() {
  return <meshStandardMaterial {...paint.carbon} />;
}

function Wheel({ position, width = 0.32, spinRef }) {
  return (
    <group position={position} ref={(el) => el && spinRef.current.push(el)}>
      {/* покрышка */}
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.36, 0.36, width, 32]} />
        <meshStandardMaterial {...paint.tire} />
      </mesh>
      {/* жёлтая маркировка на боковине (без надписей) */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[side * (width / 2 - 0.004), 0, 0]} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.245, 0.008, 8, 40]} />
          <meshStandardMaterial {...paint.giallo} />
        </mesh>
      ))}
      {/* диск */}
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.21, 0.21, width + 0.01, 24]} />
        <meshPhysicalMaterial {...paint.rim} />
      </mesh>
      {/* красная центральная гайка */}
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.05, 0.05, width + 0.03, 12]} />
        <meshPhysicalMaterial {...paint.rosso} />
      </mesh>
    </group>
  );
}

function Arm({ from, to }) {
  const mx = (from[0] + to[0]) / 2;
  const mz = (from[2] + to[2]) / 2;
  const len = Math.hypot(to[0] - from[0], to[2] - from[2]);
  const angle = Math.atan2(to[2] - from[2], to[0] - from[0]);
  return (
    <mesh position={[mx, from[1], mz]} rotation-y={-angle}>
      <boxGeometry args={[len, 0.035, 0.07]} />
      <Carbon />
    </mesh>
  );
}

function F1Car() {
  const car = useRef();
  const wheels = useRef([]);

  useFrame((state, delta) => {
    if (!car.current) return;
    car.current.rotation.y += delta * 0.16;
    const targetTilt = state.pointer.y * 0.04;
    car.current.rotation.x += (targetTilt - car.current.rotation.x) * 0.04;
    for (const w of wheels.current) w.rotation.x += delta * 0.9;
  });

  return (
    <group ref={car} rotation-y={-0.85}>
      {/* днище и диффузор — чёрные */}
      <mesh position={[0, 0.14, -0.1]}>
        <boxGeometry args={[1.16, 0.06, 3.7]} />
        <Black />
      </mesh>
      <mesh position={[0, 0.22, -2.05]} rotation-x={0.35}>
        <boxGeometry args={[0.95, 0.05, 0.6]} />
        <Black />
      </mesh>

      {/* монокок: красный верх, чёрные боковые понтоны снизу */}
      <mesh position={[0, 0.46, 0.25]}>
        <boxGeometry args={[0.58, 0.34, 2.1]} />
        <Rosso />
      </mesh>
      <mesh position={[0, 0.26, 0.2]}>
        <boxGeometry args={[0.72, 0.18, 2.3]} />
        <Black />
      </mesh>

      {/* нос: красный, кончик чёрный */}
      <mesh position={[0, 0.44, 1.85]}>
        <boxGeometry args={[0.32, 0.22, 1.3]} />
        <Rosso />
      </mesh>
      <mesh position={[0, 0.4, 2.8]} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.14, 0.7, 4]} />
        <Black />
      </mesh>

      {/* переднее антикрыло: три чёрных элемента + красные законцовки */}
      <mesh position={[0, 0.14, 2.72]}>
        <boxGeometry args={[1.72, 0.035, 0.6]} />
        <Black />
      </mesh>
      <mesh position={[0, 0.21, 2.8]}>
        <boxGeometry args={[1.6, 0.03, 0.4]} />
        <Black />
      </mesh>
      <mesh position={[0, 0.27, 2.87]}>
        <boxGeometry args={[1.44, 0.025, 0.26]} />
        <Rosso />
      </mesh>
      {[-0.88, 0.88].map((x) => (
        <mesh key={x} position={[x, 0.25, 2.72]}>
          <boxGeometry args={[0.04, 0.3, 0.6]} />
          <Rosso />
        </mesh>
      ))}

      {/* кокпит */}
      <mesh position={[0, 0.64, 0.45]}>
        <boxGeometry args={[0.4, 0.1, 0.75]} />
        <meshStandardMaterial color="#050507" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* halo — низкое кольцо над кокпитом с передней стойкой */}
      <mesh position={[0, 0.75, 0.5]} rotation-x={-Math.PI / 2 + 0.07}>
        <torusGeometry args={[0.24, 0.028, 10, 28]} />
        <Black />
      </mesh>
      <mesh position={[0, 0.66, 0.78]} rotation-x={0.35}>
        <boxGeometry args={[0.045, 0.22, 0.045]} />
        <Black />
      </mesh>

      {/* понтоны: красный верх, чёрный низ, тёмный воздухозаборник */}
      {[-0.55, 0.55].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.47, -0.55]}>
            <boxGeometry args={[0.42, 0.22, 1.6]} />
            <Rosso />
          </mesh>
          <mesh position={[x, 0.3, -0.55]}>
            <boxGeometry args={[0.46, 0.16, 1.7]} />
            <Black />
          </mesh>
          <mesh position={[x, 0.46, 0.28]}>
            <boxGeometry args={[0.34, 0.2, 0.06]} />
            <meshStandardMaterial color="#050507" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* гребень мотора, воздухозаборник и акулий плавник */}
      <mesh position={[0, 0.72, -0.75]}>
        <boxGeometry args={[0.24, 0.42, 1.7]} />
        <Rosso />
      </mesh>
      <mesh position={[0, 0.95, 0.05]}>
        <boxGeometry args={[0.28, 0.2, 0.4]} />
        <Black />
      </mesh>
      <mesh position={[0, 0.98, -1.25]}>
        <boxGeometry args={[0.03, 0.34, 0.9]} />
        <Rosso />
      </mesh>
      <mesh position={[0, 1.09, 0.05]}>
        <boxGeometry args={[0.24, 0.06, 0.12]} />
        <meshStandardMaterial {...paint.giallo} />
      </mesh>

      {/* зеркала */}
      {[-0.48, 0.48].map((x) => (
        <mesh key={x} position={[x, 0.7, 0.9]}>
          <boxGeometry args={[0.12, 0.06, 0.04]} />
          <Black />
        </mesh>
      ))}

      {/* заднее антикрыло: чёрное с красной кромкой */}
      <mesh position={[0, 0.98, -2.28]}>
        <boxGeometry args={[1.02, 0.04, 0.48]} />
        <Black />
      </mesh>
      <mesh position={[0, 1.0, -2.05]}>
        <boxGeometry args={[1.02, 0.015, 0.05]} />
        <Rosso />
      </mesh>
      <mesh position={[0, 1.08, -2.4]}>
        <boxGeometry args={[1.02, 0.035, 0.3]} />
        <Black />
      </mesh>
      {[-0.53, 0.53].map((x) => (
        <mesh key={x} position={[x, 0.86, -2.3]}>
          <boxGeometry args={[0.035, 0.56, 0.64]} />
          <Black />
        </mesh>
      ))}
      {/* нижнее «пляжное» крыло */}
      <mesh position={[0, 0.55, -2.32]}>
        <boxGeometry args={[0.9, 0.03, 0.3]} />
        <Black />
      </mesh>
      <mesh position={[0, 0.7, -2.15]}>
        <boxGeometry args={[0.06, 0.32, 0.06]} />
        <Carbon />
      </mesh>

      {/* колёса: задние шире, и рычаги подвески */}
      <Wheel position={[-0.8, 0.36, 1.55]} width={0.3} spinRef={wheels} />
      <Wheel position={[0.8, 0.36, 1.55]} width={0.3} spinRef={wheels} />
      <Wheel position={[-0.82, 0.36, -1.62]} width={0.4} spinRef={wheels} />
      <Wheel position={[0.82, 0.36, -1.62]} width={0.4} spinRef={wheels} />
      <Arm from={[0.28, 0.42, 1.4]} to={[0.74, 0.4, 1.55]} />
      <Arm from={[-0.28, 0.42, 1.4]} to={[-0.74, 0.4, 1.55]} />
      <Arm from={[0.28, 0.42, -1.48]} to={[-0.76, 0.4, -1.62]} />
      <Arm from={[-0.28, 0.42, -1.48]} to={[0.76, 0.4, -1.62]} />
      <Arm from={[0.28, 0.32, 1.42]} to={[0.74, 0.32, 1.57]} />
      <Arm from={[-0.28, 0.32, 1.42]} to={[-0.74, 0.32, 1.57]} />
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [7.0, 1.7, 6.7], fov: 25 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => camera.lookAt(0, 0.4, 0)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      <group position={[0.45, 0, 0]}>
        <F1Car />
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
        <ContactShadows position={[0, 0.01, 0]} opacity={0.7} scale={9} blur={2.2} far={2.2} />
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
