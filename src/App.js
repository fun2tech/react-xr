import React, { useEffect, useState, useCallback } from "react";
import { Canvas, useThree, useFrame } from "react-three-fiber";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import * as THREE from "three";
import { Raycaster } from "three";
import "./App.css";

const factory = new XRControllerModelFactory();

const makeXRController = (gl, id) => {
  const controller = gl.xr.getController(id);
  const grip = gl.xr.getControllerGrip(id);
  const model = factory.createControllerModel(grip);

  return {
    controller,
    grip,
    model,
  };
};

// const controller =  {
//   over: [],
//   onSelect: () => {over.forEach()},
//   onSelectStart: () => {over.forEach()},
//   onSelectEnd: () => {over.forEach()}
//   frame:
// }

//     const getIntersection = (controller) => {
//       const tempMatrix = new THREE.Matrix4();
//       tempMatrix.identity().extractRotation(controller.matrixWorld);
//       raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
//       raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
//       return raycaster.intersectObjects(scene.__interaction, true);
//     };
// function Controller(props) {
//   const over = useRef([]);

//   const {controller, grip, model} = useMemo(() => {
//     const controller = gl.xr.getController(id);
//     const grip = gl.xr.getControllerGrip(id);
//     const model = factory.createControllerModel(grip);
//     const raycaster = new Raycaster();
//     return {controller, grip, model}
//   },[id]);

//   useFrame(() => {
//       const intersections = getIntersection(controller);

//   });

//   useEffect(() => {
//     const onSelect = () => {
//       over.forEach(it => {

//       })
//     }
//     controller.addEventListener('select', onSelect);
//   }, []);

//   return <>
//           <primitive object={controller} />
//           <primitive object={grip}>
//             <primitive object={model} />
//           </primitive>
//         </>
// }

// const raycaster = new Raycaster();

function Controllers() {
  const { gl, scene, raycaster, events, intersect } = useThree();

  const prepareRay = useCallback((controller) => {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  });

  const [controllers, setControllers] = useState(undefined);

  // Init controllers
  useEffect(() => {
    const controller0 = makeXRController(gl, 0);
    const controller1 = makeXRController(gl, 1);

    const allControllers = [controller0, controller1];
    setControllers(allControllers);

    allControllers.forEach(({ controller }) => {
      controller.addEventListener("selectstart", () => {
        prepareRay(controller);
        events.onPointerDown({ clientX: 0, clientY: 0 }, false);
      });
      controller.addEventListener("selectend", () => {
        prepareRay(controller);
        events.onPointerUp({ clientX: 0, clientY: 0 }, false);
      });
    });
  }, []);

  useFrame(() => {
    controllers.forEach(({ controller }) => {
      prepareRay(controller);
      intersect(undefined, false);
    });
  });

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
        onPointerUp={() => console.log("up")}
        onPointerDown={() => console.log("down")}
        onPointerOver={() => console.log("over")}
        onPointerOut={() => console.log("out")}
        onPointerEnter={() => console.log("enter")}
        onPointerLeave={() => console.log("leave")}
        onPointerMove={() => console.log("move")}
      >
        <boxGeometry args={[1, 1, 1]} attach="geometry" />
        <meshBasicMaterial color="red" attach="material" />
      </mesh>
    </Canvas>
  );
}

export default App;
