# Phaser 4.0.0 Changelog

Phaser v4 contains a brand-new, highly efficient WebGL renderer. The entire rendering pipeline from Phaser v3 has been replaced. Alongside the new renderer, v4 brings a wealth of new game objects, a powerful filter system, a rewritten camera system, an overhauled tint API, and hundreds of fixes and improvements.

For a step-by-step guide on updating your v3 project, see the [Migration Guide](MIGRATION-GUIDE.md).

---

## Table of Contents

1. [Breaking Changes and Removals](#breaking-changes-and-removals)
    - [Renderer](#renderer)
    - [Tint System](#tint-system)
    - [Camera System](#camera-system)
    - [Texture Coordinates](#texture-coordinates)
    - [DynamicTexture and RenderTexture](#dynamictexture-and-rendertexture)
    - [Geometry: Point Replaced by Vector2](#geometry-point-replaced-by-vector2)
    - [Math Constants](#math-constants)
    - [Data Structures](#data-structures)
    - [TileSprite](#tilesprite)
    - [Removed Plugins, Entry Points and Polyfills](#removed-plugins-entry-points-and-polyfills)
    - [Other Breaking Changes](#other-breaking-changes)
2. [New Features](#new-features)
    - [New Game Objects](#new-game-objects)
    - [New Filters](#new-filters)
    - [New Actions](#new-actions)
    - [Rendering and Shaders](#rendering-and-shaders)
    - [Display and Color](#display-and-color)
    - [Math](#math)
    - [Textures](#textures)
    - [SpriteGPULayer](#spritegpulayer)
    - [DynamicTexture and RenderTexture Features](#dynamictexture-and-rendertexture-features)
    - [Tilemaps](#tilemaps)
    - [Phaser v3 Enhancements Merged](#phaser-v3-enhancements-merged)
    - [Other New Features](#other-new-features)
3. [Updates and Improvements](#updates-and-improvements)
    - [Rendering and Performance](#rendering-and-performance)
    - [Round Pixels](#round-pixels)
    - [Filters](#filters)
    - [Camera](#camera)
    - [Input](#input)
    - [Other Updates](#other-updates)
4. [Bug Fixes](#bug-fixes)
    - [Rendering and Filters](#rendering-and-filters)
    - [Camera](#camera-fixes)
    - [Physics](#physics)
    - [Tilemaps](#tilemap-fixes)
    - [DynamicTexture and RenderTexture](#dynamictexture-and-rendertexture-fixes)
    - [Game Objects](#game-object-fixes)
    - [Textures](#texture-fixes)
    - [SpriteGPULayer](#spritegpulayer-fixes)
    - [Input](#input-fixes)
    - [Loader and Audio](#loader-and-audio)
    - [Tweens and Timeline](#tweens-and-timeline)
    - [Other Fixes](#other-fixes)
5. [Documentation and TypeScript](#documentation-and-typescript)
6. [Thanks](#thanks)

---

## Breaking Changes and Removals

### Renderer

The entire WebGL renderer from Phaser v3 has been replaced with a new render node architecture. If your game only uses the standard Phaser API, the new renderer should work transparently. If you wrote custom WebGL pipelines, they will need to be rewritten using the new render node system.

- Remove `WebGLAttribLocationWrapper` as it is unused.
- Remove `WebGLRenderer.textureIndexes` as `glTextureUnits.unitIndices` now fills this role.
- Remove dead code and unused/unconnected properties from `WebGLRenderer`.
- `WebGLRenderer#genericVertexBuffer` and `#genericVertexData` removed.
  - This frees 16MB of RAM and VRAM.
- `BatchHandlerConfig#createOwnVertexBuffer` type property removed.
- Remove references to Mesh.

### Tint System

The tint API has been overhauled with a new mode-based system and additional blend modes.

- `Tint` is overhauled.
  - `tint` and `setTint()` now purely affect the color settings.
    - Previously, both would silently deactivate fill mode.
  - `tintFill` and `setTintFill()` are removed.
  - New property `tintMode` and new method `setTintMode()` now set the tint fill mode.
  - `Phaser.TintModes` enumerates valid tint modes.
    - `MULTIPLY`
    - `FILL`
    - `ADD`
    - `SCREEN`
    - `OVERLAY`
    - `HARD_LIGHT`
  - FILL mode now treats partial alpha correctly.
  - BitmapText tinting now works correctly.
  - Conversion tip: `foo.setTintFill(color)` becomes `foo.setTint(color).setTintMode(Phaser.TintModes.FILL)`.

### Camera System

The camera matrix system has been rewritten. If you only use standard camera properties (`scrollX`, `scrollY`, `zoom`, `rotation`), your code should work without changes. If you access camera matrices directly, you must update your code.

- `Camera#matrix` now includes scroll, and excludes position.
- `Camera#matrixExternal` is a new matrix, which includes the position.
- `Camera#matrixCombined` is the multiplication of `matrix` and `matrixExternal`. This is sometimes relevant.
- The `GetCalcMatrix(src, camera, parentMatrix, ignoreCameraPosition)` method now takes `ignoreCameraPosition`, causing its return value to use the identity matrix instead of the camera's position.
- `GetCalcMatrixResults` now includes a `matrixExternal` property, and factors scroll into the `camera` and `calc` matrices.
- To get a copy of a matrix with scroll factor applied, use `TransformMatrix#copyWithScrollFactorFrom(matrix, scrollX, scrollY, scrollFactorX, scrollFactorY)`. This generally replaces cases where phrases such as `spriteMatrix.e -= camera.scrollX * src.scrollFactorX` were used.

### Texture Coordinates

Texture coordinates now match WebGL standards. This should bring greater compatibility with other technologies. Note that compressed textures must be re-compressed to work with this system: ensure that the Y axis starts at the bottom and increases upwards.

### DynamicTexture and RenderTexture

- `DynamicTexture` and `RenderTexture` must call `render()` to actually draw.

### Geometry: Point Replaced by Vector2

The `Geom.Point` class and all related functions have been removed. All functionality can be found in the existing `Vector2` math classes. All Geometry classes that previously created and returned `Point` objects now return `Vector2` objects instead.

**Method mapping:**

| Removed | Replacement |
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

**New Vector2 and Math methods:**

* `Vector2.ceil` is a new method that will apply Math.ceil to the x and y components of the vector. Use as a replacement for `Geom.Point.Ceil`.
* `Vector2.floor` is a new method that will apply Math.floor to the x and y components of the vector. Use as a replacement for `Geom.Point.Floor`.
* `Vector2.invert` is a new method that will swap the x and y components of the vector. Use as a replacement for `Geom.Point.Invert`.
* `Vector2.projectUnit` is a new method that will calculate the vector projection onto a non-zero target vector. Use as a replacement for `Geom.Point.ProjectUnit`.
* `Math.GetCentroid` is a new function that will get the centroid, or geometric center, of a plane figure from an array of Vector2 like objects. Use as a replacement for `Geom.Point.GetCentroid`.
* `Math.GetVec2Bounds` is a new function that will get the AABB bounds as a Geom.Rectangle from an array of Vector2 objects. Use as a replacement for `Geom.Point.GetRectangleFromPoints`.

**Geometry classes updated to return Vector2:**

* `Geom.Circle.getPoint`, `getPoints` and `getRandomPoint` now all return Vector2 objects instead of Point.
* The functions `Geom.Circle.CircumferencePoint`, `Circle.CircumferencePoint`, `Circle.GetPoint`, `Circle.GetPoints`, `Circle.OffsetPoint` and `Circle.Random` all now take and in some cases return Vector2 instances instead of Point objects.
* `Geom.Ellipse.getPoint`, `getPoints` and `getRandomPoint` now all return Vector2 objects instead of Point.
* The functions `Geom.Ellipse.CircumferencePoint`, `Ellipse.CircumferencePoint`, `Ellipse.GetPoint`, `Ellipse.GetPoints`, `Ellipse.OffsetPoint` and `Ellipse.Random` all now take and in some cases return Vector2 instances instead of Point objects.
* `Geom.Line.getPoint`, `getPoints` and `getRandomPoint` now all return Vector2 objects instead of Point.
* The functions `Geom.Line.GetEasedPoint`, `Line.GetMidPoint`, `Line.GetNearestPoint`, `Line.GetNormal`, `Line.GetPoint`, `Line.GetPoints`, `Line.Random` and `Line.RotateAroundPoint` all now take and in some cases return Vector2 instances instead of Point objects.
* The `Geom.Polygon.getPoints` method now returns Vector2 objects instead of Point.
* The functions `Geom.Polygon.ContainsPoint` and `Polygon.GetPoints` all now take and in some cases return Vector2 instances instead of Point objects.
* `Geom.Rectangle.getPoint`, `getPoints` and `getRandomPoint` now all return Vector2 objects instead of Point.
* The functions `Geom.Rectangle.ContainsPoint`, `Rectangle.GetCenter`, `Rectangle.GetPoint`, `Rectangle.GetPoints`, `Rectangle.GetSize`, `Rectangle.MarchingAnts`, `Rectangle.MergePoints`, `Rectangle.OffsetPoint`, `Rectangle.PerimeterPoint`, `Rectangle.Random` and `Rectangle.RandomOutside` all now take and in some cases return Vector2 instances instead of Point objects.
* `Geom.Triangle.getPoint`, `getPoints` and `getRandomPoint` now all return Vector2 objects instead of Point.
* The functions `Geom.Triangle.Centroid`, `Triangle.CircumCenter`, `Triangle.ContainsArray`, `Triangle.ContainsPoint`, `Triangle.GetPoint`, `Triangle.GetPoints`, `Triangle.InCenter`, `Triangle.Random` and `Triangle.RotateAroundPoint` all now take and in some cases return Vector2 instances instead of Point objects.

### Math Constants

* `Math.TAU` is now actually the value of tau! (i.e. PI * 2) instead of being PI / 2.
* `Math.PI2` has been removed. You can use `Math.TAU` instead. All internal use of PI2 has been replaced with TAU.
* `Math.PI_OVER_2` is a new constant for PI / 2 and all internal use of TAU has been updated to this new constant.

### Data Structures

- `Phaser.Struct.Set` has been replaced with a native JavaScript `Set`. Methods like `iterateLocal` are gone. Use standard `Set` methods instead.
- `Phaser.Struct.Map` has been replaced with a native JavaScript `Map`. Methods like `contains` and `setAll` are gone. Use standard `Map` methods instead.

### TileSprite

- `TileSprite` no longer supports texture cropping.
- TileSprite now assigns default dimensions to each dimension separately.

### Removed Plugins, Entry Points and Polyfills

The following have been removed entirely:

- The `phaser-ie9.js` entry point.
- The Camera3D Plugin.
- The Layer3D Plugin.
- The Facebook Plugin detection constants.
- The `Create.GenerateTexture` function and all Create Palettes and the `create` folder.
- `TextureManager.generate` (as a result of the GenerateTexture removal).
- `Math.SinCosTableGenerator`.
- The following polyfills: Array.forEach, Array.isArray, AudioContextMonkeyPatch, console, Math.trunc, performance.now, requestAnimationFrame and Uint32Array.

### Other Breaking Changes

- `Shader#setTextures()` now replaces the texture array, rather than adding to it.
- Eliminate rounding in `Camera#preRender()`.
- Remove `TransformMatrix#setQuad` parameter `roundPixels`, as it is no longer used.
- Remove unnecessary transform related to camera scroll.

---

## New Features

### New Game Objects

- `GameObjects.Gradient` is a new game object which renders gradients.
  - Gradient shapes include:
    - `LINEAR`
    - `BILINEAR`
    - `RADIAL`
    - `CONIC_SYMMETRIC`
    - `CONIC_ASYMMETRIC`
  - Gradient repeat modes include:
    - `EXTEND`: flat colors extend from start and end.
    - `TRUNCATE`: transparency extends from start and end.
    - `SAWTOOTH`: gradient starts over every time it completes.
    - `TRIANGULAR`: gradient reverses direction every time it gets to the end or start.
  - Optional Interleaved Gradient Noise based dithering to eliminate banding.
- `GameObjects.Noise` renders noise patterns.
  - Control value power curve.
  - Select from trigonometric or PCG algorithms.
  - Output grayscale, random color, or random normals.
- Cellular noise objects: `GameObjects.NoiseCell2D`, `NoiseCell3D` and `NoiseCell4D` provide cellular/Worley/Voronoi noise.
  - Render cellular noise with sharp or smooth edges, or random flat colors.
  - Smoothly animate scroll through the XY plane or evolve the pattern through Z or ZW axes.
  - Add octaves of detail.
  - Supports rendering as a texture or normal map for use in other effects.
- Simplex noise objects: `GameObjects.NoiseSimplex2D` and `NoiseSimplex3D` provide simplex noise.
  - Render simplex noise, the successor to Perlin Noise.
  - Use gradient flow to smoothly loop noise animation.
  - Add octaves of detail.
  - Apply turbulence and output shaping for a variety of effects.
  - Supports rendering as a texture or normal map for use in other effects.
- `GameObjects.NineSlice` has two new parameters: `tileX`, `tileY`, which allow non-corner regions of the NineSlice to tile instead of stretch. Some stretching is still applied to keep the tile count a whole number. Thanks to @skhoroshavin for this contribution!
- Add SpriteGPULayer game object.
- Add `CaptureFrame` game object, which copies the current framebuffer to a texture when it renders. This is useful for applying post-processing prior to post.
- `GameObject#isDestroyed` flag helps you avoid errors when accessing an object that might have removed expected properties during destruction.

### New Filters

- `Blocky` filter added. This is similar to Pixelate, but it picks just a single color from the image, preserving the palette of pixel art. You can also configure the pixel width and height, and offset. This is a good option for pixelating a retro game at high resolution, setting up for additional filters such as CRT emulation.
- `CombineColorMatrix` filter for remixing alpha and other channels between images.
- `GradientMap` filter for recoloring images using a gradient and their own brightness.
- `Key` filter for removing or isolating colors.
- `ImageLight` filter for image-based lighting, a soft, highly realistic form of illumination.
- `PanoramaBlur` filter for adjusting images for `ImageLight`.
- `NormalTools` filter for manipulating normal maps.
- `Quantize` filter for reducing colors and dithering.
- `Vignette` filter returns from Phaser 3.
  - Now sets a configurable border color instead of erasing alpha.
  - Also supports limited blend modes.
- `Wipe` filter returns from Phaser 3.
  - Now allows you to set the texture displayed in wiped-away regions.
  - Now provides helper functions to set directional reveal/wipe effects.
- Add Filter support to `Layer`.
- `Mask` filter now supports `scaleFactor` parameter, allowing the creation of scaled-down framebuffers. This can save memory in large games, but you must manage scaling logic yourself. Thanks to kimdanielarthur-cowlabs for developing the initial solution.
- Add chainable setter methods to `Filter` component: `setFiltersAutoFocus`, `setFiltersFocusContext`, `setFiltersForceComposite`, `setRenderFilters`.

### New Actions

- `Actions.AddEffectBloom` allows you to quickly set up a bloom effect, using several filters, on a target Camera or GameObject.
- `Actions.AddEffectShine` allows you to quickly set up a shine effect, using a new Gradient and filters, on a target Camera or GameObject.
- `Actions.AddMaskShape` allows you to quickly add shapes to a target Camera or GameObject as Masks. Blurred edges and inversion are supported.
- `Actions.FitToRegion` transforms an object to fit a region, such as the screen.

### Rendering and Shaders

- `WebGLSnapshot` (used in snapshot functions) supports unpremultiplication, which is on by default. This removes dark fringes on text and objects with alpha.
- `RenderConfig#renderNodes` allows you to add render nodes at game boot.
- `ShaderQuadConfig#initialUniforms` lets you initialize a Shader with uniforms on creation.
- `Shader#setUniform(name, value)` lets you set shader program uniforms just once, instead of putting them all into the `setupUniforms()` method, where some uniforms might be set redundantly after init. This wraps `Shader#renderNode.programManager.setUniform`.
- `BatchHandlerQuadSingle` render node added.
  - This is just a copy of `BatchHandlerQuad` with space for 1 quad.
  - The rendering system uses this node internally for transferring images in some steps of the filter process.
- `Camera` has the new property `isObjectInversion`, used internally to support special transforms for filters.
- `Shader` has the new method `renderImmediate`, which makes it straightforward to use `renderToTexture` when the object is not part of a display list, or otherwise needs updating outside the regular render loop.
- Extend `RenderWebGLStep` to take the currently rendering object list and index as parameters. This allows render methods to know their context in the display list, which can be useful for optimizing third-party renderers.
  - This takes the place of `nextTypeMatch` from Phaser v3, but is much more flexible.
- `GameObject#vertexRoundMode` added to control vertex pixel rounding on a per-object basis.
  - Options include:
    - `"off"`: Never round vertex positions.
    - `"safe"`: Round vertex positions if the object is "safe": it is rendering with a transform matrix which only affects the position, not other properties such as scale or rotation.
    - `"safeAuto"` (default): Like "safe", but only if rendering through a camera where `roundPixels` is enabled.
    - `"full"`: Always round vertex positions. This can cause sprites to wobble if their vertices are not safely aligned with the pixel resolution, e.g. during rotations. This is good for a touch of PlayStation 1 style jank.
    - `"fullAuto"`: Like "full", but only if rendering through a camera where `roundPixels` is enabled.
  - `GameObject#willRoundVertices(camera, onlyTranslated)` returns whether vertices should be rounded. In the unlikely event that you need to control vertex rounding even more precisely, you are intended to override this method.

### Display and Color

- `Display.Color`: several helper methods now support modifying an existing `Color` object instead of creating a new one.
  - `HSLToColor`
  - `HexStringToColor`
  - `IntegerToColor`
  - `ObjectToColor`
  - `RGBStringToColor`
  - `ValueToColor`
- `Display.Color.Interpolate`: an extra interpolation mode is available.
  - `HSVWithHSV`: new method to interpolate HSV values, in HSV space.
  - `ColorWithColor` has new parameters to allow it to operate in HSV space.
    - `hsv` flag sets it to operate in HSV space.
    - `hsvSign` flag can force it to interpolate hue either ascending or descending. Default behavior picks the shortest angle.
- `Display.ColorBand` describes a transition between two colors. Intended for use in gradients.
- `Display.ColorRamp` describes a range of colors using ColorBands. Intended for use in gradients.

### Math

- `Math.Hash` provides fast hashes of 1, 2, 3, or 4 dimensional input, using trigonometric or PCG methods.
- `Math.HashCell` provides hashes of 1, 2, 3, or 4 dimensional input, using hash results in a Worley noise field. This produces a continuous but lumpy field.
- `Math.HashSimplex` provides hashes of 1, 2, or 3 dimensional input, using a simplex noise implementation. This produces a continuous, smooth field.

### Textures

- `Texture#setWrap()` provides easy access to texture wrap mode in WebGL, which would otherwise be very technical to alter on `WebGLTextureWrapper` objects. This is probably of most use to shader authors. Thanks @Legend-Master for raising an issue where power-of-two sprites had unexpected wrapping artifacts.
- `Phaser.Textures.WrapMode.CLAMP_TO_EDGE` is always available.
- `Phaser.Textures.WrapMode.REPEAT` will only be applied to textures with width and height equal to powers of 2.
- `Phaser.Textures.WrapMode.MIRRORED_REPEAT` likewise requires powers of 2.
- `Texture#setSource` method for updating the source of a texture. Note that, while the source will update, derived values such as object sizes will not. It's advisable to switch between textures of identical size to avoid unexpected transforms.
- `Texture#setDataSource` method already existed, but has been changed to be more useful like `setSource`.
- `TextureManager#addFlatColor` method for creating a flat texture with custom color, alpha, width, and height. This is intended to act as a temporary stand-in for textures you might not have loaded yet.
- `TextureSource#updateSource` method for switching sources directly.
- New `Phaser.Types.Textures.TextureSource` and `Phaser.Types.Textures.TextureSourceElement` types to simplify the increasing number of sources for a texture.

### SpriteGPULayer

SpriteGPULayer is an advanced renderer designed to handle millions of background objects.

- Add documentation explaining how to modify a `SpriteGPULayer` efficiently.
- Add `SpriteGPULayer#insertMembers` method.
- Add `SpriteGPULayer#insertMembersData` method.
- Add `SpriteGPULayer#getDataByteSize` method.
- Add non-looping animations to `SpriteGPULayer` (set animation to `loop: false`) to support one-time particle effects and dynamic sources.
- Add creation time to `SpriteGPULayer` members.

### DynamicTexture and RenderTexture Features

- Allow `RenderTexture` to automatically re-render.
  - `DynamicTexture#preserve()` allows you to keep the command buffer for reuse after rendering.
  - `DynamicTexture#callback()` allows you to run callbacks during command buffer execution.
  - `RenderTexture.setRenderMode()` allows you to set the RenderTexture to automatically re-render during the render loop.
- Add `DynamicTexture#capture`, for rendering game objects more accurately and with greater control than `draw`.
- `TextureManager#addDynamicTexture` now has `forceEven` parameter.

### Tilemaps

- `TilemapLayer` and `TilemapGPULayer` now support a parent matrix during rendering.
- Added new optional `sortByY` parameter to the Tilemap `createFromObjects` method (thanks @saintflow47)

### Phaser v3 Enhancements Merged

All enhancements from late Phaser v3 development have been merged into v4. This includes:

- `Transform#getWorldPoint`
- `Layer#getDisplayList`
- `DynamicTexture` and `RenderTexture` changes:
  - `forceEven` parameter forces resolution to be divisible by 2.
  - `clear(x, y, width, height)` method now takes the listed optional parameters.
- `Rectangle` now supports rounded corners.
- `Physics.Matter.Components.Transform#scale` for setting scaleX and scaleY together.
- `WebGLRenderer` reveals functions around context loss:
  - `setExtensions`
  - `setContextHandlers`
  - `dispatchContextLost`
  - `dispatchContextRestored`
- Improvements to tile handling for non-orthogonal tiles.
- `Tween#isNumberTween`
- Many other fixes and tweaks.

### Other New Features

- Add documentation for writing a `Extern#render` function.
- `Shape` now sets `filtersFocusContext = true` by default, to prevent clipping stroke off at the edges.

---

## Updates and Improvements

### Rendering and Performance

- WebGL2 canvases are now compatible with the WebGL renderer.
- Optimize multi-texture shader.
  - Shader branching pattern changed to hopefully be more optimal on a wider range of devices.
  - Shader will not request the maximum number of textures if it doesn't need them, improving performance on many mobile devices.
  - Shader no longer performs vertex rounding. This will prevent many situations where a batch was broken up, degrading performance.
- `BatchHandler` render nodes now create their own WebGL data buffers.
  - This uses around 5MB of RAM and VRAM in a basic game.
  - Dedicated buffers are an optimum size for batch performance.
- Drawing contexts, including filters, can now be larger than 4096 if the current device supports them. Thanks to kimdanielarthur-cowlabs for suggesting this.
- Balance rounded rectangle corners for smoothness on small corners while preventing excessive tesselation.
- Improve RenderSteps initialization, removing a private method substitution.
- Better roundPixels handling via bias.
- Fix shader compilation issues on diverse systems.
  - Shapes/Graphics should work again in Firefox.
  - Issues with inTexDatum should be eliminated in affected Linux systems.
- Fix Extern and extend its rendering potential (see Beam Examples).
- BaseFilterShader now accesses loaded shader cache keys correctly.

### Round Pixels

- Set `roundPixels` game option to `false` by default. It's very easy to get messy results with this option, but it remains available for use cases where it is necessary.
- Limit `roundPixels` to only operate when objects are axis-aligned and unscaled. This prevents flicker on transforming objects.

### Filters

- Mask filter now uses current camera by default.
- Mask Filter now uses world transforms by preference when drawing the mask. This improves expected outcomes when mask objects are inside Containers.
- Filters are correctly destroyed along with their owners, unless `ignoreDestroy` is enabled. This supports multi-owner Filter controllers.

### Camera

- `GameObject#enableLighting` now works even if the scene light manager is not enabled. The light manager must still be enabled for lights to render, but the game object flag can be set at any time.
- `YieldContext` and `RebindContext` render nodes now unbind all texture units. These nodes are used for external renderer compatibility. An external renderer could change texture bindings, leading to unexpected textures being used, so we force texture rebind.

### Input

- Gamepad buttons initialize as not being pressed, which created a problem when reading Gamepads in one Scene, and then reading them in another Scene. If the player held the button down for even a fraction of a second in the first scene, the second scene would see a bogus Button down event. The `Button` class now has a new optional `isPressed` boolean parameter which the `Gamepad` class uses to resolve this, initializing the current pressed state of the Button (thanks @cryonautlex)

### Other Updates

- Clarified that `Tilemap.createLayer()` with `gpu` flag enabled only works with orthographic layers, not hexagonal or isometric. Thanks @amirking59!
- UUIDs for DynamicTexture names.
- DynamicTexture can resize immediately after creation.
- `PhysicsGroup.add` and `StaticPhysicsGroup.add` will now check to see if the incoming child already has a body of the wrong type, and if so, will destroy it so the new correct type can be assigned. Fix #7179 (thanks @bvanderdrift)

---

## Bug Fixes

### Rendering and Filters

- Fix `WebGLSnapshot` orientation.
- `WebGLSnapshot` and snapshot functions based on it now return the correct pixel, instead of the one above it (or nothing if they're at the top of the image).
- Fix filters rendering outside intended camera scissor area.
- Fix `RenderSteps` parameter propagation into `Layer` and `Container`. This resolves some missing render operations in complex situations.
- Fix GL scissor sometimes failing to update. The actual issue was, we were storing the screen coordinates, but applying GL coordinates, which can be different in different-sized framebuffers. `DrawingContext` now takes screen coordinates, and sets GL coordinates in the `WebGLGlobalWrapper`.
- Fix parent transform on filtered objects (e.g. masks inside containers).
- Fix `Filters#focusFilters` setting camera resolution too late, leading to unexpected results on the first frame.
- Fix parent matrix application order, resolving unexpected behavior within Containers.
- Fix `FillCamera` node being misaligned/missing in cameras rendering to framebuffers.
- Fix errors when running a scene without the lighting plugin.
- Lighting fixed on rotated or filtered objects.
- Fix `Shape` not respecting lights even though it had the lighting component.
- Fix blend modes leaking onto siblings within a `Container`. Thanks to @saintflow47, @tickle-monster and @leemanhopeter for reporting this.
- `Container` now updates the blend mode it passes to children more accurately, preventing blend modes from leaking from one child into another child's filters. Thanks @leemanhopeter!
- `Blend` filter parameter `texture` now correctly documented as `string`.
- `ColorMatrix` filter correctly blends input alpha.
- `Filters` now correctly handles non-central object origins when the object is flipped. Thanks @ChrisCPI!
- `Glow` filter acts consistently when `knockout` is active.
- `Mask` filter now correctly resizes and clears when the game resizes to an odd width or height, fixing a bug where masks might overdraw themselves over time. Thanks @leemanhopeter!
- `ParallelFilters` filter memory leak eliminated (this would occur when both passes had active filters).
- Filters now correctly transform the camera to focus objects with intricate transforms.
- Filters now correctly handle parent transforms when focusing to the game camera.
- `Blocky` filter now has a minimum size of 1, which prevents the object from disappearing.
- Fix `flipX`/`flipY` in `Filter#focusFilters`.
- Fix `BatchHandlerQuad#run()` parameter `tintFill`, which was set as a Number but should be used as a Boolean.
- WebGLRenderer destroys itself properly.
- Fix filter padding precision.
- Fix filter padding offset with internal filters.
- Fix shader not switching when TilemapLayer and TileSprite are in the same scene.
- Fix UV coordinates in `Shader`.
- Fix Shadow filter direction.
- Fix reversion in BitmapText kerning.
- Fix `CaptureFrame` compatibility with `Layer` and `Container`.
- In Layer and Container objects, use that object's children for the `displayList` passed to `RenderWebGLSteps`.
- Children of filtered `Container`/`Layer` objects are correctly added to the current camera's `renderList`. This fixes an issue with input on overlapping interactive objects.
- `DynamicTexture` method `startCapture` now handles nested parent transforms correctly. This is used in `Mask`, so masks within `Container` objects should behave correctly too.

### Camera Fixes

- Fix camera shake.
- Fix camera transform matrix order issues, as seen when rendering through transformed cameras.
- Fix reversion that removed camera zoom on separate axes.

### Physics

- Fix Arcade Physics group collisions, `nearest` and `furthest`, and static group refresh. Thanks samme!
- `ArcadePhysics#closest()` and `#furthest()` are properly defined (thanks @samme).
- Arcade Physics OverlapCirc() and OverlapRect() error when useTree is false. Fix #7112 (thanks @samme)
- Added missing 'this' value for Group.forEach and StaticGroup.forEach (thanks @TadejZupancic)
- `PhysicsGroup.add` and `StaticPhysicsGroup.add` will now check to see if the incoming child already has a body of the wrong type, and if so, will destroy it so the new correct type can be assigned.

### Tilemap Fixes

- Fix boundary errors on the Y axis in `TilemapGPULayer` shader, introduced after switching to GL standard texture orientation.
- `TilemapGPULayer` now respects camera translation. Thanks @aroman!
- `TilemapGPULayer` now takes the first tileset if it receives an array of tilesets (which is valid for Tilemaps but not for TilemapGPULayer). Thanks to ChrisCPI for the fix.
- Fix `createFromTiles` to handle multiple tilesets when using sprite sheets. Fix #7122 (thanks @vikerman)

### DynamicTexture and RenderTexture Fixes

- Fix `DynamicTexture` errors when rendering Masks.
- Prevent `RenderTexture` from rendering while it's rendering, thus preventing infinite loops.
- Fix `DynamicTexture` using a camera without the required methods.
- Fix positioning of Group members and offset objects in `DynamicTexture#draw`.
- Fix `DynamicTexture` turning black if it initially has a power-of-two resolution and is resized to a non-power-of-two resolution. Now any WebGL texture resize will wrap with REPEAT if it is power of two, or CLAMP_TO_EDGE if not. Thanks to @x-wk for reporting this.
- Masks work (again). Big feature!

### Game Object Fixes

- Fix `Grid` using old methods. It was supposed to use 'stroke' just like other `Shape` objects, not a unique 'outline'.
- `Grid` shape now sets stroke correctly from optional initialization parameters, at 1px wide. (Use `Grid#setStrokeStyle()` to customize it further.) Thanks @Grimshad!
- Fix Layer's use of RenderSteps.
- Throw an error if `DOMElement` has no container.
- Fix `TileSprite` applying `smoothPixelArt` game option incorrectly.
- Fix missing reference to Renderer events in `BatchHandler` (thanks @mikuso)
- `WebGLProgramWrapper` now correctly recognizes uniforms with a value of `undefined` and can recognize if they have not changed and do not need updates.

### Texture Fixes

- Fix `TextureSource.resolution` being ignored in WebGL.
  - This fixes an issue where increasing text resolution increased text size.
- Allow `TextureSource#setFlipY` to affect all textures (except compressed textures, which have fixed orientation).
- Fail gracefully when a texture isn't created in `addBase64()`.
- Fix texture offsets in `ParseXMLBitmapFont`. Thanks to @leemanhopeter.
- Fix `TextureManager.addUint8Array` method, which got premultiplied alpha wrong and flipY wrong.

### SpriteGPULayer Fixes

- Fix `SpriteGPULayer` segment handling (segments changed from 32 to 24 to avoid problems with 32-bit number processing)
- Allow negative acceleration in `SpriteGPULayer` member animations using Gravity.
- Rearrange `SpriteGPULayer` data encoding.
- Fix `SpriteGPULayer` failing to generate frame animations from config objects.
- Fix `SpriteGPULayer#getMember()`, which previously multiplied the index by 4.
- Fix `SpriteGPULayer` creation time handling getting confused by 0.

### Input Fixes

- `GamepadPlugin.stopListeners` and `GamepadPlugin.disconnectAll` now have guards around them so they won't try to invoke functions on potentially undefined gamepads (thanks @cryonautlex)

### Loader and Audio

- Fix audio files not loading from Base64 data URIs (thanks @bagyoni)
- The Loader `GetURL` function did not treat `file://` URLs as absolute. When a baseURL is set, it gets prepended to an already-absolute path, producing double-prefixed URLs (thanks @aomsir)

### Tweens and Timeline

- Fixed a crash in `TweenBuilder` when the targets array contains null or undefined elements (thanks @aomsir)
- Fixed a bug where multiple `Timeline` events with `once` set to `true` would silently break the timeline and prevent all future events from firing. Fix #7147 (thanks @TomorrowToday)
- Fix `TimeStep#stepLimitFPS` to drop fewer frames, running much more smoothly at the target frame rate. Thanks to @Flow and @Antriel for discussing the topic.
  - Documentation in `FPSConfig#limit` now clarifies that frame limits are only necessary when artificially slowing the game below the display refresh rate.

### Other Fixes

- Improve `TransformMatrix.setQuad` documentation.
- `ColorMatrix.desaturate` is no longer documented as `saturation`.
- Add `@return` tag to `FilterList#addBlend` (thanks @phasereditor2d!).
- Add typedefs for the `{ internal, external }` structure of `Camera#filters` (and `GameObject#filters`).
- Fix `FilterList#addMask` docs.

---

## Documentation and TypeScript

The Spine 3 and Spine 4 plugins will no longer be updated. You should now use the official Phaser Spine plugin created by Esoteric Software.

Fixes to TypeScript documentation: thanks to SBCGames and mikuso for contributions!

Add documentation for writing a `Extern#render` function.

---

## Thanks

Phaser v4 would not be possible without the community. Thank you to everyone who reported bugs, submitted fixes, contributed to the documentation and TypeScript definitions, and helped with beta testing:

@amirking59, @Antriel, @aomsir, @aroman, @bagyoni, @bvanderdrift, @captain-something, @chavaenc, @ChrisCPI, @cryonautlex, @DayKev, @Flow, @Grimshad, @ixonstater, @justin-calleja, @leemanhopeter, @Legend-Master, @mikuso, @ospira, @OuttaBounds, @phasereditor2d, @raaaahman, @saintflow47, @samme, @SBCGames, @skhoroshavin, @TadejZupancic, @tickle-monster, @TomorrowToday, @Urantij, @vikerman, @x-wk

And special thanks to kimdanielarthur-cowlabs for filter improvements.
