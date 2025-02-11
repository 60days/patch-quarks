import {EmitterShape, ShapeJSON} from "./EmitterShape";
import {Particle} from "../Particle";
import {Vector3, Mesh, Triangle} from "three";

export class MeshSurfaceEmitter implements EmitterShape {
    type: string = "mesh_surface";

    private _triangleIndexToArea: number[] = [];
    private _mesh?: Mesh;

    get mesh() {
        return this._mesh!;
    }
    set mesh(mesh: Mesh) {
        this._mesh = mesh;
        if (mesh.userData.triangleIndexToArea) {
            this._triangleIndexToArea = mesh.userData.triangleIndexToArea;
            return;
        }
        const tri = new Triangle();
        let area = 0;
        const geometry = mesh.geometry;
        if (!geometry.getIndex()) {
            return;
        }
        const array = geometry.getIndex()!.array;
        const triCount = array.length / 3;
        this._triangleIndexToArea.push(0);
        for (let i = 0; i < triCount; i ++) {
            tri.setFromAttributeAndIndices(
                geometry.getAttribute("position"),
                array[i * 3],
                array[i * 3 + 1],
                array[i * 3 + 2],
            );
            area += tri.getArea();
            this._triangleIndexToArea.push(area);
        }
        mesh.userData.triangleIndexToArea = this._triangleIndexToArea;
    }

    constructor(mesh?: Mesh) {
        if (!mesh) {
            return;
        }
        this.mesh = mesh;
    }

    private _tempA: Vector3 = new Vector3();
    private _tempB: Vector3 = new Vector3();
    private _tempC: Vector3 = new Vector3();

    initialize(p: Particle) {
        if (!this._mesh) {
            p.position.set(0, 0, 0);
            p.velocity.set(0, 0, 1).multiplyScalar(p.startSpeed);
            return;
        }
        const triCount = this._triangleIndexToArea.length - 1;
        let left = 0, right = triCount;
        const target = Math.random() * this._triangleIndexToArea[triCount];
        while(left + 1 < right) {
            const mid = Math.floor((left + right) / 2);
            if (target < this._triangleIndexToArea[mid]) {
                right = mid;
            } else {
                left = mid;
            }
        }

        //const area = this._triangleIndexToArea[left + 1] - this._triangleIndexToArea[left];
        //const percent = (target - this._triangleIndexToArea[left]) / area;
        let u1 = Math.random();
        let u2 = Math.random();
        if (u1 + u2 > 1) {
            u1 = 1 - u1;
            u2 = 1 - u2;
        }
        const geometry = this._mesh.geometry;
        const index1 = geometry.getIndex()!.array[left * 3];
        const index2 = geometry.getIndex()!.array[left * 3 + 1];
        const index3 = geometry.getIndex()!.array[left * 3 + 2];
        const positionBuffer = geometry.getAttribute("position");
        this._tempA.fromBufferAttribute(positionBuffer, index1);
        this._tempB.fromBufferAttribute(positionBuffer, index2);
        this._tempC.fromBufferAttribute(positionBuffer, index3);
        this._tempB.sub(this._tempA);
        this._tempC.sub(this._tempA);
        this._tempA.addScaledVector(this._tempB, u1).addScaledVector(this._tempC,  u2);
        p.position.copy(this._tempA);
        p.velocity.copy(this._tempA).normalize().multiplyScalar(p.startSpeed);
        /*p.position.applyMatrix4(this._mesh.matrixWorld);
        p.velocity.applyMatrix3(this._mesh.normalMatrix);*/
    }

    toJSON(): ShapeJSON {
        return {
            type: 'mesh_surface',
            mesh: this._mesh ? this._mesh.uuid : "",
        };
    }

    static fromJSON(json: any): MeshSurfaceEmitter {
        return new MeshSurfaceEmitter();
    }

    clone(): EmitterShape {
        return new MeshSurfaceEmitter(this._mesh);
    }
}
