// Prüft die Simulation ohne Browser-Grafik: Determinismus, Spielbalance, Tempo.
// Aufruf: node tests/sim.test.js   (Node 18+, keine Abhängigkeiten)
"use strict";
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const start = html.indexOf("const BALL_DEFS");
const end = html.indexOf("/** Gewinnchancen");
if (start < 0 || end < 0) throw new Error("Simulationsteil in index.html nicht gefunden (Marker geändert?)");
const { makeSetup, Sim } = new Function(html.slice(start, end) + ";return { makeSetup, Sim };")();

let failed = 0;
const check = (ok, msg) => { console.log(`${ok ? "OK  " : "FAIL"} ${msg}`); if (!ok) failed++; };

// 1) Determinismus: gleicher Seed = gleicher Ablauf
for (let s = 1; s <= 10; s++) {
  const setup = makeSetup(s * 999, 4);
  const a = new Sim(setup, 42), b = new Sim(setup, 42);
  a.run(); b.run();
  check(a.winner === b.winner && a.t === b.t, `Determinismus Seed ${s}: Sieger ${a.winner}, Ende ${a.t.toFixed(2)} s`);
}

// 2) Balance: Anteil K.o.-Siege und mittlere Rundendauer
function balance(n) {
  let ko = 0; const d = [];
  for (let s = 0; s < 40; s++) {
    const setup = makeSetup(s * 7919 + 3, n);
    for (let k = 0; k < 10; k++) {
      const sim = new Sim(setup, (k * 2654435761 + s) >>> 0);
      sim.run();
      if (sim.reason === "last") ko++;
      d.push(sim.t);
    }
  }
  d.sort((x, y) => x - y);
  return { koShare: ko / 400, median: d[200] };
}
for (const n of [4, 6]) {
  const r = balance(n);
  console.log(`     ${n} Bälle: K.o.-Anteil ${(r.koShare * 100).toFixed(0)} %, Median ${r.median.toFixed(1)} s`);
  check(r.koShare >= 0.6, `${n} Bälle: mindestens 60 % der Runden enden per K.o.`);
  check(r.median >= 18 && r.median <= 35, `${n} Bälle: mittlere Rundendauer zwischen 18 und 35 s`);
}

// 3) Tempo: 200 Simulationen (Quoten-Berechnung) unter 1,5 s auf dem Rechner
const t0 = Date.now();
const setup = makeSetup(777, 4);
for (let k = 0; k < 200; k++) new Sim(setup, (k * 2654435761) >>> 0).run();
const ms = Date.now() - t0;
check(ms < 1500, `200 Simulationen in ${ms} ms`);

console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : "\nAlle Prüfungen bestanden");
process.exit(failed ? 1 : 0);
