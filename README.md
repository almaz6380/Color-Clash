# Color Clash – Welche Farbe gewinnt?

Ein Physik-Tippspiel im Stil der „Which color ball will win?“-Videos – als **eine einzige HTML-Datei**,
ohne Bibliotheken, Server oder API-Keys. Läuft direkt im Handy-Browser.

## Spielen
- Lokal: `index.html` im Browser öffnen.
- Online: `https://almaz6380.github.io/Color-Clash/` (GitHub *Settings → Pages* → Branch `main`, Ordner `/ (root)`).
- Auf dem Handy wie eine App ablegen (mit eigenem Icon):
  - **iPhone (Safari):** Teilen-Knopf → *Zum Home-Bildschirm*.
  - **Android (Chrome):** Menü ⋮ → *Zum Startbildschirm hinzufügen* bzw. *App installieren*.

## Tests
- `node tests/sim.test.js` – Simulation: Determinismus, Balance, Tempo (nur Node nötig).
- `node tests/ui.test.js` – spielt beide Modi im simulierten iPhone durch (braucht Playwright).

Arbeitsanweisung für Claude Code: siehe `CLAUDE.md`.

## Zwei Modi
- **🎯 Tippen:** zuschauen und auf den Sieger wetten (Spielmünzen).
- **🕹️ Duell:** einen Ball selbst steuern und gegen Computer-Bälle überleben.

## Regeln
1. **Tippen:** Farbe wählen und Spielmünzen setzen. Die Quote wird aus 200 Probe-Simulationen berechnet.
2. **Strahlen:** Jeder Abprall an der Wand erzeugt einen Strahl, der am Ball hängt.
3. **Schneiden:** Fliegt ein gegnerischer Ball durch einen Strahl, ist der Strahl weg.
4. **Zusammenstoß:** Der Ball mit weniger Strahlen verliert die Hälfte (Gleichstand: beide −1).
   Hat der schwächere Ball höchstens noch einen Strahl, ist er **raus**. Bei Gleichstand mit 0 oder 1 Strahl
   fliegt der Ball mit weniger Abprallern raus.
5. **Sudden Death:** Ab Sekunde 22 schrumpft die Arena.
6. **Sieg:** Letzter Ball im Spiel – oder nach 40 s der Ball mit den meisten Strahlen.
7. **⚡ Boost:** Einmal pro Runde den eigenen Ball kurz beschleunigen.

## Duell
- Ball wählen (Tempo/Größe sichtbar), die anderen Bälle sind Computer-Gegner.
- **Wischen** oder **in die Arena tippen** schickt deinen Ball in diese Richtung (1,2 s Abklingzeit, Ring um den Ball).
- 3 Joker pro Runde, jeder einmal:
  - **⚡ Turbo** – kurz deutlich schneller.
  - **🛡️ Schild** – 3 s unverwundbar; schwache Gegner, die dich rammen, fliegen raus.
  - **🧲 Magnet** – zieht 2,5 s alle Gegner zu dir.
- Sieg = 30 + 10 × Stufe Münzen, Platz 2 = 10 Münzen. Mit jedem Sieg steigt die Stufe:
  Gegner werden schneller (+5 % pro Stufe) und ab Stufe 4 bzw. 7 kommt ein weiterer Gegner dazu.

Extras: 🔥 Serien-Bonus (+10 % pro richtigem Tipp in Folge, max. +50 %), 📅 Tages-Match (für alle gleich,
ein Tipp pro Tag), 💥 Chaos-Modus mit 6 Bällen (für 250 Münzen freischaltbar), 🎬 Clip-Aufnahme im 9:16-Format
für TikTok/Reels. Gespielt wird nur mit Spielmünzen, nie mit echtem Geld.

## Technik
- Canvas 2D, festes Zeitraster (1/120 s) und Seed-Zufall (mulberry32) → jede Runde ist exakt reproduzierbar.
- Quoten = 0,9 / Gewinnwahrscheinlichkeit aus 200 Simulationen mit leicht variierten Abprallwinkeln.
- Sound per WebAudio, Fortschritt in `localStorage`, Clip-Export per `MediaRecorder`.
- In der Browser-Konsole steht `window.BB` (`makeSetup`, `Sim`, `computeOdds`) zum Testen bereit.
