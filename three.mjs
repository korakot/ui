// three.mjs v0.2 — compact scene DSL over Three.js.
// Common scene data stays tiny; uncommon behavior can use the returned Three.js objects directly.
// OrbitControls are enabled by default; pass { orbit: false } to render() to disable them.
//
// Usage:
//   <div class="three">box cube 0 0 0 1 coral\nsphere ball 2 0 0 .6 skyblue</div>
//   <script type="module">import 'https://cdn.jsdelivr.net/gh/korakot/ui@main/three.mjs';</script>
//
// DSL:
//   camera x y z [fov]        camera position (default 3 2 5, fov 45)
//   look x y z                camera/orbit target (default 0 0 0)
//   bg color                  scene background
//   light x y z [power] [color]  directional light
//   ambient [power] [color]   ambient light
//   box [id] x y z [size|x,y,z] [color]
//   sphere [id] x y z [radius] [color]
//   cylinder [id] x y z [radius] [height] [color]
//   plane [id] x y z [width] [height] [color]
//   rot id x y z              rotation in degrees
//   line id1 id2 [color]
//   arrow id1 id2 [color]
//   # comment
//
// render() returns { THREE, scene, camera, renderer, controls, objects, source, stop }.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.186.0/+esm';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/controls/OrbitControls.js/+esm';

const DEFAULT_COLOR = '#7aa2d6';
const DEFAULT_BG = '#ffffff';

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function isNum(v) {
  return v != null && v !== '' && Number.isFinite(Number(v));
}

function color(v, fallback = DEFAULT_COLOR) {
  return v || fallback;
}

function splitSize(v, fallback = [1, 1, 1]) {
  if (!v) return fallback;
  if (!String(v).includes(',')) {
    const s = num(v, 1);
    return [s, s, s];
  }
  const a = String(v).split(',').map(Number);
  return [num(a[0], 1), num(a[1], 1), num(a[2], 1)];
}

function shapeArgs(tokens, autoId) {
  let i = 1;
  let id = autoId;
  if (tokens[i] != null && !isNum(tokens[i])) id = tokens[i++];
  const x = num(tokens[i++], 0);
  const y = num(tokens[i++], 0);
  const z = num(tokens[i++], 0);
  return { id, x, y, z, rest: tokens.slice(i) };
}

export function parse(src) {
  const spec = {
    camera: [3, 2, 5, 45],
    look: [0, 0, 0],
    bg: DEFAULT_BG,
    lights: [],
    ambient: null,
    objects: [],
    ops: []
  };

  let auto = 0;
  for (let raw of String(src).split('\n')) {
    raw = raw.replace(/\s+#.*$/, '').trim();
    if (!raw || raw.startsWith('#')) continue;
    const t = raw.split(/\s+/);
    const cmd = t[0].toLowerCase();

    if (cmd === 'camera') {
      spec.camera = [num(t[1], 3), num(t[2], 2), num(t[3], 5), num(t[4], 45)];
      continue;
    }
    if (cmd === 'look') {
      spec.look = [num(t[1], 0), num(t[2], 0), num(t[3], 0)];
      continue;
    }
    if (cmd === 'bg') {
      spec.bg = color(t[1], DEFAULT_BG);
      continue;
    }
    if (cmd === 'light') {
      spec.lights.push({ x: num(t[1], 4), y: num(t[2], 6), z: num(t[3], 3), power: num(t[4], 2), color: color(t[5], '#ffffff') });
      continue;
    }
    if (cmd === 'ambient') {
      spec.ambient = { power: num(t[1], 1.2), color: color(t[2], '#ffffff') };
      continue;
    }

    if (['box', 'sphere', 'cylinder', 'plane'].includes(cmd)) {
      const a = shapeArgs(t, `${cmd}${++auto}`);
      spec.objects.push({ type: cmd, ...a });
      continue;
    }

    if (cmd === 'rot') {
      spec.ops.push({ type: 'rot', id: t[1], x: num(t[2], 0), y: num(t[3], 0), z: num(t[4], 0) });
      continue;
    }
    if (cmd === 'line' || cmd === 'arrow') {
      spec.ops.push({ type: cmd, from: t[1], to: t[2], color: color(t[3], '#555555') });
      continue;
    }

    throw new Error(`unknown three DSL command: ${t[0]}`);
  }
  return spec;
}

function makeMaterial(c, side) {
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.72, metalness: 0.03, side });
}

function addShape(scene, objects, def) {
  let geometry;
  let material;
  const r = def.rest;

  if (def.type === 'box') {
    const [x, y, z] = splitSize(r[0]);
    geometry = new THREE.BoxGeometry(x, y, z);
    material = makeMaterial(color(r[1]));
  } else if (def.type === 'sphere') {
    geometry = new THREE.SphereGeometry(num(r[0], 0.5), 32, 20);
    material = makeMaterial(color(r[1]));
  } else if (def.type === 'cylinder') {
    const radius = num(r[0], 0.5);
    geometry = new THREE.CylinderGeometry(radius, radius, num(r[1], 1), 32);
    material = makeMaterial(color(r[2]));
  } else if (def.type === 'plane') {
    geometry = new THREE.PlaneGeometry(num(r[0], 4), num(r[1], 4));
    material = makeMaterial(color(r[2], '#d8dde5'), THREE.DoubleSide);
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = def.id;
  mesh.position.set(def.x, def.y, def.z);
  if (def.type === 'plane') mesh.rotation.x = -Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  objects[def.id] = mesh;
  return mesh;
}

export function render(target = '.three', options = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new Error(`three target not found: ${target}`);
  if (el.__three) return el.__three;

  const source = options.source ?? el.textContent;
  const spec = parse(source);
  el.textContent = '';
  el.style.display = 'block';
  if (!el.style.height) el.style.height = options.height || '360px';
  if (!el.style.minHeight) el.style.minHeight = '180px';
  el.style.position = el.style.position || 'relative';
  el.style.overflow = 'hidden';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(spec.bg);

  const camera = new THREE.PerspectiveCamera(spec.camera[3], 1, 0.01, 2000);
  camera.position.set(spec.camera[0], spec.camera[1], spec.camera[2]);
  camera.lookAt(...spec.look);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  el.appendChild(renderer.domElement);

  if (spec.ambient) {
    scene.add(new THREE.AmbientLight(spec.ambient.color, spec.ambient.power));
  } else {
    scene.add(new THREE.HemisphereLight('#ffffff', '#7b8491', 1.5));
  }

  if (spec.lights.length) {
    for (const d of spec.lights) {
      const light = new THREE.DirectionalLight(d.color, d.power);
      light.position.set(d.x, d.y, d.z);
      light.castShadow = true;
      scene.add(light);
    }
  } else {
    const light = new THREE.DirectionalLight('#ffffff', 2.4);
    light.position.set(4, 6, 3);
    light.castShadow = true;
    scene.add(light);
  }

  const objects = {};
  for (const def of spec.objects) addShape(scene, objects, def);

  for (const op of spec.ops) {
    if (op.type === 'rot') {
      const o = objects[op.id];
      if (!o) throw new Error(`rot: unknown object ${op.id}`);
      o.rotation.set(THREE.MathUtils.degToRad(op.x), THREE.MathUtils.degToRad(op.y), THREE.MathUtils.degToRad(op.z));
    } else if (op.type === 'line' || op.type === 'arrow') {
      const a = objects[op.from], b = objects[op.to];
      if (!a || !b) throw new Error(`${op.type}: unknown object ${!a ? op.from : op.to}`);
      const dir = b.position.clone().sub(a.position);
      if (op.type === 'arrow') {
        const arrow = new THREE.ArrowHelper(dir.clone().normalize(), a.position.clone(), dir.length(), op.color);
        scene.add(arrow);
      } else {
        const geometry = new THREE.BufferGeometry().setFromPoints([a.position.clone(), b.position.clone()]);
        scene.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: op.color })));
      }
    }
  }

  const controls = options.orbit === false ? null : new OrbitControls(camera, renderer.domElement);
  if (controls) {
    controls.enableDamping = options.enableDamping !== false;
    controls.dampingFactor = num(options.dampingFactor, 0.08);
    controls.target.set(...spec.look);
    controls.update();
  }

  function resize() {
    const w = Math.max(1, el.clientWidth);
    const h = Math.max(1, el.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(el);
  resize();

  let stopped = false;
  const api = {
    THREE, scene, camera, renderer, controls, objects, source,
    stop() {
      if (stopped) return;
      stopped = true;
      renderer.setAnimationLoop(null);
      if (controls) controls.dispose();
      if (ro) ro.disconnect();
      renderer.dispose();
      delete el.__three;
    }
  };

  el.__three = api;
  renderer.setAnimationLoop((time) => {
    if (stopped) return;
    if (controls) controls.update();
    if (typeof options.tick === 'function') options.tick(api, time);
    renderer.render(scene, camera);
  });
  return api;
}

export function renderAll(selector = '.three') {
  return [...document.querySelectorAll(selector)].map(el => render(el));
}

export { THREE };

function autoRender() {
  document.querySelectorAll('.three:not([data-three])').forEach(el => {
    el.dataset.three = '1';
    try { render(el); }
    catch (e) {
      el.textContent = String(e.message || e);
      el.style.color = '#c00';
      console.error(e);
    }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoRender, { once: true });
else autoRender();