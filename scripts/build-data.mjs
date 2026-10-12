// Builds src/data/cities.json from GeoNames (CC BY 4.0) + Wikidata (CC0).
// Usage: npm run data
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync, strFromU8 } from 'fflate';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const countries = JSON.parse(readFileSync(join(root, 'src/data/countries.json'), 'utf8'));
const ISO = new Set(countries.map((c) => c.iso));

const PER_COUNTRY = 40; // wheel never needs more; keeps the bundle small
const TR_NAME_MIN_POP = 200_000; // Turkish exonyms (Varşova) only for big cities; small ones keep the local name
const MIN_PER_COUNTRY = 5; // tiny countries fall back to the denser cities1000 file

async function loadGeonames(file) {
  const res = await fetch(`https://download.geonames.org/export/dump/${file}.zip`);
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  const zip = unzipSync(new Uint8Array(await res.arrayBuffer()));
  const text = strFromU8(zip[`${file}.txt`]);
  const byCountry = new Map();
  for (const line of text.split('\n')) {
    const f = line.split('\t');
    if (f.length < 15 || !ISO.has(f[8])) continue;
    if (f[6] !== 'P' || f[7] === 'PPLX') continue; // populated places, not city "sections"
    const city = { id: Number(f[0]), name: f[1], lat: Number(f[4]), lon: Number(f[5]), pop: Number(f[14]) };
    if (!byCountry.has(f[8])) byCountry.set(f[8], []);
    byCountry.get(f[8]).push(city);
  }
  for (const list of byCountry.values()) list.sort((a, b) => b.pop - a.pop);
  return byCountry;
}

console.log('GeoNames cities5000 indiriliyor…');
const main = await loadGeonames('cities5000');
let dense = null;
const picked = {};
for (const { iso } of countries) {
  let list = main.get(iso) ?? [];
  if (list.length < MIN_PER_COUNTRY) {
    dense ??= await loadGeonames('cities1000');
    list = dense.get(iso) ?? list;
  }
  picked[iso] = list.slice(0, PER_COUNTRY);
}

// Wikidata: Turkish labels + exact Turkish/English Wikipedia titles, matched by GeoNames ID (P1566).
const all = Object.values(picked).flat();
const wd = new Map();
console.log(`Wikidata sorgulanıyor (${all.length} şehir)…`);
for (let i = 0; i < all.length; i += 150) {
  const ids = all.slice(i, i + 150).map((c) => `"${c.id}"`).join(' ');
  const query = `SELECT ?gn ?trLabel ?trTitle ?enTitle WHERE {
    VALUES ?gn { ${ids} }
    ?item wdt:P1566 ?gn .
    OPTIONAL { ?item rdfs:label ?trLabel FILTER(LANG(?trLabel) = "tr") }
    OPTIONAL { ?tr schema:about ?item; schema:isPartOf <https://tr.wikipedia.org/>; schema:name ?trTitle }
    OPTIONAL { ?en schema:about ?item; schema:isPartOf <https://en.wikipedia.org/>; schema:name ?enTitle }
  }`;
  const res = await fetch('https://query.wikidata.org/sparql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/sparql-results+json',
      'User-Agent': 'SpinAtlas-data-build/0.1 (open-source hobby project)',
    },
    body: new URLSearchParams({ query }),
  });
  if (!res.ok) throw new Error(`Wikidata: HTTP ${res.status}`);
  for (const b of (await res.json()).results.bindings) {
    wd.set(Number(b.gn.value), {
      label: b.trLabel?.value,
      tr: b.trTitle?.value,
      en: b.enTitle?.value,
    });
  }
}

const out = {};
let withWiki = 0;
for (const [iso, list] of Object.entries(picked)) {
  out[iso] = list.map((c) => {
    const w = wd.get(c.id) ?? {};
    const rec = { id: c.id, name: c.pop >= TR_NAME_MIN_POP && w.label ? w.label : c.name, lat: c.lat, lon: c.lon, pop: c.pop };
    if (w.tr) rec.tr = w.tr;
    if (w.en) rec.en = w.en;
    if (w.tr || w.en) withWiki++;
    return rec;
  });
}

mkdirSync(join(root, 'src/data'), { recursive: true });
writeFileSync(join(root, 'src/data/cities.json'), JSON.stringify(out));
console.log(`Tamam: ${all.length} şehir, ${withWiki} tanesinde Wikipedia başlığı var.`);
for (const { iso } of countries) console.log(iso, out[iso].length);
