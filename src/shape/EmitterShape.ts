import {Particle} from "../Particle";
import {ConeEmitter} from "./ConeEmitter";
import {DonutEmitter} from "./DonutEmitter";
import {PointEmitter} from "./PointEmitter";
import {SphereEmitter} from "./SphereEmitter";
import {MeshSurfaceEmitter} from "./MeshSurfaceEmitter";
import {ParticleSystemEmitter} from "./ParticleSystemEmitter";
import {Constructable, ParameterPair} from "../TypeUtil";
import {ApplyForce, BehaviorPlugin, BehaviorTypes} from "../behaviors";

export interface ShapeJSON {
    type: string;
    radius?: number;
    arc?: number;
    thickness?: number;
    angle?: number;
    mesh?: string;
    particleSystem?: string;
}

export interface EmitterShape {

    type: string;
    initialize(particle: Particle): void;
    toJSON(): ShapeJSON;

    clone(): EmitterShape;
}

export interface EmitterShapePlugin {
    type: string;
    constructor: Constructable<EmitterShape>;
    params: ParameterPair[];
    loadJSON: (json: any) => EmitterShape;
}

export const EmitterShapes: {[key: string]: EmitterShapePlugin} = {
    "cone": {type: "cone", params: [["radius", "number"], ["arc", "radian"], ["thickness", "number"], ["angle", "radian"]], constructor: ConeEmitter, loadJSON: ConeEmitter.fromJSON},
    "donut": {type: "donut", params: [["radius", "number"], ["arc", "radian"], ["thickness", "number"], ["angle", "radian"]], constructor: DonutEmitter, loadJSON: DonutEmitter.fromJSON},
    "point": {type: "point", params: [], constructor: PointEmitter, loadJSON: PointEmitter.fromJSON},
    "sphere": {type: "sphere", params: [["radius", "number"], ["arc", "radian"], ["thickness", "number"], ["angle", "radian"]], constructor: SphereEmitter, loadJSON: SphereEmitter.fromJSON},
    "mesh_surface": {type: "mesh_surface", params: [["mesh", "mesh"]], constructor: MeshSurfaceEmitter, loadJSON: MeshSurfaceEmitter.fromJSON},
};

export function EmitterFromJSON(json: ShapeJSON): EmitterShape {
    return EmitterShapes[json.type].loadJSON(json);
}
