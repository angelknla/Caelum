import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const response = await fetch('https://download.geonames.org/export/dump/cities15000.zip');
if (!response.ok) throw new Error(`GeoNames download failed (${response.status}).`);
const temporary = await mkdtemp(path.join(tmpdir(), 'caelum-places-'));
try {
  const archive = path.join(temporary, 'cities.zip');
  await writeFile(archive, Buffer.from(await response.arrayBuffer()));
  const source = execFileSync('unzip', ['-p', archive, 'cities15000.txt'], {
    maxBuffer: 30 * 1024 * 1024,
    encoding: 'utf8',
  });
  const places = source
    .trim()
    .split('\n')
    .map((line) => {
      const fields = line.split('\t');
      return {
        id: fields[0],
        name: fields[1],
        ascii: fields[2],
        country: fields[8],
        region: fields[10],
        latitude: Number(fields[4]),
        longitude: Number(fields[5]),
        population: Number(fields[14]),
        timeZone: fields[17],
      };
    });
  const directory = new URL('../data/', import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL('places.json', directory), JSON.stringify(places));
  await writeFile(
    new URL('places-source.json', directory),
    JSON.stringify(
      {
        source: 'https://www.geonames.org/',
        license: 'CC BY 4.0',
        downloadedAt: new Date().toISOString(),
        count: places.length,
      },
      null,
      2
    )
  );
  console.log(`Installed ${places.length} GeoNames cities. Attribution: GeoNames, CC BY 4.0.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
