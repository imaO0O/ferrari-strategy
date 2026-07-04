import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer } from "@react-three/drei";

/* Процедурный стилизованный болид Ф1: карбон + rosso corsa.
   Ни одного стороннего 3D-ассета — только примитивы Three.js. */

const CARBON = { color: "#131317", roughness: 0.35, metalness: 0.65 };
const ROSSO = { color: "#e21f00", roughness: 0.22, metalness: 0.5 };
const GIALLO = { color: "#ffd400", roughness: 0.35, metalness: 0.4 };
const TIRE = { color: "#0b0b0d", roughness: 0.92, metalness: 0.05 };
const RIM = { color: "#1c1c22", roughness: 0.2, metalness: 0.9 };

function Wheel({ position, spinRef }) {
  return (
    <group position={position} ref={(el) => el && spinRef.current.push(el)}>
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.34, 0.34, 0.3, 28]} />
        <meshStandardMaterial {...TIRE} />
      </mesh>
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.2, 0.2, 0.31, 20]} />
        <meshStandardMaterial {...RIM} />
      </mesh>
      {/* красная гайка по центру */}
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.05, 0.05, 0.33, 12]} />
        <meshStandardMaterial {...ROSSO} />
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
      <meshStandardMaterial {...CARBON} />
    </mesh>
  );
}

function F1Car() {
  const car = useRef();
  const wheels = useRef([]);

  useFrame((state, delta) => {
    if (!car.current) return;
    car.current.rotation.y += delta * 0.22;
    // лёгкий наклон за курсором
    const targetTilt = state.pointer.y * 0.05;
    car.current.rotation.x += (targetTilt - car.current.rotation.x) * 0.04;
    for (const w of wheels.current) w.rotation.x += delta * 1.4;
  });

  return (
    <group ref={car} rotation-y={-0.7}>
      {/* днище */}
      <mesh position={[0, 0.14, -0.1]}>
        <boxGeometry args={[1.12, 0.06, 3.7]} />
        <meshStandardMaterial {...CARBON} />
      </mesh>

      {/* монокок */}
      <mesh position={[0, 0.42, 0.25]}>
        <boxGeometry args={[0.6, 0.4, 2.1]} />
        <meshStandardMaterial {...ROSSO} />
      </mesh>
      {/* носовой конус */}
      <mesh position={[0, 0.44, 1.85]}>
        <boxGeometry args={[0.34, 0.24, 1.3]} />
        <meshStandardMaterial {...ROSSO} />
      </mesh>
      <mesh position={[0, 0.42, 2.85]} rotation-x={Math.PI / 2}>
        <coneGeometry args={[0.17, 0.8, 4]} />
        <meshStandardMaterial {...ROSSO} />
      </mesh>

      {/* переднее антикрыло */}
      <mesh position={[0, 0.15, 2.7]}>
        <boxGeometry args={[1.7, 0.045, 0.62]} />
        <meshStandardMaterial {...ROSSO} />
      </mesh>
      <mesh position={[0, 0.24, 2.82]}>
        <boxGeometry args={[1.5, 0.035, 0.34]} />
        <meshStandardMaterial {...CARBON} />
      </mesh>
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, 0.26, 2.7]}>
          <boxGeometry args={[0.04, 0.26, 0.62]} />
          <meshStandardMaterial {...CARBON} />
        </mesh>
      ))}

      {/* кокпит и подголовник */}
      <mesh position={[0, 0.64, 0.45]}>
        <boxGeometry args={[0.42, 0.1, 0.75]} />
        <meshStandardMaterial color="#050507" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* halo — почти горизонтальное кольцо над кокпитом */}
      <mesh position={[0, 0.74, 0.5]} rotation-x={-Math.PI / 2 + 0.22}>
        <torusGeometry args={[0.27, 0.032, 10, 26]} />
        <meshStandardMaterial {...CARBON} />
      </mesh>
      <mesh position={[0, 0.72, 0.86]} rotation-x={0.5}>
        <boxGeometry args={[0.05, 0.3, 0.05]} />
        <meshStandardMaterial {...CARBON} />
      </mesh>

      {/* понтоны */}
      {[-0.54, 0.54].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.42, -0.55]}>
            <boxGeometry args={[0.42, 0.32, 1.6]} />
            <meshStandardMaterial {...ROSSO} />
          </mesh>
          <mesh position={[x, 0.44, 0.28]}>
            <boxGeometry args={[0.36, 0.24, 0.06]} />
            <meshStandardMaterial color="#050507" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* гребень моторного отсека + воздухозаборник */}
      <mesh position={[0, 0.74, -0.75]}>
        <boxGeometry args={[0.24, 0.46, 1.7]} />
        <meshStandardMaterial {...ROSSO} />
      </mesh>
      <mesh position={[0, 0.98, 0.05]}>
        <boxGeometry args={[0.3, 0.22, 0.42]} />
        <meshStandardMaterial {...CARBON} />
      </mesh>
      <mesh position={[0, 1.13, 0.05]}>
        <boxGeometry args={[0.26, 0.07, 0.12]} />
        <meshStandardMaterial {...GIALLO} />
      </mesh>

      {/* зеркала */}
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.72, 0.9]}>
          <boxGeometry args={[0.13, 0.07, 0.04]} />
          <meshStandardMaterial {...ROSSO} />
        </mesh>
      ))}

      {/* заднее антикрыло */}
      <mesh position={[0, 0.95, -2.25]}>
        <boxGeometry args={[1.05, 0.045, 0.5]} />
        <meshStandardMaterial {...ROSSO} />
      </mesh>
      <mesh position={[0, 0.972, -2.25]}>
        <boxGeometry args={[1.05, 0.012, 0.5]} />
        <meshStandardMaterial {...GIALLO} />
      </mesh>
      <mesh position={[0, 1.06, -2.38]}>
        <boxGeometry args={[1.05, 0.04, 0.34]} />
        <meshStandardMaterial {...CARBON} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.88, -2.28]}>
          <boxGeometry args={[0.04, 0.52, 0.66]} />
          <meshStandardMaterial {...CARBON} />
        </mesh>
      ))}
      <mesh position={[0, 0.72, -2.1]}>
        <boxGeometry args={[0.07, 0.34, 0.07]} />
        <meshStandardMaterial {...CARBON} />
      </mesh>

      {/* диффузор */}
      <mesh position={[0, 0.22, -2.05]} rotation-x={0.35}>
        <boxGeometry args={[0.9, 0.05, 0.6]} />
        <meshStandardMaterial {...CARBON} />
      </mesh>

      {/* колёса и рычаги подвески */}
      <Wheel position={[-0.78, 0.34, 1.55]} spinRef={wheels} />
      <Wheel position={[0.78, 0.34, 1.55]} spinRef={wheels} />
      <Wheel position={[-0.8, 0.34, -1.65]} spinRef={wheels} />
      <Wheel position={[0.8, 0.34, -1.65]} spinRef={wheels} />
      <Arm from={[0.3, 0.4, 1.4]} to={[0.72, 0.38, 1.55]} />
      <Arm from={[-0.3, 0.4, 1.4]} to={[-0.72, 0.38, 1.55]} />
      <Arm from={[0.3, 0.4, -1.5]} to={[0.74, 0.38, -1.65]} />
      <Arm from={[-0.3, 0.4, -1.5]} to={[-0.74, 0.38, -1.65]} />
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [6.1, 2.2, 6.4], fov: 27 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      <group position={[0.55, 0, 0]}>
        <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.35} floatingRange={[-0.04, 0.08]}>
          <F1Car />
        </Float>
      </group>

      <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={10} blur={2.6} far={2.2} />

      {/* студийный свет, собранный из локальных панелей — без сетевых HDRI */}
      <Environment resolution={256}>
        <Lightformer intensity={5} position={[0, 5, 0]} scale={[9, 5, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={2.2} color="#ff2800" position={[-5, 1.6, -3]} scale={[5, 2.4, 1]} rotation-y={Math.PI / 3} />
        <Lightformer intensity={1.6} position={[5, 1.2, 3.5]} scale={[3.5, 2, 1]} rotation-y={-Math.PI / 3} />
        <Lightformer intensity={1.2} color="#fff2d0" position={[0, 2, 6]} scale={[6, 1, 1]} />
      </Environment>

      <spotLight position={[3, 6, 2]} intensity={0.9} angle={0.5} penumbra={0.8} />
      <pointLight color="#ff2800" intensity={1.4} position={[-3.5, 0.7, -2.5]} />
      <ambientLight intensity={0.25} />
    </Canvas>
  );
}
