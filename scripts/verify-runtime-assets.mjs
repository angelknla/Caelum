import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const tracePath = path.resolve('.next/server/app/page.js.nft.json');
const trace = JSON.parse(readFileSync(tracePath, 'utf8'));
const files = trace.files.map((file) => path.resolve(path.dirname(tracePath), file));
for (const name of ['sepl_18.se1', 'semo_18.se1', 'seas_18.se1', 'places.json']) {
  assert(
    files.some((file) => path.basename(file) === name && existsSync(file)),
    `Runtime asset not traced: ${name}`
  );
}
const platformDirectory = `${process.platform}-${process.arch}`;
assert(
  files.some(
    (file) =>
      file.endsWith('.node') &&
      file.includes(`${path.sep}${platformDirectory}${path.sep}`) &&
      existsSync(file)
  ),
  `Swiss Ephemeris native binary not traced for ${platformDirectory}`
);
console.log(`Runtime assets verified for ${platformDirectory}.`);
