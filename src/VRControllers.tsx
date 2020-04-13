import * as React from "react";
import { WebGLRenderer, Raycaster, Object3D, Intersection, Group } from "three";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import { useThree } from "react-three-fiber";

const factory = new XRControllerModelFactory();

interface XRInputSource {
  handedness: "left" | "right" | "none";
  gamepad: Gamepad;
}

interface XRController {
  squeezing: boolean;
  selecting: boolean;
  inputSource: XRInputSource;
  grip: Group;
  controller: Group;
}

const make = (id: number, gl: WebGLRenderer): XRController => {
  const controller = gl.xr.getController(id);
  const grip = gl.xr.getControllerGrip(id);

  // todo
  // const intersect = () => {
  //   const tempMatrix = new THREE.Matrix4();
  //   tempMatrix.identity().extractRotation(controller.matrixWorld);
  //   raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  //   raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
  //   return raycaster.intersectObjects(objects, true);
  // };

  const root: XRController = {
    squeezing: false,
    selecting: false,
    inputSource: undefined as any,
    grip,
    controller,
  };

  controller.addEventListener("connected", (e) => {
    root.inputSource = e.data;
  });
  controller.addEventListener("selectstart", () => {
    root.selecting = true;
  });
  controller.addEventListener("selectend", () => {
    root.selecting = false;
  });
  controller.addEventListener("squeezestart", () => {
    root.squeezing = true;
  });
  controller.addEventListener("squeezeend", () => {
    root.squeezing = true;
  });

  return root;
};

const ControllersContext = React.createContext<XRController[]>([]);
interface Props {
  children: React.ReactNode;
}
export function Controllers(props: Props) {
  const { gl } = useThree();
  const [controllers, setControllers] = React.useState<XRController[]>([]);

  React.useEffect(() => {
    setControllers([0, 1].map((id) => make(id, gl)));
  }, []);

  return (
    <ControllersContext.Provider value={controllers}>
      {props.children}
    </ControllersContext.Provider>
  );
}

export const useControllers = () => React.useContext(ControllersContext);

export function DefaultControllerModels() {
  const controllers = useControllers();

  const models = React.useMemo(() => {
    return controllers.map((it) => {
      const model = factory.createControllerModel(it.controller);

      return (
        <primitive object={it.grip}>
          <primitive object={model} />
        </primitive>
      );
    });
  }, [controllers]);

  return <>{models}</>;
}
