import { Engine } from './Engine';
import { Sprite } from './Drawing/Sprite';
import { Color } from './Drawing/Color';
import { Vector } from './Algebra';
import * as Util from './Util/Util';
import { Random } from './Math/Random';
import { Entity } from './EntityComponentSystem/Entity';
import { TransformComponent, BuiltinComponentType, DrawingComponent } from './EntityComponentSystem';
import { LifetimeComponent } from './EntityComponentSystem/LifetimeComponent';
import { Emitter } from './Emitter';

/**
 * An enum that represents the types of emitter nozzles
 */
export enum EmitterType {
  /**
   * Constant for the circular emitter type
   */
  Circle,
  /**
   * Constant for the rectangular emitter type
   */
  Rectangle
}

export class Particle extends Entity {
  public get transform() {
    return this.components[BuiltinComponentType.Transform] as TransformComponent;
  }

  public get pos() {
    return this.transform.pos;
  }

  public set pos(v) {
    this.transform.pos = v;
  }

  public get vel() {
    return this.transform.vel;
  }

  public set vel(v) {
    this.transform.vel = v;
  }

  public get acc() {
    return this.transform.acc;
  }

  public set acc(v) {
    this.transform.acc = v;
  }

  public get angularVelocity() {
    return this.transform.angularVelocity;
  }

  public set angularVelocity(v) {
    this.transform.angularVelocity = v;
  }

  public get rotation() {
    return this.transform.rotation;
  }

  public set rotation(v) {
    this.transform.rotation = v;
  }

  // public position: Vector = new Vector(0, 0);
  // public velocity: Vector = new Vector(0, 0);
  // public acceleration: Vector = new Vector(0, 0);
  // public particleRotationalVelocity: number = 0;
  // public currentRotation: number = 0;

  public focus: Vector = null;
  public focusAccel: number = 0;
  public opacity: number = 1;
  public beginColor: Color = Color.White;
  public endColor: Color = Color.White;

  // Life is counted in ms
  // public life: number = 300;
  public get life() {
    const lifetime = this.components[BuiltinComponentType.Lifetime] as LifetimeComponent;
    return lifetime.current;
  }

  public set life(seconds: number) {
    const lifetime = this.components[BuiltinComponentType.Lifetime] as LifetimeComponent;
    lifetime.current = seconds;
  }

  public fadeFlag: boolean = false;

  // Color transitions
  private _rRate: number = 1;
  private _gRate: number = 1;
  private _bRate: number = 1;
  private _aRate: number = 0;
  private _currentColor: Color = Color.White;

  public emitter: ParticleEmitter = null;
  public particleSize: number = 5;
  // public particleSprite: Sprite = null;

  public set particleSprite(sprite: Sprite) {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      drawing.add('default', sprite);
    }
  }
  public get particleSprite(): Sprite {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    return drawing.current as Sprite;
  }

  public startSize: number;
  public endSize: number;
  public sizeRate: number = 0;
  public elapsedMultiplier: number = 0;

  constructor(
    emitterOrConfig: ParticleEmitter | ParticleArgs,
    life?: number,
    opacity?: number,
    beginColor?: Color,
    endColor?: Color,
    position?: Vector,
    velocity?: Vector,
    acceleration?: Vector,
    startSize?: number,
    endSize?: number
  ) {
    super();
    let emitter = emitterOrConfig;
    if (emitter && !(emitterOrConfig instanceof ParticleEmitter)) {
      const config = emitterOrConfig;
      emitter = config.emitter;
      life = config.life / 1000;
      opacity = config.opacity;
      endColor = config.endColor;
      beginColor = config.beginColor;
      position = config.position;
      velocity = config.velocity;
      acceleration = config.acceleration;
      startSize = config.startSize;
      endSize = config.endSize;
    }

    if (emitter instanceof ParticleEmitter) {
      life = emitter.particleLife / 1000;
      opacity = emitter.opacity;
      endColor = emitter.endColor;
      beginColor = emitter.beginColor;
      endColor = emitter.endColor;
      position = emitter.pos.clone();
      acceleration = emitter.acceleration.clone();
      startSize = emitter.startSize;
      endSize = emitter.endSize;
    }

    const transform = new TransformComponent();
    const drawing = new DrawingComponent();
    const lifetime = new LifetimeComponent();
    this.addComponent(transform);
    this.addComponent(drawing);
    this.addComponent(lifetime);
    // this.addComponent(new DebugComponent);

    lifetime.lifetime = life || 300 / 1000;

    this.emitter = <ParticleEmitter>emitter;
    this.opacity = opacity || this.opacity;
    this.endColor = endColor || this.endColor.clone();
    this.beginColor = beginColor || this.beginColor.clone();
    this._currentColor = this.beginColor.clone();
    this.pos = position || this.pos;
    this.vel = velocity || this.vel;
    this.acc = acceleration || this.acc;
    this._rRate = (this.endColor.r - this.beginColor.r) / this.life;
    this._gRate = (this.endColor.g - this.beginColor.g) / this.life;
    this._bRate = (this.endColor.b - this.beginColor.b) / this.life;
    this._aRate = this.opacity / this.life;

    this.startSize = startSize || 0;
    this.endSize = endSize || 0;

    if (this.endSize > 0 && this.startSize > 0) {
      this.sizeRate = (this.endSize - this.startSize) / this.life;
      this.particleSize = this.startSize;
    }
  }

  public kill() {
    this.emitter.removeParticle(this);
  }

  public update(delta: number) {
    this.life = this.life - delta;
    this.elapsedMultiplier = this.elapsedMultiplier + delta;

    if (this.life < 0) {
      this.kill();
    }

    if (this.fadeFlag) {
      this.opacity = Util.clamp(this._aRate * this.life, 0.0001, 1);
    }

    if (this.startSize > 0 && this.endSize > 0) {
      this.particleSize = Util.clamp(
        this.sizeRate * delta + this.particleSize,
        Math.min(this.startSize, this.endSize),
        Math.max(this.startSize, this.endSize)
      );
    }

    this._currentColor.r = Util.clamp(this._currentColor.r + this._rRate * delta, 0, 255);
    this._currentColor.g = Util.clamp(this._currentColor.g + this._gRate * delta, 0, 255);
    this._currentColor.b = Util.clamp(this._currentColor.b + this._bRate * delta, 0, 255);
    this._currentColor.a = Util.clamp(this.opacity, 0.0001, 1);

    if (this.focus) {
      const accel = this.focus
        .sub(this.pos)
        .normalize()
        .scale(this.focusAccel)
        .scale(delta / 1000);
      this.vel = this.vel.add(accel);
    } else {
      this.vel = this.vel.add(this.acc.scale(delta / 1000));
    }
    this.pos = this.pos.add(this.vel.scale(delta / 1000));

    if (this.angularVelocity) {
      this.rotation = (this.rotation + (this.angularVelocity * delta) / 1000) % (2 * Math.PI);
    }
  }

  public onPreDraw(ctx: CanvasRenderingContext2D) {
    // if (this.particleSprite) {
    //   this.particleSprite.rotation = this.rotation;
    //   this.particleSprite.scale.setTo(this.particleSize, this.particleSize);
    //   this.particleSprite.draw(ctx, this.pos.x, this.pos.y);
    //   return;
    // }

    if (!this.particleSprite) {
      this._currentColor.a = Util.clamp(this.opacity, 0.0001, 1);
      ctx.fillStyle = this._currentColor.toString();
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.particleSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }
}

/**
 * [[include:Constructors.md]]
 */
export interface ParticleArgs extends Partial<Particle> {
  emitter: ParticleEmitter;
  position?: Vector;
  velocity?: Vector;
  acceleration?: Vector;
  particleRotationalVelocity?: number;
  currentRotation?: number;
  particleSize?: number;
  particleSprite?: Sprite;
}

/**
 * Using a particle emitter is a great way to create interesting effects
 * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
 * extend [[Actor]] allowing you to use all of the features that come with.
 *
 * [[include:Particles.md]]
 */
export class ParticleEmitter extends Emitter {
  private _particlesToEmit: number;

  public numParticles: number = 0;

  /**
   * Random number generator
   */
  public random: Random;

  /**
   * Gets or sets the isEmitting flag
   */
  public isEmitting: boolean = true;
  /**
   * Gets or sets the backing particle collection
   */
  public particles: Util.Collection<Entity> = null;

  /**
   * Gets or sets the backing deadParticle collection
   */
  public deadParticles: Util.Collection<Entity> = null;

  /**
   * Gets or sets the minimum particle velocity
   */
  public minVel: number = 0;
  /**
   * Gets or sets the maximum particle velocity
   */
  public maxVel: number = 0;

  /**
   * Gets or sets the acceleration vector for all particles
   */
  public acceleration: Vector = new Vector(0, 0);

  /**
   * Gets or sets the minimum angle in radians
   */
  public minAngle: number = 0;
  /**
   * Gets or sets the maximum angle in radians
   */
  public maxAngle: number = 0;

  /**
   * Gets or sets the emission rate for particles (particles/sec)
   */
  public emitRate: number = 1; //particles/sec
  /**
   * Gets or sets the life of each particle in milliseconds
   */
  public particleLife: number = 2000;
  /**
   * Gets or sets the opacity of each particle from 0 to 1.0
   */
  public opacity: number = 1;
  /**
   * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
   */
  public fadeFlag: boolean = false;

  /**
   * Gets or sets the optional focus where all particles should accelerate towards
   */
  public focus: Vector = null;
  /**
   * Gets or sets the acceleration for focusing particles if a focus has been specified
   */
  public focusAccel: number = 1;
  /*
   * Gets or sets the optional starting size for the particles
   */
  public startSize: number = null;
  /*
   * Gets or sets the optional ending size for the particles
   */
  public endSize: number = null;

  /**
   * Gets or sets the minimum size of all particles
   */
  public minSize: number = 5;
  /**
   * Gets or sets the maximum size of all particles
   */
  public maxSize: number = 5;

  /**
   * Gets or sets the beginning color of all particles
   */
  public beginColor: Color = Color.White;
  /**
   * Gets or sets the ending color of all particles
   */
  public endColor: Color = Color.White;

  /**
   * Gets or sets the sprite that a particle should use
   * @warning Performance intensive
   */
  public particleSprite: Sprite = null;

  /**
   * Gets or sets the emitter type for the particle emitter
   */
  public emitterType: EmitterType = EmitterType.Rectangle;

  /**
   * Gets or sets the emitter radius, only takes effect when the [[emitterType]] is [[EmitterType.Circle]]
   */
  public radius: number = 0;

  /**
   * Gets or sets the particle rotational speed velocity
   */
  public particleRotationalVelocity: number = 0;

  /**
   * Indicates whether particles should start with a random rotation
   */
  public randomRotation: boolean = false;

  public get transform() {
    return this.components[BuiltinComponentType.Transform] as TransformComponent;
  }

  public get pos() {
    return this.transform.pos;
  }

  public width: number = 0;
  public height: number = 0;

  /**
   * @param x       The x position of the emitter
   * @param y       The y position of the emitter
   * @param width   The width of the emitter
   * @param height  The height of the emitter
   */
  constructor(xOrConfig?: number | ParticleEmitterArgs, y?: number, width?: number, height?: number) {
    super();

    this._particlesToEmit = 0;
    this.particles = new Util.Collection<Particle>();
    this.deadParticles = new Util.Collection<Particle>();
    this.random = new Random();

    const transform = this.components[BuiltinComponentType.Transform] as TransformComponent;
    if (typeof xOrConfig === 'number') {
      transform.pos.setTo(xOrConfig, y);
      this.width = width;
      this.height = height;
    } else {
      transform.pos = new Vector(xOrConfig.x || 0, xOrConfig.y || 0);
      this.width = xOrConfig.width;
      this.height = xOrConfig.height;
      this.particleSprite = xOrConfig.particleSprite;
      this.minVel = xOrConfig.minVel;
      this.maxVel = xOrConfig.maxVel;
      this.minAngle = xOrConfig.minAngle;
      this.maxAngle = xOrConfig.maxAngle;
      this.emitRate = xOrConfig.emitRate;
      this.acceleration = xOrConfig.acceleration;
      this.random = xOrConfig.random || this.random;
      this.randomRotation = xOrConfig.randomRotation;
      this.radius = xOrConfig.radius || this.radius;
      this.particleLife = xOrConfig.particleLife;
      this.particleRotationalVelocity = xOrConfig.particleRotationalVelocity;
      this.isEmitting = xOrConfig.isEmitting;
      this.emitRate = xOrConfig.emitRate;
      this.prototype = xOrConfig.prototype || new Particle(this);
    }
  }

  public onSpawn(entity: Entity) {
    let ranX = 0;
    let ranY = 0;

    const angle = Util.randomInRange(this.minAngle, this.maxAngle, this.random);
    const vel = Util.randomInRange(this.minVel, this.maxVel, this.random);
    const size = this.startSize || Util.randomInRange(this.minSize, this.maxSize, this.random);
    const dx = vel * Math.cos(angle);
    const dy = vel * Math.sin(angle);

    if (this.emitterType === EmitterType.Rectangle) {
      ranX = Util.randomInRange(this.pos.x, this.pos.x + this.width, this.random);
      ranY = Util.randomInRange(this.pos.y, this.pos.y + this.height, this.random);
    } else if (this.emitterType === EmitterType.Circle) {
      const radius = Util.randomInRange(0, this.radius, this.random);
      ranX = radius * Math.cos(angle) + this.pos.x;
      ranY = radius * Math.sin(angle) + this.pos.y;
    }

    const lifetime = entity.components[BuiltinComponentType.Lifetime] as LifetimeComponent;
    if (lifetime) {
      lifetime.lifetime = this.particleLife / 1000;
    } else {
      entity.addComponent(new LifetimeComponent(this.particleLife / 1000));
    }

    const transform = entity.components[BuiltinComponentType.Transform] as TransformComponent;
    if (transform) {
      transform.pos.setTo(ranX, ranY);
      transform.vel.setTo(dx, dy);
      transform.acc = this.acceleration.clone();

      transform.angularVelocity = this.particleRotationalVelocity;
      if (this.randomRotation) {
        transform.rotation = Util.randomInRange(0, Math.PI * 2, this.random);
      }
    }

    const drawing = entity.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      if (this.particleSprite) {
        drawing.add('default', this.particleSprite);
      }
    }

    if (entity instanceof Particle) {
      entity.startSize = this.startSize;
      entity.endSize = this.endSize;
      entity.fadeFlag = this.fadeFlag;
      entity.particleSize = size;
      if (this.particleSprite) {
        entity.particleSprite = this.particleSprite;
      }
      entity.angularVelocity = this.particleRotationalVelocity;
      if (this.randomRotation) {
        entity.rotation = Util.randomInRange(0, Math.PI * 2, this.random);
      }
      if (this.focus) {
        entity.focus = this.focus.add(new Vector(this.pos.x, this.pos.y));
        entity.focusAccel = this.focusAccel;
      }
    }
  }

  public removeParticle(particle: Particle) {
    this.deadParticles.push(particle);
  }

  /**
   * Causes the emitter to emit particles
   * @param particleCount  Number of particles to emit right now
   */
  public emitParticles(particleCount: number) {
    this.spawn(particleCount).forEach((p) => this.particles.push(p));
    // for (let i = 0; i < particleCount; i++) {
    //   this.particles.push(this._createParticle());
    // }
  }

  public clearParticles() {
    this.particles.clear();
  }

  // Creates a new particle given the constraints of the emitter
  // private _createParticle(): Particle {
  //   // todo implement emitter constraints;
  //   let ranX = 0;
  //   let ranY = 0;

  //   const angle = Util.randomInRange(this.minAngle, this.maxAngle, this.random);
  //   const vel = Util.randomInRange(this.minVel, this.maxVel, this.random);
  //   const size = this.startSize || Util.randomInRange(this.minSize, this.maxSize, this.random);
  //   const dx = vel * Math.cos(angle);
  //   const dy = vel * Math.sin(angle);

  //   if (this.emitterType === EmitterType.Rectangle) {
  //     ranX = Util.randomInRange(this.pos.x, this.pos.x + this.width, this.random);
  //     ranY = Util.randomInRange(this.pos.y, this.pos.y + this.height, this.random);
  //   } else if (this.emitterType === EmitterType.Circle) {
  //     const radius = Util.randomInRange(0, this.radius, this.random);
  //     ranX = radius * Math.cos(angle) + this.pos.x;
  //     ranY = radius * Math.sin(angle) + this.pos.y;
  //   }

  //   const p = new Particle(
  //     this,
  //     this.particleLife,
  //     this.opacity,
  //     this.beginColor,
  //     this.endColor,
  //     new Vector(ranX, ranY),
  //     new Vector(dx, dy),
  //     this.acceleration,
  //     this.startSize,
  //     this.endSize
  //   );
  //   p.fadeFlag = this.fadeFlag;
  //   p.particleSize = size;
  //   if (this.particleSprite) {
  //     p.particleSprite = this.particleSprite;
  //   }
  //   p.angularVelocity = this.particleRotationalVelocity;
  //   if (this.randomRotation) {
  //     p.rotation = Util.randomInRange(0, Math.PI * 2, this.random);
  //   }
  //   if (this.focus) {
  //     p.focus = this.focus.add(new Vector(this.pos.x, this.pos.y));
  //     p.focusAccel = this.focusAccel;
  //   }
  //   return p;
  // }

  public onPreUpdate(_engine: Engine, delta: number) {
    if (this.isEmitting) {
      this._particlesToEmit += this.emitRate * (delta / 1000);
      //var numParticles = Math.ceil(this.emitRate * delta / 1000);
      if (this._particlesToEmit > 1.0) {
        this.emitParticles(Math.floor(this._particlesToEmit));
        this._particlesToEmit = this._particlesToEmit - Math.floor(this._particlesToEmit);
      }
    }

    // this.particles.forEach((p) => p.update(delta));
    this.deadParticles.forEach((p) => this.particles.removeElement(p));
    this.deadParticles.clear();
  }

  public draw(_ctx: CanvasRenderingContext2D) {
    // todo is there a more efficient to draw
    // possibly use a webgl offscreen canvas and shaders to do particles?
    // this.particles.forEach((p) => p.draw(ctx));
  }

  // public debugDraw(ctx: CanvasRenderingContext2D) {
  //   super.debugDraw(ctx);
  //   ctx.fillStyle = Color.Black.toString();
  //   ctx.fillText('Particles: ' + this.particles.count(), this.pos.x, this.pos.y + 20);

  //   if (this.focus) {
  //     ctx.fillRect(this.focus.x + this.pos.x, this.focus.y + this.pos.y, 3, 3);
  //     DrawUtil.line(ctx, Color.Yellow, this.focus.x + this.pos.x, this.focus.y + this.pos.y, this.center.x, this.center.y);
  //     ctx.fillText('Focus', this.focus.x + this.pos.x, this.focus.y + this.pos.y);
  //   }
  // }
}

/**
 * [[include:Constructors.md]]
 */
export interface ParticleEmitterArgs extends Partial<ParticleEmitter> {
  prototype?: Entity;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isEmitting?: boolean;
  minVel?: number;
  maxVel?: number;
  acceleration?: Vector;
  minAngle?: number;
  maxAngle?: number;
  emitRate?: number;
  particleLife?: number;
  opacity?: number;
  fadeFlag?: boolean;
  focus?: Vector;
  focusAccel?: number;
  startSize?: number;
  endSize?: number;
  minSize?: number;
  maxSize?: number;
  beginColor?: Color;
  endColor?: Color;
  particleSprite?: Sprite;
  emitterType?: EmitterType;
  radius?: number;
  particleRotationalVelocity?: number;
  randomRotation?: boolean;
  random?: Random;
}
