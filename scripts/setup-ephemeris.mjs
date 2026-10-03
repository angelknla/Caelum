import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const revision = 'aacf962d19d79f8bc921dbcdaacf306d85be1917';
const directory = new URL('../ephemeris/', import.meta.url);
const files = ['sepl_18.se1', 'semo_18.se1', 'seas_18.se1'];
await mkdir(directory, { recursive: true });
const manifest = { revision, source: 'https://github.com/aloistr/swisseph', files: {} };
for (const name of [...files, 'LICENSE']) {
  const path = name === 'LICENSE' ? 'LICENSE' : `ephe/${name}`;
  const response = await fetch(
    `https://raw.githubusercontent.com/aloistr/swisseph/${revision}/${path}`
  );
  if (!response.ok) throw new Error(`Download failed: ${name} (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (files.includes(name) && bytes.length < 10000) throw new Error(`Invalid data file: ${name}`);
  await writeFile(new URL(name, directory), bytes);
  manifest.files[name] = createHash('sha256').update(bytes).digest('hex');
}
await writeFile(new URL('manifest.json', directory), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Swiss Ephemeris data installed in ${fileURLToPath(directory)}`);
