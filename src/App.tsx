import React from "react";
import { useBox, Physics, useSphere } from "use-cannon";
import { Canvas, useThree, useFrame } from "react-three-fiber";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import * as THREE from "three";
import "./App.css";
import {
  Controllers,
  DefaultControllerModels,
  useControllers,
} from "./VRControllers";

function Ball() {
  const [ref] = useSphere(() => ({
    mass: 1,
    args: 0.1,
    position: [0, 1, -0.1],
  }));

  return (
    <mesh castShadow ref={ref} receiveShadow>
      <sphereBufferGeometry attach="geometry" args={[0.1, 64, 64]} />
      <meshStandardMaterial attach="material" color={0x112266} />
    </mesh>
  );
}

function Table() {
  const [ref] = useBox(() => ({
    type: "Static",
    mass: 1,
    args: [0.5, 0.05, 0.5],
    position: [0, 0.6, -0.3],
  }));
  return (
    <mesh castShadow ref={ref} receiveShadow>
      <boxBufferGeometry attach="geometry" args={[1, 0.1, 1]} />
      <meshStandardMaterial attach="material" color={0x116622} />
    </mesh>
  );
}

function Paddle() {
  const controllers = useControllers();

  const [ref, api] = useBox(() => ({
    type: "Kinematic",
    args: [0.15, 0.01, 0.3],
  }));

  useFrame(() => {
    const leftController = controllers.find(
      (x) => x.inputSource && x.inputSource.handedness === "left"
    );

    if (leftController === undefined) {
      return;
    }

    const { x, y, z } = leftController.controller.position;
    const rot = leftController.controller.rotation;
    api.position.set(x, y, z);
    api.rotation.set(rot.x, rot.y, rot.z);
  });

  return (
    // @ts-ignore
    <group ref={ref} dispose={null}>
      <mesh position={[0, 0, -0.2]} receiveShadow castShadow>
        <boxGeometry attach="geometry" args={[0.3, 0.02, 0.3]} />
        <meshStandardMaterial attach="material" color={0x662211} />
      </mesh>
    </group>
  );
}

function App() {
  return (
    <Canvas
      vr
      onCreated={({ gl }) => {
        document.body.appendChild(VRButton.createButton(gl));
      }}
      shadowMap
      sRGB
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[-10, -10, -10]} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <Physics
        iterations={20}
        tolerance={0.0001}
        defaultContactMaterial={{
          friction: 0.9,
          restitution: 0.7,
          contactEquationStiffness: 1e7,
          contactEquationRelaxation: 1,
          frictionEquationStiffness: 1e7,
          frictionEquationRelaxation: 2,
        }}
        gravity={[0, -1, 0]}
        allowSleep={false}
      >
        <Controllers>
          <DefaultControllerModels />
          <Ball />
          <Paddle />
          <Table />
        </Controllers>
      </Physics>
    </Canvas>
  );
}

export default App;
