# Phaser - HTML5 Game Framework

![Phaser Banner](changelog/assets/phaser-banner.png "Phaser Banner")

[![Discord](https://img.shields.io/discord/244245946873937922?style=for-the-badge)](https://discord.gg/phaser)
![JSDelivr](https://img.shields.io/jsdelivr/npm/hm/phaser?style=for-the-badge)
![GitHub](https://img.shields.io/github/downloads/phaserjs/phaser/total?style=for-the-badge)

Phaser is a fast, free, and fun open source HTML5 game framework that offers WebGL and Canvas rendering across desktop and mobile web browsers and has been actively developed for over 10 years.

Games can be built for the web, or as YouTube Playables, Discord Activities, Twitch Overlays or compiled to iOS, Android, Steam and native apps using 3rd party tools. You can use JavaScript or TypeScript for development. Phaser supports over 40 different front-end frameworks including React and Vue.

Phaser is commercially developed and maintained by **Phaser Studio Inc** along with our fantastic open source community. As a result of rapid support, and a developer friendly API, Phaser is currently one of the [most starred](https://github.com/collections/javascript-game-engines) game frameworks on GitHub.

Interested in learning more? Click the image below to watch our intro video.

[![YouTube](http://i.ytimg.com/vi/jHTRu4iNTcA/maxresdefault.jpg)](https://www.youtube.com/watch?v=jHTRu4iNTcA)

---

## Phaser 4

Phaser 4 is a major release built on a brand-new WebGL renderer. The entire rendering pipeline from v3 has been replaced with a modern, node-based architecture that manages WebGL state properly, handles context loss gracefully, and is significantly faster. If you've built games with Phaser 3, the public API is mostly familiar -- but under the hood, everything has changed for the better.

### Getting Started

Install via [npm](https://www.npmjs.com/package/phaser):

```bash
npm install phaser@beta
```

Or include via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/phaser@beta/dist/phaser.min.js"></script>
```

Then create your first game:

```js
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        create: function () {
            this.add.text(400, 300, 'Hello Phaser 4!', { fontSize: '32px' }).setOrigin(0.5);
        }
    }
};

const game = new Phaser.Game(config);
```

### Why Phaser?

- **Battle-tested** -- Over a decade of active development. Tens of thousands of games shipped. A huge community of developers who've seen it all.
- **Truly cross-platform** -- One codebase runs on desktop browsers, mobile browsers, and can be wrapped for native app stores, Steam, YouTube Playables, Discord Activities, and more.
- **Developer-friendly API** -- Scene-based architecture, a comprehensive loader, built-in physics (Arcade and Matter.js), animation system, input handling, cameras, tilemaps, particles, tweens, and much more -- all with clear, consistent APIs.
- **Framework agnostic** -- Works with React, Vue, Angular, Svelte, or plain JavaScript and TypeScript. Use whatever tools you prefer.
- **Massive ecosystem** -- Over 2,000 code examples. Extensive API documentation. Active Discord and forums. First-class TypeScript definitions.
- **AI-ready** -- Phaser's API is well understood by every major frontier LLM, making it an ideal choice for AI-assisted game development.

### AI-Assisted Game Development

Phaser has been part of the training data for every major frontier LLM. Models from Anthropic, OpenAI, Google, and others understand the Phaser API deeply -- they can generate game code, debug rendering issues, set up physics, build scene structures, and work with tilemaps, tweens, and animations out of the box.

This makes Phaser an excellent choice for AI-assisted development workflows. Tools like [Claude Code](https://claude.ai/claude-code), Cursor, Windsurf, GitHub Copilot, and others can scaffold entire Phaser games, implement features from natural language descriptions, and help you iterate quickly. Combined with Phaser's comprehensive TypeScript definitions, AI coding assistants get strong type context and can produce accurate, working code with minimal correction.

Whether you're a solo dev using AI to move faster, a team using it for prototyping, or someone learning game development with an AI pair programmer, Phaser's well-documented, consistent API means the AI is working with you, not fighting the framework.

### What's New in Phaser 4

Here are the headline features. For the full picture, see the [Changelog](changelog/4.0/CHANGELOG-v4.0.0.md) and [Migration Guide](changelog/4.0/MIGRATION-GUIDE.md).

#### New Render Node Architecture

The v3 pipeline system has been replaced with a clean, node-based renderer. Each render node handles a single task, WebGL state is fully managed, and context restoration is built in. The result is a renderer that's faster, more reliable, and much easier to extend with custom rendering logic. Quads now use index buffers, reducing vertex upload costs by a third. Multi-texture batching is smarter, avoiding unnecessary batch breaks on mobile. And the whole system uses just-in-time rendering -- nothing hits the GPU until it absolutely has to.

#### Unified Filter System

FX and Masks from v3 have been unified into a single, powerful **Filter** system. Filters can be applied to any game object or camera -- no more restrictions on which objects support effects. Every filter takes an input image and produces an output, usually via a single shader, so they're all mutually compatible.

v4 ships with a huge library of built-in filters: Blur, Glow, Shadow, Pixelate, ColorMatrix, Bloom, Vignette, Wipe, and many more. New additions include **ImageLight** for realistic image-based lighting, **Blocky** for pixel-art-friendly pixelation, **GradientMap** for palette-swap effects, **Quantize** for retro dithered palettes, **Key** for chroma keying, **NormalTools** for normal map manipulation, and **Blend** which brings all 27 Canvas blend modes to WebGL.

Masks are now a filter too, more powerful than ever. A `Container` full of filtered, masked objects can itself be used as a mask source.

#### SpriteGPULayer -- Render a Million Sprites

`SpriteGPULayer` is a new game object designed to render massive numbers of sprites. Where standard Phaser rendering handles tens of thousands of sprites comfortably, SpriteGPULayer handles **a million or more**, up to 100x faster.

It works by storing all member data in a static GPU buffer and rendering everything in a single draw call, skipping the per-frame CPU-to-GPU upload that's normally the main bottleneck. Members aren't just static, either -- each one supports GPU-driven animations on position, rotation, scale, alpha, tint, and frame, with a full set of easing functions (Linear, Quad, Cubic, Bounce, Gravity, and many more). Per-member scroll factors enable parallax backgrounds, and non-looping mode supports one-off particle effects. It's perfect for bringing complex, animated backgrounds to life without touching your frame budget.

#### TilemapGPULayer -- Render Millions of Tiles

`TilemapGPULayer` renders an entire tilemap layer as a single quad. The shader cost is per-pixel, not per-tile, so it can display up to 4096 x 4096 tiles with no performance penalty for tile count. It also produces perfect texture filtering across tile boundaries -- no seams, no bleeding. If you need large maps on screen at once, especially on mobile, this is the way to go.

#### Overhauled Tint System

Tint has been reworked with color and mode as separate concerns. Six tint modes are available: `MULTIPLY`, `FILL`, `ADD`, `SCREEN`, `OVERLAY`, and `HARD_LIGHT`. The new `setTintMode()` method gives you explicit control, and BitmapText tinting finally works correctly.

#### New Game Objects

- **Gradient** -- Render linear, radial, conic, and bilinear color gradients with dithering support, powered by the new `ColorBand` and `ColorRamp` classes.
- **Noise, NoiseCell (2D/3D/4D), NoiseSimplex (2D/3D)** -- Generate and animate cellular noise, simplex noise, and random static on the GPU, with normal map output for use in lighting and effects.
- **CaptureFrame** -- Snapshot the current framebuffer mid-render for post-processing tricks.
- **Stamp** -- Render a camera-independent quad, useful for DynamicTexture operations.

#### Improved Lighting

Lighting is now as simple as `sprite.setLighting(true)` -- no pipeline juggling required. Objects can cast self-shadows based on their own texture, lights have an explicit `z` height value, and lighting works across most game objects including BitmapText, Particles, TileSprite, and both tilemap layer types.

#### Shader and TileSprite Improvements

The `Shader` game object has been rewritten with a cleaner config-based API (`ShaderQuadConfig`), and GLSL loading now uses standard `#pragma` directives that work with syntax checkers. `TileSprite` has been rebuilt with a new shader that supports texture atlas frames and tile rotation -- no more whole-texture-only limitation.

---

## Phaser TypeScript Definitions

Full TypeScript definitions can be found inside the [types folder](https://github.com/phaserjs/phaser/tree/master/types). They are also referenced in the `types` entry in `package.json`, meaning modern editors such as VSCode will detect them automatically.

Depending on your project, you may need to add the following to your `tsconfig.json` file:

```json
"lib": ["es6", "dom", "dom.iterable", "scripthost"],
"typeRoots": ["./node_modules/phaser/types"],
"types": ["Phaser"]
```

## Migrating from Phaser 3

Phaser 4 keeps most of the public API you know, but there are important breaking changes -- the renderer, tint system, FX/Masks, Shader API, lighting, and several removed classes (Point, Mesh, BitmapMask) all need attention. We've written a detailed [Migration Guide](changelog/4.0/MIGRATION-GUIDE.md) with a checklist to walk you through it.

## Have fun!

Grab the source and join the fun!

Phaser wouldn't have been possible without the fantastic support of the community. Thank you to everyone who supports our work, who shares our belief in the future of HTML5 gaming, and Phaser's role in that.

Happy coding everyone!

Cheers,

[Rich](mailto:rich@phaser.io) and the whole team at Phaser Studio

![boogie](https://www.phaser.io/images/spacedancer.gif)

**Visit** the [Phaser website](https://phaser.io)<br />
**Play** some [amazing games](https://phaser.io/games)<br />
**Learn** By browsing our [API Docs](https://docs.phaser.io) or [Support Forum](https://phaser.discourse.group/)<br />
**Be Social:** Join us on [Discord](https://discord.gg/phaser) and [Reddit](https://phaser.io/community/reddit) or follow us on [Twitter](https://twitter.com/phaser_)<br />
**Code Examples?** We've over 2000 [Examples](https://phaser.io/examples) to learn from<br />

Powered by coffee, anime, pixels and love.

The Phaser logo and characters are &copy; 2011 - 2026 Phaser Studio Inc.

All rights reserved.

"Above all, video games are meant to be just one thing: fun. Fun for everyone." - Satoru Iwata
