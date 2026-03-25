# Phaser 4 New Features and v3 Migration Guide

> Covers all major v4 changes from v3: Filters (replacing FX/BitmapMask), RenderNodes (replacing Pipelines), CaptureFrame, Gradient, Noise game objects, SpriteGPULayer, TilemapGPULayer, Lighting component, RenderSteps, new tint modes, and migration notes.

## Overview: What Changed in v4

Phaser 4 is a complete overhaul of the WebGL rendering engine. The v3 renderer let each subsystem manage WebGL state independently, causing conflicts (e.g. certain FX breaking Masks). v4 centralizes WebGL state management through a RenderNode graph, where each node handles exactly one rendering task.

### Key Removals

| v3 Feature | v4 Replacement |
|---|---|
| `Pipeline` | `RenderNode` (per-task rendering nodes) |
| FX (`preFX` / `postFX`) | Filters (`filters.internal` / `filters.external`) |
| `BitmapMask` | `FilterMask` (via filters system) |
| `GeometryMask` (WebGL) | `FilterMask` (Canvas still uses GeometryMask) |
| Derived FX: Bloom, Circle, Gradient, Shine | Actions (`AddEffectBloom`, `AddEffectShine`, `AddMaskShape`) or GameObjects |
| `Mesh` and `Plane` | Removed (proper 3D planned for future) |
| `Point` | Use `Vector2` instead |

### Key Additions

- **New GameObjects**: `CaptureFrame`, `Gradient`, `Noise`, `NoiseCell2D/3D/4D`, `NoiseSimplex2D/3D`, `SpriteGPULayer`, `Stamp`, `TilemapGPULayer`
- **New Components**: `Lighting`, `RenderSteps`, `RenderNodes`
- **New Tint Modes**: `MULTIPLY`, `FILL`, `ADD`, `SCREEN`, `OVERLAY`, `HARD_LIGHT`
- **New Filters**: Blend, Blocky, CombineColorMatrix, GradientMap, ImageLight, Key, Mask, NormalTools, PanoramaBlur, ParallelFilters, Quantize, Sampler, Threshold
- **GL Orientation**: v4 uses standard GL orientation (Y=0 at bottom for textures)

---

## Filters System (Replacing FX and BitmapMask)

> Full reference: `filters-and-postfx.md`

Filters unify the v3 FX and Mask systems. Every filter takes an input image and produces an output image via a shader pass. Filters can be applied to any game object or camera -- v3 had restrictions on which objects supported FX.

```js
// v3 approach (FX):
sprite.preFX.addGlow(0xff00ff, 4);
sprite.postFX.addBlur(0, 2, 2, 1);

// v4 approach (Filters):
sprite.enableFilters();
sprite.filters.internal.addGlow(0xff00ff, 4, 0, 1);
sprite.filters.external.addBlur(0, 2, 2, 1);

// v3 approach (BitmapMask):
const mask = new Phaser.Display.Masks.BitmapMask(scene, maskImage);
sprite.setMask(mask);

// v4 approach (FilterMask):
sprite.enableFilters();
sprite.filters.internal.addMask(maskImage);
```

**Internal vs External**: Internal filters run before the camera transform (object-local space, cheaper). External filters run after (screen space, full-resolution).

---

## RenderNodes (Replacing Pipelines)

In v3, a `Pipeline` was a rendering system that often handled multiple responsibilities. In v4, each `RenderNode` handles a single rendering task via its `run()` method. Some nodes also have a `batch()` method to accumulate state before drawing.

### Architecture

The `RenderNodeManager` (on the WebGL renderer) owns all render nodes. Game objects reference nodes through role-based maps.

```js
// RenderNode roles on a game object:
// - 'Submitter': runs other node roles for each element
// - 'Transformer': provides vertex coordinates
// - 'Texturer': handles textures

// GameObjects have default and custom render node maps:
gameObject.defaultRenderNodes  // built-in nodes per role
gameObject.customRenderNodes   // overrides per role
gameObject.renderNodeData      // data keyed by node name
```

### Setting Custom RenderNodes

```js
// Override a specific render role:
gameObject.setRenderNodeRole('Submitter', 'MyCustomSubmitter');

// Pass data to a render node:
gameObject.setRenderNodeRole('Transformer', 'MyTransformer', {
    customProperty: 42
});

// Remove a custom node (falls back to default):
gameObject.setRenderNodeRole('Submitter', null);
```

### Built-in RenderNode Types

**Batch Handlers** (accumulate and draw multiple objects per draw call):
- `BatchHandlerQuad` -- standard quad batching (Image, Sprite, BitmapText, etc.)
- `BatchHandlerQuadSingle` -- single-quad variant
- `BatchHandlerTileSprite` -- TileSprite batching
- `BatchHandlerTriFlat` -- flat triangle batching (Graphics, Shape)
- `BatchHandlerPointLight` -- point light batching
- `BatchHandlerStrip` -- triangle strip batching

**Submitters** (coordinate rendering per object type):
- `SubmitterQuad`, `SubmitterTile`, `SubmitterTileSprite`
- `SubmitterSpriteGPULayer`, `SubmitterTilemapGPULayer`

**Transformers** (compute vertex positions):
- `TransformerImage`, `TransformerStamp`, `TransformerTile`, `TransformerTileSprite`

**Texturers** (manage texture binding):
- `TexturerImage`, `TexturerTileSprite`

**Filters** (post-processing -- see `filters-and-postfx.md`):
- `BaseFilter`, `BaseFilterShader`
- `FilterBarrel`, `FilterBlend`, `FilterBlocky`, `FilterBlur` (Low/Med/High variants)
- `FilterBokeh`, `FilterColorMatrix`, `FilterCombineColorMatrix`
- `FilterDisplacement`, `FilterGlow`, `FilterGradientMap`, `FilterImageLight`
- `FilterKey`, `FilterMask`, `FilterNormalTools`, `FilterPanoramaBlur`
- `FilterParallelFilters`, `FilterPixelate`, `FilterQuantize`
- `FilterSampler`, `FilterShadow`, `FilterThreshold`, `FilterVignette`, `FilterWipe`

**Other**:
- `Camera`, `FillCamera`, `FillRect`, `FillPath`, `FillTri`
- `DrawLine`, `StrokePath`, `ShaderQuad`
- `ListCompositor`, `RebindContext`, `YieldContext`
- `DynamicTextureHandler`

### Extending: Custom RenderNodes

```js
// Register a custom node constructor:
renderer.renderNodes.addNodeConstructor('MyNode', MyNodeClass);

// Or add a pre-built node instance:
renderer.renderNodes.addNode('MyNode', myNodeInstance);
```

---

## New Game Objects

### CaptureFrame

Captures the current framebuffer contents to a texture at the point in the display list where it sits. Does not render anything itself. WebGL only.

```js
// Everything above this in the display list gets captured:
const image1 = this.add.image(400, 300, 'background');

// Enable framebuffer usage on the camera:
this.cameras.main.setForceComposite(true);

// Create the capture point:
const capture = this.add.captureFrame('myCapturedTexture');

// Use the captured texture on another object:
const overlay = this.add.image(400, 300, 'myCapturedTexture');
// Add filters to the overlay to distort the captured scene
```

**Key details:**
- Requires `camera.setForceComposite(true)` or a framebuffer context (Filters, DynamicTexture, camera with partial alpha)
- Inside a Container with filters, captures only that Container's contents
- Setting `visible = false` stops capturing
- Components: BlendMode, Depth, RenderNodes, Visible

**Source**: `src/gameobjects/captureframe/CaptureFrame.js`

### Gradient

Displays GPU-rendered color gradients. Extends `Shader`. Supports linear, radial, and other shape modes with configurable `ColorRamp` containing `ColorBand` objects.

```js
// Simple linear gradient:
const grad = this.add.gradient(undefined, 100, 100, 200, 200);

// Complex radial gradient with multiple color bands:
const halo = this.add.gradient({
    bands: [
        { start: 0.5, end: 0.6, colorStart: [0.5, 0.5, 1, 0], colorEnd: 0xffffff, colorSpace: 1, interpolation: 4 },
        { start: 0.6, end: 1, colorStart: 0xffffff, colorEnd: [1, 0.5, 0.5, 0], colorSpace: 1, interpolation: 3 }
    ],
    dither: true,
    repeatMode: 1,
    shapeMode: 2,       // radial
    start: { x: 0.5, y: 0.5 },
    shape: { x: 0.5, y: 0.0 }
}, 400, 300, 800, 800);

// Animate:
halo.offset = 0.1 * (1 + Math.sin(time / 1000));
```

**Key details:**
- Config: `GradientQuadConfig` with `bands`, `shapeMode`, `repeatMode`, `start`, `shape`, `dither`
- Colors defined via `ColorRamp` with `ColorBand` objects (supports HSV, various interpolation modes)
- Call `gradient.ramp.encode()` after modifying ramp data at runtime

**Source**: `src/gameobjects/gradient/Gradient.js`

### Noise Game Objects

All noise types extend `Shader` and are WebGL only. Six variants available:

| Type | Factory | Description |
|---|---|---|
| `Noise` | `this.add.noise()` | White noise (random hash-based) |
| `NoiseCell2D` | `this.add.noiseCell2D()` | 2D cellular/Worley/Voronoi noise |
| `NoiseCell3D` | `this.add.noiseCell3D()` | 3D cellular noise (Z-axis slicing for animation) |
| `NoiseCell4D` | `this.add.noiseCell4D()` | 4D cellular noise (Z+W axis slicing) |
| `NoiseSimplex2D` | `this.add.noiseSimplex2D()` | 2D simplex/gradient noise (clouds, fire, water) |
| `NoiseSimplex3D` | `this.add.noiseSimplex3D()` | 3D simplex noise |

```js
// Basic white noise:
const noise = this.add.noise({
    noiseOffset: [0, 0],
    noisePower: 1
}, 100, 100, 256, 256);

// Cellular noise with customization:
const cells = this.add.noiseCell2D({
    noiseOffset: [0, 0],
    noiseIterations: 3,
    noiseNormalMap: true    // output as normal map for lighting
}, 200, 200, 256, 256);

// Simplex noise for natural effects:
const simplex = this.add.noiseSimplex2D({
    noiseFlow: 0,           // animate this for evolution
    noiseIterations: 4,
    noiseWarpAmount: 0.5,   // turbulence
    noiseSeed: 42,
    noiseNormalMap: false
}, 300, 300, 256, 256);
```

**Common properties across noise types:**
- `noiseOffset` -- `[x, y]` array to scroll the pattern
- `noisePower` -- sculpt output levels (higher suppresses high values)
- `noiseNormalMap` -- output normal map (for lighting integration)
- `noiseIterations` -- detail level (cellular/simplex types)

**Math equivalents**: `Phaser.Math.Hash()`, `Phaser.Math.HashCell()`, `Phaser.Math.HashSimplex()`

**Source**: `src/gameobjects/noise/`

### SpriteGPULayer

Renders very large numbers of quads (up to millions) in a single draw call by storing data in a static GPU buffer. Up to 100x faster than individual sprites. WebGL only.

```js
const layer = this.add.spriteGPULayer(texture, frame);

// Add members (do this all at once, not incrementally):
const member = { x: 100, y: 200, frame: 'tree', scaleX: 1, scaleY: 1, alpha: 1 };
layer.addMember(member);

// Reuse the member object for efficiency with millions of entries:
member.x = 300;
member.y = 400;
member.frame = 'bush';
layer.addMember(member);

// Enable lighting on the layer:
layer.setLighting(true);
```

**Key details:**
- Single texture only (no multi-atlas), single image per layer
- Members support tween-like animations (fade, bounce, wave, color shift) defined at creation
- Updating buffer contents is expensive -- populate once, leave unchanged
- Power-of-two textures recommended for pixel art to avoid seaming
- "Remove" members visually by setting `scaleX/scaleY/alpha` to 0 (avoids buffer rebuild)
- Components: Alpha, BlendMode, Depth, ElapseTimer, Lighting, Mask, RenderNodes, TextureCrop, Visible

**Source**: `src/gameobjects/spritegpulayer/SpriteGPULayer.js`

---

## New Components

> Full component reference: `game-object-components.md`

### Lighting Component

Replaces the v3 approach of assigning a lighting pipeline. WebGL only.

```js
// v3 approach:
sprite.setPipeline('Light2D');

// v4 approach:
sprite.setLighting(true);

// Self-shadowing (simulates surface shadows from texture brightness):
sprite.setSelfShadow(true, 0.5, 1/3);
// Args: enabled, penumbra (lower = sharper), diffuseFlatThreshold (0-1)

// Use game-wide default for self-shadow:
sprite.setSelfShadow(null);  // reads from config.render.selfShadow
```

**Supported on**: BitmapText, Blitter, Graphics, Shape, Image, Sprite, Particles, SpriteGPULayer, Stamp, Text, TileSprite, Video, TilemapLayer, TilemapGPULayer.

**Batching note**: Lighting changes the shader, which breaks batches. Group lit objects together and unlit objects together for best performance.

**Source**: `src/gameobjects/components/Lighting.js`

### RenderSteps Component

Allows injecting custom logic into the render process of a game object. WebGL only. The Filters system uses RenderSteps internally.

```js
// Add a custom render step:
gameObject.addRenderStep(function (renderer, gameObject, drawingContext, parentMatrix, renderStep, displayList, displayListIndex) {
    // Custom rendering logic here
    // Call next step when ready:
    var nextFn = gameObject._renderSteps[renderStep + 1];
    if (nextFn) {
        nextFn(renderer, gameObject, drawingContext, parentMatrix, renderStep + 1, displayList, displayListIndex);
    }
});
```

**Key details:**
- Steps are stored in `_renderSteps` array, executed via `renderWebGLStep()`
- First step runs first and is responsible for calling subsequent steps
- This is how Filters defer and control the `renderWebGL` flow

**Source**: `src/gameobjects/components/RenderSteps.js`

### RenderNodes Component

Provides `defaultRenderNodes`, `customRenderNodes`, and `renderNodeData` maps on game objects. See the RenderNodes section above for usage.

**Source**: `src/gameobjects/components/RenderNodes.js`

---

## TilemapGPULayer

> Full tilemap reference: `tilemaps.md`

High-performance GPU-based tilemap rendering. Renders the entire layer as a single quad via a specialized shader. WebGL only.

```js
// Create via Tilemap with the gpu flag:
const map = this.make.tilemap({ key: 'level1' });
const tileset = map.addTilesetImage('tiles', 'tilesImage');
const gpuLayer = map.createLayer('Ground', tileset, 0, 0, true);  // last arg: gpu = true
```

**Capabilities:**
- Single tileset with single texture image
- Maximum 4096x4096 tiles, up to 2^23 unique tile IDs
- Tile flipping and animation supported
- Orthographic tilemaps only (no isometric/hexagonal)
- Perfect texture filtering in LINEAR mode (no tile seams)
- Cost is per-pixel, not per-tile -- no performance loss with many visible tiles

**Restrictions:**
- Cannot use multiple tilesets
- Editing requires manual `generateLayerDataTexture()` call to update
- Orthographic only

**Internal data**: Tile data stored in a texture (4 bytes/tile: 2 flip bits, 1 animation bit, 1 unused, 28-bit tile index). Animation data in a separate texture.

**Source**: `src/tilemaps/TilemapGPULayer.js`

---

## New Tint Modes

v3 had two tint modes set implicitly via `setTint()` (multiply) and `setTintFill()` (fill). v4 separates tint color from tint mode and adds new modes.

```js
// v3 approach:
sprite.setTint(0xff0000);      // multiply mode implicit
sprite.setTintFill(0xff0000);  // fill mode implicit

// v4 approach:
sprite.setTint(0xff0000);                            // sets color only
sprite.setTintMode(Phaser.TintModes.FILL);           // sets mode separately
sprite.setTintFill(0xff0000);                        // still works (sets color, does NOT change mode)
```

**Available modes** (`Phaser.TintModes`):

| Mode | Value | Effect |
|---|---|---|
| `MULTIPLY` | 0 | Default. Tint multiplied with texture color |
| `FILL` | 1 | Tint replaces texture color (respects alpha). Flash-white effect |
| `ADD` | 2 | Tint added to texture color (respects alpha) |
| `SCREEN` | 4 | Brightens dark areas of the texture |
| `OVERLAY` | 5 | Brightens lights, darkens darks |
| `HARD_LIGHT` | 6 | Like overlay with tint/texture swapped |

**Source**: `src/renderer/TintModes.js`

---

## Migration Guide: v3 to v4

### Pipelines to RenderNodes

```js
// v3:
sprite.setPipeline('TextureTintPipeline');
// Custom pipeline:
this.renderer.pipelines.add('MyPipeline', new MyPipeline(this.game));
sprite.setPipeline('MyPipeline');

// v4:
// Default rendering is automatic via RenderNodes -- no pipeline assignment needed.
// For custom rendering:
renderer.renderNodes.addNodeConstructor('MyNode', MyNodeClass);
sprite.setRenderNodeRole('Submitter', 'MyNode');
```

### FX / Masks to Filters

```js
// v3 FX:
sprite.preFX.addGlow();
sprite.postFX.addBlur();
camera.setPostPipeline(BloomPostFX);

// v4 Filters:
sprite.enableFilters();
sprite.filters.internal.addGlow(0xffffff, 4, 0, 1);
sprite.filters.external.addBlur(0, 2, 2, 1);
// Cameras have filters enabled by default:
camera.filters.internal.addBlur(0, 2, 2, 1);

// v3 BitmapMask:
const mask = new Phaser.Display.Masks.BitmapMask(scene, maskObj);
sprite.setMask(mask);

// v4 FilterMask:
sprite.enableFilters();
sprite.filters.internal.addMask(maskObj);
```

### Lighting

```js
// v3:
sprite.setPipeline('Light2D');

// v4:
sprite.setLighting(true);
// Optionally enable self-shadowing:
sprite.setSelfShadow(true);
```

### Tint

```js
// v3: setTintFill changed the mode implicitly
sprite.setTintFill(0xff0000);

// v4: mode and color are separate
sprite.setTint(0xff0000);
sprite.setTintMode(Phaser.TintModes.FILL);
// setTintFill() still sets color but does NOT switch mode in v4
```

### Shader GameObjects

```js
// v3:
const shader = this.add.shader('MyShader', 400, 300, 200, 200);

// v4: uses ShaderQuadConfig object
const shader = this.add.shader({
    name: 'MyShader',
    fragmentSource: fragCode,
    // vertexSource, shaderAdditions, setupUniforms, etc.
}, 400, 300, 200, 200);
// Note: Y=0 is now at bottom of texture (GL convention)
// Shadertoy-style uniforms no longer auto-set
```

### GL Orientation

v4 uses standard GL orientation where Y=0 is at the bottom of textures. This is mostly invisible to users, but:
- Custom shader code may need Y-axis adjustments
- Compressed textures must be encoded with Y-axis pointing "up" (use "flip Y" in compression tools)

### ColorMatrix Filter

```js
// v3:
sprite.postFX.addColorMatrix().sepia();

// v4:
sprite.enableFilters();
const cm = sprite.filters.internal.addColorMatrix();
cm.colorMatrix.sepia();  // note: methods moved to .colorMatrix property
```

### DynamicTexture

```js
// v4 requires explicit render() call:
const dt = this.textures.addDynamicTexture('myDT', 256, 256);
dt.draw(sprite);
dt.render();  // MUST call to execute buffered commands

// New methods:
dt.capture(gameObject, config);  // capture camera view of object
dt.preserve();                    // keep commands for re-rendering
dt.callback(fn);                  // insert callback in command buffer
```

---

## Source File Map

| Feature | Path |
|---|---|
| CaptureFrame | `src/gameobjects/captureframe/CaptureFrame.js` |
| Gradient | `src/gameobjects/gradient/Gradient.js` |
| Noise (white) | `src/gameobjects/noise/Noise.js` |
| NoiseCell2D/3D/4D | `src/gameobjects/noise/noisecell{2,3,4}d/` |
| NoiseSimplex2D/3D | `src/gameobjects/noise/noisesimplex{2,3}d/` |
| SpriteGPULayer | `src/gameobjects/spritegpulayer/SpriteGPULayer.js` |
| TilemapGPULayer | `src/tilemaps/TilemapGPULayer.js` |
| Lighting component | `src/gameobjects/components/Lighting.js` |
| RenderSteps component | `src/gameobjects/components/RenderSteps.js` |
| RenderNodes component | `src/gameobjects/components/RenderNodes.js` |
| Tint component | `src/gameobjects/components/Tint.js` |
| TintModes | `src/renderer/TintModes.js` |
| RenderNode base class | `src/renderer/webgl/renderNodes/RenderNode.js` |
| RenderNodeManager | `src/renderer/webgl/renderNodes/RenderNodeManager.js` |
| Filter render nodes | `src/renderer/webgl/renderNodes/filters/` |
| Submitter nodes | `src/renderer/webgl/renderNodes/submitter/` |
| Transformer nodes | `src/renderer/webgl/renderNodes/transformer/` |
| Texturer nodes | `src/renderer/webgl/renderNodes/texturer/` |
| Batch handlers | `src/renderer/webgl/renderNodes/BatchHandler*.js` |
| Rendering concepts doc | `docs/Phaser 4 Rendering Concepts/` |

---

**Related skills**: `filters-and-postfx.md`, `game-object-components.md`, `tilemaps.md`
