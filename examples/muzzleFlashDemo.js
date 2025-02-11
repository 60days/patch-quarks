
import {
    Group,
    Scene,
    MeshStandardMaterial,
    PlaneBufferGeometry,
    PointLight,
    DoubleSide,
    Mesh,
    Vector4,
    Vector3,
    Color,
    AdditiveBlending,
    NormalBlending,
    TextureLoader
} from "./js/three.module.js";
import {
    Bezier, ColorOverLife, ColorRange,
    ConeEmitter, ConstantColor, ConstantValue, FrameOverLife,
    IntervalValue,
    PiecewiseBezier, PointEmitter, RandomColor,
    RenderMode, RotationOverLife,
    SizeOverLife, ParticleSystem, ParticleEmitter, BatchedParticleRenderer
} from "./js/three.quarks.esm.js";


export class MuzzleFlashDemo {

    batchRenderer;
    groups = [];
    totalTime = 0;
    refreshIndex = 0;
    texture;

    render(delta) {

        this.groups.forEach(group =>
            group.traverse(object => {
                if (object.userData && object.userData.func) {
                    object.userData.func.call(object, delta);
                }
            })
        );

        while (Math.floor(this.totalTime * 100) > this.refreshIndex) {
            if (this.refreshIndex < this.groups.length) {
                this.groups[this.refreshIndex].traverse(object => {
                    if (object instanceof ParticleEmitter) {
                        object.system.restart();
                    }
                });
            }
            this.refreshIndex++;
        }
        this.totalTime += delta;
        if (this.totalTime > 1) {
            this.totalTime = 0;
            this.refreshIndex = 0;
        }

        if (this.batchRenderer)
            this.batchRenderer.update(delta);
    }

    initMuzzleEffect(index) {
        const group = new Group();

        const beam = new ParticleSystem(this.batchRenderer, {
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.1, 0.2),
            startSpeed: new ConstantValue(0),
            startSize: new ConstantValue(4),
            startColor: new ConstantColor(new Vector4(1, 0.585716, 0.1691176, 1)),
            worldSpace: false,

            maxParticle: 10,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{
                time: 0,
                count: 1,
                cycle: 1,
                interval: 0.01,
                probability: 1,
            }],

            shape: new PointEmitter(),
            texture: this.texture,
            blending: AdditiveBlending,
            startTileIndex: new ConstantValue(1),
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 0,
        });
        beam.emitter.name = 'beam';
        beam.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        group.add(beam.emitter);

        let muzzle = {
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.1, 0.2),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(1, 5),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            worldSpace: false,

            maxParticle: 5,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{
                time: 0,
                count: 1,
                cycle: 1,
                interval: 0.01,
                probability: 1,
            }],

            shape: new PointEmitter(),
            texture: this.texture,
            blending: AdditiveBlending,
            startTileIndex: new ConstantValue(91),
            uTileCount: 10,
            vTileCount: 10,
            renderOrder: 2,
            renderMode: RenderMode.LocalSpace
        };

        const muzzle1 = new ParticleSystem(this.batchRenderer, muzzle);
        muzzle1.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 0.3882312, 0.125, 1), new Vector4(1, 0.826827, 0.3014706, 1))));
        muzzle1.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        muzzle1.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(91, 94, 97, 100), 0]])));
        muzzle1.emitter.name = 'muzzle1';
        muzzle1.emitter.position.x = 1;
        group.add(muzzle1.emitter);

        const muzzle2 = new ParticleSystem(this.batchRenderer, muzzle);
        muzzle2.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 0.3882312, 0.125, 1), new Vector4(1, 0.826827, 0.3014706, 1))));
        muzzle2.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        muzzle2.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(91, 94, 97, 100), 0]])));
        muzzle2.emitter.renderOrder = 2;
        muzzle2.emitter.name = 'muzzle2';
        muzzle2.emitter.position.x = 1;
        muzzle2.emitter.rotation.x = Math.PI / 2;
        group.add(muzzle2.emitter);

        const flash = new ParticleSystem(this.batchRenderer, {
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.1, 0.2),
            startSpeed: new ConstantValue(0),
            startSize: new IntervalValue(1, 2.5),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new ConstantColor(new Vector4(1, 1, 1, 1)),
            worldSpace: false,

            maxParticle: 5,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{
                time: 0,
                count: 2,
                cycle: 1,
                interval: 0.01,
                probability: 1,
            }],

            shape: new PointEmitter(),
            texture: this.texture,
            blending: AdditiveBlending,
            startTileIndex: new ConstantValue(81),
            uTileCount: 10,
            vTileCount: 10,
            renderMode: RenderMode.BillBoard,
            renderOrder: 2,
        });
        flash.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 0.95, 0.82, 1), new Vector4(1, 0.38, 0.12, 1))));
        flash.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(81, 84.333, 87.666, 91), 0]])));
        flash.emitter.name = 'flash';
        group.add(flash.emitter);

        const smoke = new ParticleSystem(this.batchRenderer, {
            duration: 2.5,
            looping: false,
            startLife: new IntervalValue(0.6, 0.8),
            startSpeed: new IntervalValue(0.1, 3),
            startSize: new IntervalValue(0.75, 1.5),
            startRotation: new IntervalValue(-Math.PI, Math.PI),
            startColor: new RandomColor(new Vector4(0.6323, 0.6323, 0.6323, .31), new Vector4(1, 1, 1, 0.54)),
            worldSpace: true,

            maxParticle: 10,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{
                time: 0,
                count: 5,
                cycle: 1,
                interval: 0.01,
                probability: 1,
            }],

            shape: new ConeEmitter({
                angle: 20 * Math.PI / 180,
                radius: 0.3,
                thickness: 1,
                arc: Math.PI * 2,
            }),
            texture: this.texture,
            blending: NormalBlending,
            startTileIndex: new ConstantValue(81),
            uTileCount: 10,
            vTileCount: 10,
            renderMode: RenderMode.BillBoard,
            renderOrder: -2,
        });
        smoke.addBehavior(new ColorOverLife(new ColorRange(new Vector4(1, 1, 1, 1), new Vector4(1, 1, 1, 0))));
        smoke.addBehavior(new RotationOverLife(new IntervalValue(-Math.PI / 4, Math.PI / 4)));
        smoke.addBehavior(new FrameOverLife(new PiecewiseBezier([[new Bezier(28, 31, 34, 37), 0]])));
        smoke.emitter.name = 'smoke';
        smoke.emitter.rotation.y = Math.PI / 2;
        group.add(smoke.emitter);

        const particles = new ParticleSystem(this.batchRenderer, {
            duration: 1,
            looping: false,
            startLife: new IntervalValue(0.2, 0.6),
            startSpeed: new IntervalValue(1, 15),
            startSize: new IntervalValue(0.1, 0.3),
            startColor: new RandomColor(new Vector4(1, 0.91, 0.51, 1), new Vector4(1, 0.44, 0.16, 1)),
            worldSpace: true,

            maxParticle: 10,
            emissionOverTime: new ConstantValue(0),
            emissionBursts: [{
                time: 0,
                count: 8,
                cycle: 1,
                interval: 0.01,
                probability: 1,
            }],

            shape: new ConeEmitter({
                angle: 20 * Math.PI / 180,
                radius: 0.3,
                thickness: 1,
                arc: Math.PI * 2,
            }),
            texture: this.texture,
            blending: AdditiveBlending,
            startTileIndex: new ConstantValue(0),
            uTileCount: 10,
            vTileCount: 10,
            renderMode: RenderMode.StretchedBillBoard,
            speedFactor: 0.05,
            renderOrder: 1,
        });
        particles.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, 0.95, 0.75, 0), 0]])));
        particles.emitter.name = 'particles';
        particles.emitter.rotation.y = Math.PI / 2;
        group.add(particles.emitter);

        group.position.set(Math.floor(index / 10) * 2 - 10, 0, (index % 10) * 2 - 10);
        group.visible = false;
        this.scene.add(group);
        this.groups.push(group);
    }

    initScene() {
        this.scene = new Scene();
        this.scene.background = new Color(0);
        const geo = new PlaneBufferGeometry(2000, 2000, 8, 8);
        const mat = new MeshStandardMaterial({color: 0x222222, side: DoubleSide});
        const plane = new Mesh(geo, mat);
        this.scene.add(plane);
        plane.position.set(0, -10, 0);
        plane.lookAt(new Vector3(0, 1, 0));

        const light = new PointLight(0xffffff, 1, 300);
        light.position.set(0, 20, 0);
        this.scene.add(light);

        this.texture = new TextureLoader().load("textures/texture1.png", (texture) => {
            this.texture.name = "textures/texture1.png";
            this.batchRenderer = new BatchedParticleRenderer();
            this.scene.add(this.batchRenderer);

            for (let i = 0; i < 100; i++) {
                this.initMuzzleEffect(i);
            }
        });
        return this.scene;
    }
}
