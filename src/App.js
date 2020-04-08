import React, { useEffect, useState } from "react";
import { Canvas, useThree } from "react-three-fiber";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import * as THREE from "three";
import { Raycaster } from "three";
import "./App.css";

const makeXRController = (gl, id) => {
  const controller = gl.xr.getController(id);
  const factory = new XRControllerModelFactory();
  const grip = gl.xr.getControllerGrip(id);
  const model = factory.createControllerModel(grip);

  return {
    controller,
    grip,
    model,
  };
};

const raycaster = new Raycaster();

function Controllers() {
  const { gl, scene } = useThree();

  const [controllers, setControllers] = useState(undefined);

  // Init controllers
  useEffect(() => {
    const controller0 = makeXRController(gl, 0);
    const controller1 = makeXRController(gl, 1);

    setControllers([controller0, controller1]);
  }, []);

  // Setup intersection
  useEffect(() => {
    if (controllers === undefined) {
      return;
    }

    const getIntersection = (controller) => {
      const tempMatrix = new THREE.Matrix4();
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
      return raycaster.intersectObjects(scene.__interaction, true);
    };

    const onSelectStart = (controller) => (e) => {
      const intersections = getIntersection(controller);

      intersections.forEach((it) => {
        const handlers = it.object.__handlers;

        if (handlers.click) {
          handlers.click(it);
        }
      });
    };

    const onSelectEnd = () => () => {};

    controllers.forEach(({ controller }) =>
      controller.addEventListener("selectstart", onSelectStart(controller))
    );

    return () => {
      controllers.forEach(({ controller }) =>
        controller.removeEventListener("selectstart", onSelectStart(controller))
      );
    };
  }, [controllers]);

  if (controllers === undefined) {
    return null;
  }

  return (
    <>
      {controllers.map(({ controller, grip, model }) => (
        <>
          <primitive object={controller} />
          <primitive object={grip}>
            <primitive object={model} />
          </primitive>
        </>
      ))}
    </>
  );
}

function App(props) {
  return (
    <Canvas
      vr
      onCreated={({ gl }) => {
        document.body.appendChild(VRButton.createButton(gl));
        gl.outputEncoding = THREE.sRGBEncoding;
      }}
    >
      <Controllers />
      <hemisphereLight skyColor={"#FFF"} groundColor={"#eee"} intensity={0.8} />
      <mesh
        position={[0, -1, 0]}
        onClick={(e) => {
          console.log(e);
        }}
      >
        <boxGeometry args={[1, 1, 1]} attach="geometry" />
        <meshBasicMaterial color="red" attach="material" />
      </mesh>
    </Canvas>
  );
}

export default App;
