# Phaser v3 to v4 Migration Guide

This guide covers everything you need to change when upgrading a Phaser v3 project to Phaser v4. It is organized from highest-impact changes to smaller details, so you can work through it top-to-bottom.

---

## Table of Contents

1. [Renderer](#1-renderer)
2. [Tint System](#2-tint-system)
3. [Camera System](#3-camera-system)
4. [Texture Coordinates](#4-texture-coordinates)
5. [DynamicTexture and RenderTexture](#5-dynamictexture-and-rendertexture)
6. [Geometry: Point Replaced by Vector2](#6-geometry-point-replaced-by-vector2)
7. [Math Constants](#7-math-constants)
8. [Data Structures](#8-data-structures)
9. [Round Pixels](#9-round-pixels)
10. [Filters (replacing Pipeline Effects)](#10-filters)
11. [TileSprite](#11-tilesprite)
12. [Removed Plugins and Entry Points](#12-removed-plugins-and-entry-points)
13. [Removed Utilities and Polyfills](#13-removed-utilities-and-polyfills)
14. [Spine Plugins](#14-spine-plugins)
15. [Miscellaneous Breaking Changes](#15-miscellaneous-breaking-changes)

---

## 1. Renderer

Phaser v4 contains a brand-new, highly efficient WebGL renderer. The entire rendering pipeline from v3 has been replaced. This is the single biggest change in v4.

**What this means for you:**

- If your game only uses the standard Phaser API (Sprites, Text, Tilemaps, etc.), the new renderer should work transparently. Most rendering differences have been resolved during the beta/RC cycle.
- If you wrote **custom WebGL pipelines** in v3, these will need to be rewritten. v4 uses a render node architecture instead of pipelines. Look into `RenderConfig#renderNodes` to register custom render nodes at boot.
- If you accessed `WebGLRenderer` internals directly, be aware that many internal properties have been removed or restructured:
  - `WebGLRenderer.textureIndexes` is removed. Use `glTextureUnits.unitIndices` instead.
  - `WebGLRenderer#genericVertexBuffer` and `#genericVertexData` are removed. `BatchHandler` render nodes now create their own WebGL data buffers.
  - `WebGLAttribLocationWrapper` is removed.
- WebGL2 canvases are now compatible with the WebGL renderer.

---

## 2. Tint System

The tint system has been overhauled with a new API and additional blend modes.

**Removed:**
- `tintFill` property
- `setTintFill()` method

**Replacement:**
- Use the new `tintMode` property or `setTintMode()` method to control tint blending.
- `Phaser.TintModes` enumerates the available modes: `MULTIPLY`, `FILL`, `ADD`, `SCREEN`, `OVERLAY`, `HARD_LIGHT`.

**How to convert your code:**

```js
// v3
sprite.setTintFill(0xff0000);

// v4
sprite.setTint(0xff0000).setTintMode(Phaser.TintModes.FILL);
```

**Other tint changes:**
- `tint` and `setTint()` now purely affect color settings. In v3, calling these would silently deactivate fill mode.
- FILL mode now treats partial alpha correctly.
- BitmapText tinting now works correctly.

---

## 3. Camera System

The camera matrix system has been rewritten. If you only use standard camera properties (`scrollX`, `scrollY`, `zoom`, `rotation`), your code should work without changes. However, if you access camera matrices directly, you must update your code.

**What changed:**

| v3 | v4 |
|---|---|
| `Camera#matrix` = position + rotation + zoom | `Camera#matrix` = rotation + zoom + scroll (no position) |
| Scroll appended separately | Scroll is part of `Camera#matrix` |
| No equivalent | `Camera#matrixExternal` = position only |
| No equivalent | `Camera#matrixCombined` = `matrix` * `matrixExternal` |

**If you manipulated scroll factors manually:**

```js
// v3
spriteMatrix.e -= camera.scrollX * src.scrollFactorX;

// v4
TransformMatrix.copyWithScrollFactorFrom(matrix, scrollX, scrollY, scrollFactorX, scrollFactorY);
```

**Other camera changes:**
- `GetCalcMatrix()` now takes an additional `ignoreCameraPosition` parameter.
- `GetCalcMatrixResults` now includes a `matrixExternal` property.

---

## 4. Texture Coordinates

Texture coordinates now match WebGL standards (Y axis starts at the bottom and increases upwards).

**Action required:**
- If you use **compressed textures**, they must be re-compressed with the Y axis starting at the bottom and increasing upwards.
- Standard image textures (PNG, JPG, etc.) are handled automatically -- no action needed.

---

## 5. DynamicTexture and RenderTexture

**Breaking change:** `DynamicTexture` and `RenderTexture` must now call `render()` to actually draw. Previously, draw commands were executed immediately.

**New capabilities:**
- `DynamicTexture#preserve()` keeps the command buffer for reuse after rendering.
- `DynamicTexture#callback()` runs callbacks during command buffer execution.
- `DynamicTexture#capture` renders game objects more accurately than `draw`.
- `RenderTexture.setRenderMode()` enables automatic re-rendering during the render loop.
- `TextureManager#addDynamicTexture` now has a `forceEven` parameter.

---

## 6. Geometry: Point Replaced by Vector2

The `Geom.Point` class and all related functions have been removed. Use `Vector2` instead.

**Quick reference for method replacements:**

| v3 (`Point`) | v4 (`Vector2` / `Math`) |
|---|---|
| `Point.Ceil` | `Vector2.ceil` |
| `Point.Floor` | `Vector2.floor` |
| `Point.Clone` | `Vector2.clone` |
| `Point.CopyFrom(src, dest)` | `dest.copy(src)` |
| `Point.Equals` | `Vector2.equals` |
| `Point.GetCentroid` | `Math.GetCentroid` |
| `Point.GetMagnitude` | `Vector2.length` |
| `Point.GetMagnitudeSq` | `Vector2.lengthSq` |
| `Point.Invert` | `Vector2.invert` |
| `Point.Negative` | `Vector2.negate` |
| `Point.SetMagnitude` | `Vector2.setLength` |
| `Point.Project` | `Vector2.project` |
| `Point.ProjectUnit` | `Vector2.projectUnit` |
| `Point.Interpolate` | `Math.LinearXY` |
| `Point.GetRectangleFromPoints` | `Math.GetVec2Bounds` |

**All geometry classes now return Vector2 instead of Point:**

The following classes and their static helper functions (`getPoint`, `getPoints`, `getRandomPoint`, `CircumferencePoint`, `Random`, etc.) all return `Vector2` instances:

- `Geom.Circle`
- `Geom.Ellipse`
- `Geom.Line`
- `Geom.Polygon`
- `Geom.Rectangle`
- `Geom.Triangle`

If you have code that checks `instanceof Phaser.Geom.Point`, update it to check for `Phaser.Math.Vector2`.

---

## 7. Math Constants

| v3 | v4 | Notes |
|---|---|---|
| `Math.TAU` (was PI / 2) | `Math.TAU` (now PI * 2) | **Value changed!** This is now the correct mathematical tau. |
| `Math.PI2` | Removed | Use `Math.TAU` instead. |
| No equivalent | `Math.PI_OVER_2` | New constant for PI / 2 (what v3's `TAU` incorrectly was). |

**Action required:** If you used `Math.TAU` in v3 expecting PI / 2, replace it with `Math.PI_OVER_2`. If you used `Math.PI2`, replace it with `Math.TAU`.

---

## 8. Data Structures

**`Phaser.Struct.Set`** has been replaced with a native JavaScript `Set`. Methods like `iterateLocal` are gone. Use standard `Set` methods (`forEach`, `has`, `add`, `delete`, etc.).

**`Phaser.Struct.Map`** has been replaced with a native JavaScript `Map`. Methods like `contains` and `setAll` are gone. Use standard `Map` methods (`has`, `get`, `set`, `delete`, etc.).

---

## 9. Round Pixels

The `roundPixels` game config option now defaults to `false` (it was `true` in v3). The behavior has also been refined:

- `roundPixels` only operates when objects are axis-aligned and unscaled, preventing flicker on transforming objects.
- For per-object control, use the new `GameObject#vertexRoundMode` property:
  - `"off"` -- Never round.
  - `"safe"` -- Round only when the transform is position-only (no scale/rotation).
  - `"safeAuto"` (default) -- Like `"safe"`, but only when the camera has `roundPixels` enabled.
  - `"full"` -- Always round (can cause wobble on rotated sprites, PS1-style).
  - `"fullAuto"` -- Like `"full"`, but only when the camera has `roundPixels` enabled.
- The `TransformMatrix#setQuad` `roundPixels` parameter has been removed.

---

## 10. Filters

v4 introduces a Filter system. Filters in v4 apply to `Layer` objects as well as individual Game Objects and Cameras.

**New filter types available:** Blocky, CombineColorMatrix, GradientMap, Key, ImageLight, PanoramaBlur, NormalTools, Quantize, Vignette, and Wipe (the latter two return from v3).

**Chainable setter methods:** `setFiltersAutoFocus`, `setFiltersFocusContext`, `setFiltersForceComposite`, `setRenderFilters`.

**Mask filter:** Now uses the current camera by default and supports a `scaleFactor` parameter for memory savings in large games.

---

## 11. TileSprite

- `TileSprite` no longer supports texture cropping.
- `TileSprite` now assigns default dimensions to each dimension separately.

---

## 12. Removed Plugins and Entry Points

The following have been completely removed:

- **Camera3D Plugin**
- **Layer3D Plugin**
- **Facebook Plugin** detection constants
- **`phaser-ie9.js`** entry point (IE9 is no longer supported)

---

## 13. Removed Utilities and Polyfills

**`Create.GenerateTexture`** and all Create Palettes / the `create` folder have been removed. `TextureManager.generate` is also removed as a result.

**`Math.SinCosTableGenerator`** has been removed.

**All legacy polyfills removed:**
- `Array.forEach`
- `Array.isArray`
- `AudioContextMonkeyPatch`
- `console`
- `Math.trunc`
- `performance.now`
- `requestAnimationFrame`
- `Uint32Array`

Modern browsers provide all of these natively.

---

## 14. Spine Plugins

The Spine 3 and Spine 4 plugins bundled with Phaser are no longer updated. Use the official Phaser Spine plugin created by Esoteric Software instead.

---

## 15. Miscellaneous Breaking Changes

- **`Shader#setTextures()`** now replaces the texture array rather than adding to it. If you were calling it multiple times to build up textures, call it once with the full array.
- **`DOMElement`** now throws an error if it has no container. Ensure your DOM elements have a parent container.
- **`GameObject#enableLighting`** can now be set even if the scene light manager is not enabled. The manager must still be enabled for lights to render, but the flag itself is no longer gated.
- **Gamepad `Button` class** now accepts an `isPressed` parameter to initialize state correctly across scene transitions.
- **`BatchHandlerConfig#createOwnVertexBuffer`** type property has been removed.
- **`WebGLRenderer#genericVertexBuffer`** and **`#genericVertexData`** have been removed (freeing ~16MB RAM/VRAM).

---

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] Update `npm install phaser@4` (or equivalent)
- [ ] Replace any `setTintFill()` calls with `setTint().setTintMode(Phaser.TintModes.FILL)`
- [ ] Replace `Geom.Point` usage with `Vector2`
- [ ] Update `Math.TAU` usage (now equals PI * 2, not PI / 2)
- [ ] Replace `Math.PI2` with `Math.TAU`
- [ ] Replace `Phaser.Struct.Set` with native `Set`
- [ ] Replace `Phaser.Struct.Map` with native `Map`
- [ ] Add `render()` calls to `DynamicTexture` / `RenderTexture` usage
- [ ] Re-compress any compressed textures for new Y-axis orientation
- [ ] Update any direct `Camera#matrix` access to use the new matrix system
- [ ] Remove any `TileSprite` texture cropping code
- [ ] Update custom WebGL pipeline code to use the new render node system
- [ ] Replace any Phaser-bundled Spine plugin usage with the official Esoteric Software plugin
- [ ] Remove any reliance on `Create.GenerateTexture` or `TextureManager.generate`
- [ ] Test `roundPixels` behavior (now defaults to `false`)
- [ ] Remove any usage of removed polyfills, plugins, or entry points
