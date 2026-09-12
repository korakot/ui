# three.mjs

`three.mjs` is a compact 3D scene DSL over Three.js for chat widgets and other browser ESM hosts.

The goal is to keep generated scene descriptions short and readable while still allowing direct access to Three.js when the DSL is not enough.

## Quick start

```html
<div class="three">
box cube 0 0 0 1 coral
sphere ball 2 0 0 .6 skyblue
arrow cube ball
</div>
<script type="module">
  import 'https://cdn.jsdelivr.net/gh/korakot/ui@main/three.mjs';
</script>
```

Importing `three.mjs` auto-renders matching `.three` elements.

## Why it is portable

`three.mjs` imports Three.js itself from an exact-version browser ESM URL, but does **not** depend on the Three.js `OrbitControls` addon.

Orbit / zoom / pan controls are implemented locally in `three.mjs`. This avoids addon modules that contain a bare `import "three"`, which can fail in sandboxed ESM hosts such as ChatGPT `app_block` when no import map is available.

So a simple widget needs only one module import: `three.mjs`.

## DSL reference

```text
camera x y z [fov]
look x y z
bg color
light x y z [power] [color]
ambient [power] [color]
box [id] x y z [size|x,y,z] [color]
sphere [id] x y z [radius] [color]
cylinder [id] x y z [radius] [height] [color]
plane [id] x y z [width] [height] [color]
rot id x y z
line id1 id2 [color]
arrow id1 id2 [color]
```

`#` starts a comment.

Ids are optional for shapes; if omitted, they are generated automatically. `rot` uses degrees.

### Camera

```text
camera 3 2 5 45
look 0 0 0
```

Defaults:

- camera position: `3 2 5`
- FOV: `45`
- look/orbit target: `0 0 0`

### Lighting

```text
ambient 1.2 #ffffff
light 4 6 3 2 #ffffff
```

If omitted, useful default lighting is added automatically.

### Shapes

```text
box cube 0 0 0 1 coral
box slab 2 0 0 2,0.4,1 steelblue
sphere ball 0 2 0 .6 skyblue
cylinder post 0 0 2 .4 2 orange
plane floor 0 -1 0 8 8 #dddddd
```

For `box`, a single size creates a cube; `x,y,z` creates a rectangular box.

### Rotation

```text
rot slab 0 45 0
```

Angles are degrees.

### Lines and arrows

```text
line cube ball #777777
arrow cube ball #333333
```

Both commands connect object centers.

## Built-in controls

Orbit controls are enabled by default:

- drag: orbit
- mouse wheel / trackpad scroll: zoom
- right-drag: pan

Disable them when needed:

```js
render('.three', { orbit: false });
```

The returned `controls` object is the lightweight controller implemented by `three.mjs`, not Three.js `OrbitControls`. It exposes the pieces commonly needed by generated widgets, including `target`, `update()`, `dispose()`, and `enabled`.

## Programmatic rendering

```html
<div class="my-scene">
box cube 0 0 0 1 coral
</div>

<script type="module">
  import { render } from 'https://cdn.jsdelivr.net/gh/korakot/ui@main/three.mjs';
  const api = render('.my-scene');
</script>
```

`render()` returns:

```text
{
  THREE,
  scene,
  camera,
  renderer,
  controls,
  objects,
  source,
  stop
}
```

`objects` is keyed by DSL object id.

## Three.js escape hatch

The DSL intentionally covers common scene description rather than wrapping the whole Three.js API.

For less common behavior, use the returned Three.js objects directly:

```html
<script type="module">
  import { render } from 'https://cdn.jsdelivr.net/gh/korakot/ui@main/three.mjs';

  const { THREE, scene, camera, renderer, controls, objects } = render('.my-scene');
  objects.ball.rotation.y = Math.PI / 4;
</script>
```

This keeps normal generated content compact without removing access to full Three.js.

## Animation

Pass a `tick` callback to `render()`:

```js
render('.three', {
  tick({ objects }, time) {
    objects.cube.rotation.y = time * 0.001;
  }
});
```

The renderer manages the animation loop and resize handling.

## ChatGPT `app_block`

`three.mjs` is designed to work in browser ESM sandboxes such as ChatGPT `@Visualize` / `app_block`.

Typical pattern:

```html
<div class="three">
box a -1 0 0 1 #6b8fd6
box b 1 0 0 1 #70a57a
arrow a b
</div>

<script type="module">
  import 'https://cdn.jsdelivr.net/gh/korakot/ui@main/three.mjs';
</script>
```

For debugging a new change, importing by commit SHA can avoid CDN cache ambiguity:

```js
await import('https://cdn.jsdelivr.net/gh/korakot/ui@COMMIT_SHA/three.mjs');
```

## Design principle

Prefer DSL data for ordinary geometry and relationships. Use JavaScript only for behavior or Three.js features that are uncommon enough that adding them to the DSL would make the language larger and less readable.
