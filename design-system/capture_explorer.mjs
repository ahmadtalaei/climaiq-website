/**
 * Capture a high-res screenshot of an explorer route via headless Edge + CDP.
 * Reuses the WebGL-software-render launch flags from the fuels-service e2e harness
 * (--enable-unsafe-swiftshader + --disable-gpu) so the MapLibre map actually paints.
 *
 *   node capture_explorer.mjs <route> <outfile> [waitMs] [w] [h] [scale]
 *   e.g. node capture_explorer.mjs /explorer ../assets/explorer-hero.png 15000 1440 900 2
 *
 * Needs Microsoft Edge installed AND the fuels-modeling-service running on :8077.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROUTE = process.argv[2] || '/explorer';
const OUT   = process.argv[3] || 'explorer.png';
const WAIT  = parseInt(process.argv[4] || '15000', 10);
const W     = parseInt(process.argv[5] || '1440', 10);
const H     = parseInt(process.argv[6] || '900', 10);
const SCALE = parseInt(process.argv[7] || '2', 10);
const URL   = `http://127.0.0.1:8077${ROUTE}`;
const EDGE  = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT  = 9336;
const userDir = mkdtempSync(join(tmpdir(), 'shot-e2e-'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${userDir}`,
  `--window-size=${W},${H}`, '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  '--disable-gpu', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });

let ws, msgId = 0; const pend = new Map();
const cmd = (method, params = {}) => { const id = ++msgId; ws.send(JSON.stringify({ id, method, params }));
  return new Promise(res => { pend.set(id, res); setTimeout(() => { if (pend.has(id)) { pend.delete(id); res(null); } }, 30000); }); };

let code = 1;
try {
  let target = null;
  for (let i = 0; i < 40; i++) { await sleep(300);
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/list`); target = (await r.json()).find(t => t.type === 'page'); if (target?.webSocketDebuggerUrl) break; } catch {} }
  if (!target) throw new Error('no CDP page target (is Edge installed at EDGE_PATH?)');
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws connect failed')); });
  ws.onmessage = ev => { let m; try { m = JSON.parse(ev.data); } catch { return; } if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };

  await cmd('Page.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: SCALE, mobile: false });
  await cmd('Page.navigate', { url: URL });
  await sleep(WAIT);   // let tiles + WebGL layers settle
  const r = await cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  if (!r?.data) throw new Error('captureScreenshot returned no data');
  writeFileSync(OUT, Buffer.from(r.data, 'base64'));
  console.log(`✓ wrote ${OUT} (${W}x${H} @${SCALE}x) from ${URL}`);
  code = 0;
} catch (e) { console.log('CAPTURE ERROR:', e.message); }
finally { try { ws?.close(); } catch {} edge.kill(); await sleep(300); process.exit(code); }
