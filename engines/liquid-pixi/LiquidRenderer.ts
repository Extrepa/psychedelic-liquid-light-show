/**
 * LiquidRenderer.ts
 * 
 * PIXI.js-based two-phase (oil + water) fluid simulator with realistic optics.
 * Mobile-first, WebGL1 compatible, with Canvas2D fallback.
 */

import * as PIXI from 'pixi.js';
import type { LiquidConfig } from '../../types';
import { detectWebGLCapabilities } from './capabilities';

// Import shaders as strings (vite-plugin-glsl handles this)
import passthroughVert from '../../shaders/passthrough.vert.glsl';
import advectFrag from '../../shaders/advect.frag.glsl';
import divergenceFrag from '../../shaders/divergence.frag.glsl';
import pressureFrag from '../../shaders/pressure.frag.glsl';
import gradientFrag from '../../shaders/gradient.frag.glsl';
import diffuseFrag from '../../shaders/diffuse.frag.glsl';
import splatFrag from '../../shaders/splat.frag.glsl';
import surfaceTensionFrag from '../../shaders/surfaceTension.frag.glsl';
import separationFrag from '../../shaders/separation.frag.glsl';
import shadeFrag from '../../shaders/shade.frag.glsl';

export interface LiquidRendererOptions {
  parent: HTMLElement;
  config: LiquidConfig;
  performanceMode?: boolean;
}

/**
 * Main renderer class wrapping PIXI.Application and simulation loop.
 */
export class LiquidRenderer {
  private app: PIXI.Application;
  private config: LiquidConfig;
  private performanceMode: boolean;
  
  // Render targets (ping-pong)
  private velocityRT: [PIXI.RenderTexture, PIXI.RenderTexture];
  private pressureRT: [PIXI.RenderTexture, PIXI.RenderTexture];
  private divergenceRT: PIXI.RenderTexture;
  private oilFieldRT: [PIXI.RenderTexture, PIXI.RenderTexture];
  private waterFieldRT: [PIXI.RenderTexture, PIXI.RenderTexture];
  private backgroundRT: PIXI.RenderTexture;
  
  // Shader programs (PIXI.Filter wraps them)
  private advectFilter: PIXI.Filter;
  private divergenceFilter: PIXI.Filter;
  private pressureFilter: PIXI.Filter;
  private gradientFilter: PIXI.Filter;
  private diffuseFilter: PIXI.Filter;
  private splatFilter: PIXI.Filter;
  private surfaceTensionFilter: PIXI.Filter;
  private separationFilter: PIXI.Filter;
  private shadeFilter: PIXI.Filter;
  
  // Simulation state
  private simWidth: number = 0;
  private simHeight: number = 0;
  private dt: number = 1 / 60;
  private accumTime: number = 0;
  private lastTime: number = performance.now();
  private rafId: number | null = null;
  private isRunning: boolean = false;
  
  // Quad sprite for full-screen passes
  private quadSprite: PIXI.Sprite;
  private outputSprite: PIXI.Sprite;
  
  constructor(options: LiquidRendererOptions) {
    const caps = detectWebGLCapabilities();
    if (!caps.supported) {
      throw new Error('WebGL not supported; use Canvas2D fallback');
    }
    
    this.config = options.config;
    this.performanceMode = options.performanceMode ?? false;
    
    // Initialize PIXI app
    this.app = new PIXI.Application();
    this.app.init({
      width: options.parent.clientWidth,
      height: options.parent.clientHeight,
      antialias: false,
      powerPreference: 'high-performance',
      autoDensity: true,
      backgroundColor: 0x000000,
    }).then(() => {
      options.parent.appendChild(this.app.canvas as HTMLCanvasElement);
      this.app.stage.sortableChildren = true;
      
      // Compute sim resolution
      this.updateSimResolution();
      
      // Create render targets
      this.createRenderTargets();
      
      // Create shaders
      this.createShaders();
      
      // Create sprites
      this.quadSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      this.outputSprite = new PIXI.Sprite();
      this.app.stage.addChild(this.outputSprite);
      
      // Listen for resize
      window.addEventListener('resize', this.handleResize);
    });
  }
  
  private updateSimResolution() {
    const scale = this.config.simScale ?? 0.5;
    this.simWidth = Math.floor(this.app.renderer.width * scale);
    this.simHeight = Math.floor(this.app.renderer.height * scale);
  }
  
  private createRenderTargets() {
    const w = this.simWidth;
    const h = this.simHeight;
    
    const rtOptions = {
      width: w,
      height: h,
      scaleMode: PIXI.SCALE_MODES.NEAREST,
      wrapMode: PIXI.WRAP_MODES.CLAMP,
    };
    
    this.velocityRT = [
      PIXI.RenderTexture.create(rtOptions),
      PIXI.RenderTexture.create(rtOptions),
    ];
    this.pressureRT = [
      PIXI.RenderTexture.create(rtOptions),
      PIXI.RenderTexture.create(rtOptions),
    ];
    this.divergenceRT = PIXI.RenderTexture.create(rtOptions);
    this.oilFieldRT = [
      PIXI.RenderTexture.create(rtOptions),
      PIXI.RenderTexture.create(rtOptions),
    ];
    this.waterFieldRT = [
      PIXI.RenderTexture.create(rtOptions),
      PIXI.RenderTexture.create(rtOptions),
    ];
    
    // Full-res background for refraction sampling
    this.backgroundRT = PIXI.RenderTexture.create({
      width: this.app.renderer.width,
      height: this.app.renderer.height,
      scaleMode: PIXI.SCALE_MODES.LINEAR,
    });
  }
  
  private createShaders() {
    // Advection
    this.advectFilter = new PIXI.Filter(passthroughVert, advectFrag, {
      uField: PIXI.Texture.EMPTY,
      uVelocity: PIXI.Texture.EMPTY,
      uTexelSize: [1 / this.simWidth, 1 / this.simHeight],
      uDt: this.dt,
      uDissipation: 0.98,
    });
    
    // Divergence
    this.divergenceFilter = new PIXI.Filter(passthroughVert, divergenceFrag, {
      uVelocity: PIXI.Texture.EMPTY,
      uTexelSize: [1 / this.simWidth, 1 / this.simHeight],
    });
    
    // Pressure
    this.pressureFilter = new PIXI.Filter(passthroughVert, pressureFrag, {
      uPressure: PIXI.Texture.EMPTY,
      uDivergence: PIXI.Texture.EMPTY,
      uTexelSize: [1 / this.simWidth, 1 / this.simHeight],
    });
    
    // Gradient subtraction
    this.gradientFilter = new PIXI.Filter(passthroughVert, gradientFrag, {
      uVelocity: PIXI.Texture.EMPTY,
      uPressure: PIXI.Texture.EMPTY,
      uTexelSize: [1 / this.simWidth, 1 / this.simHeight],
    });
    
    // Diffusion
    this.diffuseFilter = new PIXI.Filter(passthroughVert, diffuseFrag, {
      uVelocity: PIXI.Texture.EMPTY,
      uTexelSize: [1 / this.simWidth, 1 / this.simHeight],
      uViscosity: this.config.viscosity ?? 0.2,
      uDt: this.dt,
    });
    
    // Splat
    this.splatFilter = new PIXI.Filter(passthroughVert, splatFrag, {
      uField: PIXI.Texture.EMPTY,
      uPoint: [0.5, 0.5],
      uRadius: 0.05,
      uColor: [1, 0, 0],
      uThickness: 1.0,
    });
    
    // Surface tension
    this.surfaceTensionFilter = new PIXI.Filter(passthroughVert, surfaceTensionFrag, {
      uField: PIXI.Texture.EMPTY,
      uTexelSize: [1 / this.simWidth, 1 / this.simHeight],
      uSurfaceTension: this.config.surfaceTension ?? 0.5,
      uDt: this.dt,
    });
    
    // Separation (buoyancy)
    this.separationFilter = new PIXI.Filter(passthroughVert, separationFrag, {
      uVelocity: PIXI.Texture.EMPTY,
      uOilField: PIXI.Texture.EMPTY,
      uWaterField: PIXI.Texture.EMPTY,
      uTexelSize: [1 / this.simWidth, 1 / this.simHeight],
      uOilDensity: this.config.oilDensity ?? 0.85,
      uWaterDensity: this.config.waterDensity ?? 1.0,
      uGravityStrength: this.config.gravityStrength ?? 0.4,
      uGravityDir: this.computeGravityDir(),
    });
    
    // Shading
    this.shadeFilter = new PIXI.Filter(passthroughVert, shadeFrag, {
      uOilField: PIXI.Texture.EMPTY,
      uWaterField: PIXI.Texture.EMPTY,
      uBackground: PIXI.Texture.EMPTY,
      uTexelSize: [1 / this.simWidth, 1 / this.simHeight],
      uResolution: [this.app.renderer.width, this.app.renderer.height],
      uRefractiveIndexOil: this.config.refractiveIndexOil ?? 1.45,
      uGloss: this.config.gloss ?? 0.75,
      uLightDir: this.computeLightDir(),
      uLightIntensity: this.config.lightIntensity ?? 1.0,
      uRefractionStrength: this.config.refractionStrength ?? 0.6,
      uThinFilm: this.performanceMode ? false : (this.config.thinFilm ?? false),
    });
  }
  
  private computeGravityDir(): [number, number] {
    const angle = (this.config.gravityAngleDeg ?? 90) * (Math.PI / 180);
    return [Math.cos(angle), -Math.sin(angle)];
  }
  
  private computeLightDir(): [number, number, number] {
    const angle = (this.config.lightAngleDeg ?? 45) * (Math.PI / 180);
    return [Math.cos(angle), Math.sin(angle), 0.5];
  }
  
  /**
   * Start the simulation loop
   */
  public play() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  /**
   * Pause the simulation loop
   */
  public pause() {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  /**
   * Main simulation loop
   */
  private loop = () => {
    if (!this.isRunning) return;
    
    const now = performance.now();
    let frameDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    
    // Clamp dt
    frameDt = Math.max(1 / 120, Math.min(frameDt, 1 / 30));
    this.accumTime += frameDt;
    
    // Fixed or semi-fixed time step
    const stepDt = 1 / 60;
    while (this.accumTime >= stepDt) {
      this.step(stepDt);
      this.accumTime -= stepDt;
    }
    
    // Render final output
    this.render();
    
    this.rafId = requestAnimationFrame(this.loop);
  };
  
  /**
   * Single simulation step
   */
  private step(dt: number) {
    this.dt = dt;
    
    // Update uniforms with current config
    this.updateUniforms();
    
    // 1) Advect velocity
    this.applyFilter(this.advectFilter, this.velocityRT[0], this.velocityRT[1], {
      uField: this.velocityRT[0],
      uVelocity: this.velocityRT[0],
      uDt: dt,
    });
    this.swapRT(this.velocityRT);
    
    // 2) Apply separation/buoyancy
    this.applyFilter(this.separationFilter, this.velocityRT[0], this.velocityRT[1], {
      uVelocity: this.velocityRT[0],
      uOilField: this.oilFieldRT[0],
      uWaterField: this.waterFieldRT[0],
    });
    this.swapRT(this.velocityRT);
    
    // 3) Diffuse velocity
    this.applyFilter(this.diffuseFilter, this.velocityRT[0], this.velocityRT[1], {
      uVelocity: this.velocityRT[0],
      uViscosity: this.config.viscosity ?? 0.2,
      uDt: dt,
    });
    this.swapRT(this.velocityRT);
    
    // 4) Compute divergence
    this.applyFilter(this.divergenceFilter, this.velocityRT[0], this.divergenceRT, {
      uVelocity: this.velocityRT[0],
    });
    
    // 5) Pressure solve (iterations)
    const iters = this.performanceMode ? 8 : (this.config.pressureIterations ?? 12);
    for (let i = 0; i < iters; i++) {
      this.applyFilter(this.pressureFilter, this.pressureRT[0], this.pressureRT[1], {
        uPressure: this.pressureRT[0],
        uDivergence: this.divergenceRT,
      });
      this.swapRT(this.pressureRT);
    }
    
    // 6) Subtract gradient
    this.applyFilter(this.gradientFilter, this.velocityRT[0], this.velocityRT[1], {
      uVelocity: this.velocityRT[0],
      uPressure: this.pressureRT[0],
    });
    this.swapRT(this.velocityRT);
    
    // 7) Advect oil field
    this.applyFilter(this.advectFilter, this.oilFieldRT[0], this.oilFieldRT[1], {
      uField: this.oilFieldRT[0],
      uVelocity: this.velocityRT[0],
      uDt: dt,
      uDissipation: 0.995,
    });
    this.swapRT(this.oilFieldRT);
    
    // 8) Advect water field
    this.applyFilter(this.advectFilter, this.waterFieldRT[0], this.waterFieldRT[1], {
      uField: this.waterFieldRT[0],
      uVelocity: this.velocityRT[0],
      uDt: dt,
      uDissipation: 0.995,
    });
    this.swapRT(this.waterFieldRT);
    
    // 9) Apply surface tension to oil
    this.applyFilter(this.surfaceTensionFilter, this.oilFieldRT[0], this.oilFieldRT[1], {
      uField: this.oilFieldRT[0],
      uSurfaceTension: this.config.surfaceTension ?? 0.5,
      uDt: dt,
    });
    this.swapRT(this.oilFieldRT);
    
    // 10) Apply surface tension to water
    this.applyFilter(this.surfaceTensionFilter, this.waterFieldRT[0], this.waterFieldRT[1], {
      uField: this.waterFieldRT[0],
      uSurfaceTension: this.config.surfaceTension ?? 0.5,
      uDt: dt,
    });
    this.swapRT(this.waterFieldRT);
  }
  
  /**
   * Render final shaded output
   */
  private render() {
    // Render a simple black background to backgroundRT (for refraction sampling)
    this.app.renderer.render({
      container: new PIXI.Container(),
      target: this.backgroundRT,
      clear: true,
      clearColor: 0x000000,
    });
    
    // Apply shading filter to produce final image
    const finalRT = PIXI.RenderTexture.create({
      width: this.app.renderer.width,
      height: this.app.renderer.height,
    });
    
    this.quadSprite.texture = PIXI.Texture.WHITE;
    this.quadSprite.width = this.app.renderer.width;
    this.quadSprite.height = this.app.renderer.height;
    this.quadSprite.filters = [this.shadeFilter];
    
    this.shadeFilter.uniforms.uOilField = this.oilFieldRT[0];
    this.shadeFilter.uniforms.uWaterField = this.waterFieldRT[0];
    this.shadeFilter.uniforms.uBackground = this.backgroundRT;
    
    this.app.renderer.render({
      container: this.quadSprite,
      target: finalRT,
    });
    
    // Display final output
    this.outputSprite.texture = finalRT;
    this.outputSprite.width = this.app.renderer.width;
    this.outputSprite.height = this.app.renderer.height;
  }
  
  /**
   * Inject a splat (oil or water)
   */
  public splat(x: number, y: number, radius: number, color: string, phase: 'oil' | 'water') {
    const fieldRT = phase === 'oil' ? this.oilFieldRT : this.waterFieldRT;
    const palette = phase === 'oil' ? this.config.oilPalette : this.config.waterPalette;
    
    // Convert hex to RGB
    const rgb = this.hexToRgb(color);
    
    // Normalize splat position
    const normX = x / this.app.renderer.width;
    const normY = y / this.app.renderer.height;
    const normRadius = (radius / this.app.renderer.width) * 2.0;
    
    this.applyFilter(this.splatFilter, fieldRT[0], fieldRT[1], {
      uField: fieldRT[0],
      uPoint: [normX, normY],
      uRadius: normRadius,
      uColor: rgb,
      uThickness: 1.5,
    });
    this.swapRT(fieldRT);
  }
  
  /**
   * Update configuration at runtime
   */
  public updateConfig(newConfig: LiquidConfig) {
    this.config = { ...this.config, ...newConfig };
    this.updateUniforms();
  }
  
  /**
   * Clear all fields
   */
  public clear() {
    this.clearRT(this.velocityRT[0]);
    this.clearRT(this.pressureRT[0]);
    this.clearRT(this.oilFieldRT[0]);
    this.clearRT(this.waterFieldRT[0]);
  }
  
  /**
   * Destroy and clean up
   */
  public destroy() {
    this.pause();
    window.removeEventListener('resize', this.handleResize);
    this.app.destroy(true, { children: true, texture: true, baseTexture: true });
  }
  
  /**
   * Get the canvas element for capture
   */
  public getCanvas(): HTMLCanvasElement {
    return this.app.canvas as HTMLCanvasElement;
  }
  
  // ===== HELPERS =====
  
  private applyFilter(filter: PIXI.Filter, source: PIXI.RenderTexture, target: PIXI.RenderTexture, uniforms?: Record<string, any>) {
    if (uniforms) {
      Object.assign(filter.uniforms, uniforms);
    }
    
    this.quadSprite.texture = source;
    this.quadSprite.width = target.width;
    this.quadSprite.height = target.height;
    this.quadSprite.filters = [filter];
    
    this.app.renderer.render({
      container: this.quadSprite,
      target,
      clear: false,
    });
    
    this.quadSprite.filters = null;
  }
  
  private swapRT(pair: [PIXI.RenderTexture, PIXI.RenderTexture]) {
    const temp = pair[0];
    pair[0] = pair[1];
    pair[1] = temp;
  }
  
  private clearRT(rt: PIXI.RenderTexture) {
    this.app.renderer.render({
      container: new PIXI.Container(),
      target: rt,
      clear: true,
      clearColor: 0x000000,
    });
  }
  
  private updateUniforms() {
    // Update dynamic uniforms based on current config
    this.separationFilter.uniforms.uOilDensity = this.config.oilDensity ?? 0.85;
    this.separationFilter.uniforms.uWaterDensity = this.config.waterDensity ?? 1.0;
    this.separationFilter.uniforms.uGravityStrength = this.config.gravityStrength ?? 0.4;
    this.separationFilter.uniforms.uGravityDir = this.computeGravityDir();
    
    this.shadeFilter.uniforms.uRefractiveIndexOil = this.config.refractiveIndexOil ?? 1.45;
    this.shadeFilter.uniforms.uGloss = this.config.gloss ?? 0.75;
    this.shadeFilter.uniforms.uLightDir = this.computeLightDir();
    this.shadeFilter.uniforms.uLightIntensity = this.config.lightIntensity ?? 1.0;
    this.shadeFilter.uniforms.uRefractionStrength = this.config.refractionStrength ?? 0.6;
    this.shadeFilter.uniforms.uThinFilm = this.performanceMode ? false : (this.config.thinFilm ?? false);
  }
  
  private handleResize = () => {
    this.updateSimResolution();
    // Recreate RTs if size changed significantly; for now just log
    console.log('Resize detected; consider recreating RTs');
  };
  
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : [1, 0, 0];
  }
}
