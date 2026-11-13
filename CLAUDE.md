# CLAUDE.md – Projekt „color-clash“

Diese Datei ist die Arbeitsanweisung für jede Claude-Code-Sitzung in diesem Repo. Lies sie komplett,
bevor du etwas änderst.

## Worum es geht

Ein Physik-Spiel fürs Handy im Stil der viralen „Which color ball will win?“-Videos: farbige Bälle
kämpfen in einer Kreis-Arena. Man **tippt auf den Sieger** (Modus Tippen) oder **steuert selbst einen
Ball** (Modus Duell). Läuft als Web-App im Handy-Browser, veröffentlicht über GitHub Pages unter
`https://almaz6380.github.io/color-clash/`.

**Stand:** Ein fertiger, getesteter Prototyp liegt als `index.html` im Repo. Er stammt aus dem Repo
`almaz6380/brainstorm` (Branch `claude/admiring-faraday-vea7ur`). Baue darauf auf – nicht neu schreiben.

## Feste Regeln (nicht verhandelbar)

- **Eine Datei:** Das ganze Spiel bleibt in `index.html` (HTML + CSS + JavaScript). Keine Build-Tools,
  kein npm-Paket im Spiel, keine Bibliotheken, keine Server, **keine API-Keys**, keine Kosten.
- **Nur Spielmünzen.** Nie echtes Geld, keine Käufe, keine Werbung ohne ausdrückliche Anweisung.
- **Deutsch** für alle Texte im Spiel, in Kommentaren und in Commit-Nachrichten.
- **Handy zuerst:** Hochformat 9:16, Bedienung mit dem Daumen, muss auf iPhone-Safari und
  Android-Chrome laufen.
- **Wiederholbar:** Die Simulation muss deterministisch bleiben (gleicher Seed ⇒ gleicher Ablauf).
  Nie `Math.random()` innerhalb von `Sim` verwenden – nur den Seed-Zufall `this.rng`.
- **Eigenes Spiel:** Regeln, Grafik und Namen sind eigene. Nichts von bestehenden Spielen oder
  bestimmten Videos kopieren (keine Namen, Figuren, Grafiken, Musik).
- `localStorage` immer in try/catch – das Spiel muss auch ohne Speicher laufen.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Das komplette Spiel |
| `README.md` | Spielregeln für Menschen + Anleitung GitHub Pages |
| `CLAUDE.md` | Diese Arbeitsanweisung |
| `tests/sim.test.js` | Prüft Simulation ohne Browser: Determinismus, Balance, Tempo (`node tests/sim.test.js`) |
| `.gitignore` | Hält Screenshots und `node_modules/` aus dem Repo |
| `manifest.webmanifest` | App-Name, Farben, Icons für „Zum Home-Bildschirm“ |
| `icons/` | `icon.svg` (Vorlage) + daraus erzeugte PNGs 180/192/512 px |
| `tests/ui.test.js` | Spielt beide Modi im simulierten iPhone durch, macht Screenshots (`node tests/ui.test.js`, braucht Playwright) |

`tests/sim.test.js` liest den Code zwischen `const BALL_DEFS` und `/** Gewinnchancen` aus
`index.html`. Diese beiden Marker nicht umbenennen, sonst Test anpassen.

## Spielregeln (so ist es umgesetzt)

Arena-Radius = 1. Fester Zeitschritt 1/120 s, Seed-Zufall mulberry32.

1. **Start:** 4 Bälle (Chaos: 6) mit zufälligem Tempo 0,55–0,95/s, Radius 0,045–0,075, Position,
   Richtung und 2 Start-Strahlen – alles aus `makeSetup(seed, n)`.
2. **Strahlen:** Jeder Wand-Abprall erzeugt einen Strahl (Linie Ball → Aufprallpunkt), der am Ball
   hängt. Max. 60 pro Ball. Abprallwinkel bekommt Zufall ±0,175 rad.
3. **Schneiden:** Fliegt ein gegnerischer Ball durch einen Strahl, verschwindet der Strahl.
4. **Zusammenstoß** (pro Paar höchstens alle 0,35 s): Ball mit weniger Strahlen verliert die Hälfte
   (aufgerundet); Gleichstand: beide −1.
5. **Raus:** Hat der schwächere Ball höchstens 1 Strahl, scheidet er aus. Gleichstand bei 0/1 Strahl:
   der mit weniger Abprallern (dann: langsamere) fliegt raus.
6. **Sudden Death:** ab 22 s schrumpft die Arena linear bis 40 s auf Radius 0,55.
7. **Sieg:** letzter Ball – sonst nach 40 s die meisten Strahlen, dann die meisten Abpraller.

**Balance-Ziel** (prüft `tests/sim.test.js`): ≥ 60 % der Runden enden per K.o., mittlere Dauer
18–35 s. Aktuell: 4 Bälle 75 % / 23 s, 6 Bälle 70 % / 28 s. Gewinne sind gleichmäßig über die Farben
verteilt (geprüft mit 600 Runden).

## Modus Tippen

- Vorschau der Aufstellung (Arena verkleinert über dem Panel, Richtungspfeile).
- **Quoten:** 200 Probe-Simulationen derselben Aufstellung mit anderen Lauf-Seeds;
  Quote = 0,9 ÷ Gewinnwahrscheinlichkeit, begrenzt auf 1,1×–25×.
- Einsatz 10 / 25 / 50 / Alles, Startguthaben 100, unter 10 Münzen gibt es 50 geschenkt.
- **Boost** einmal pro Runde (eigener Ball kurz schneller).
- **Serie:** +10 % Gewinn pro richtigem Tipp in Folge, max. +50 %.
- **Tages-Match:** Seeds aus dem Datum ⇒ für alle gleich, ein Tipp pro Tag, Ergebnis teilbar.
- **Chaos:** 6 Bälle, einmalig für 250 Münzen freischaltbar.
- **Clip:** Aufnahme der Runde mit Ton als 9:16-Video (mp4 oder webm je nach Browser).

## Modus Duell

- Spieler wählt einen Ball (Tempo/Größe als Balken); die anderen sind Computer-Bälle ohne eigene
  Steuerung.
- **Lenken:** Wischen ⇒ Ball fliegt in Wischrichtung; kurzes Tippen ⇒ Ball fliegt zum Finger.
  Abklingzeit 1,2 s (Ring um den Ball).
- **Joker** je einmal pro Runde: Turbo (Tempo kurz bis +110 %, ca. 2 s), Schild (3 s keine Verluste,
  kann nicht ausscheiden; schwacher Angreifer mit ≤ 1 Strahl fliegt raus), Magnet (2,5 s alle Gegner
  zum eigenen Ball ziehen).
- **Stufen:** Sieg ⇒ Stufe +1. Gegner-Tempo +5 % pro Stufe (max. +50 %). Gegnerzahl 3 (Stufe 1–3),
  4 (4–6), 5 (ab 7). Belohnung: Sieg 30 + 10 × Stufe, Platz 2 = 10 Münzen.

## Aufbau von `index.html`

| Baustein | Aufgabe |
| --- | --- |
| `makeSetup(seed, n)` | Aufstellung aus Seed |
| `class Sim` | Physik. `step()` = ein Zeitschritt, `run()` = ganze Runde ohne Grafik. Steuerung: `boost`, `steer`, `shield`, `magnet`. Ereignisse in `events` (nur wenn `record = true`) |
| `computeOdds(setup)` | 200 Simulationen in Häppchen (bleibt flüssig), liefert Quoten |
| `store` / `state` / `save()` | Münzen, Serie, Stufe, Freischaltungen in `localStorage` (Präfix `bb_`) |
| `render()` | Zeichnet jedes Bild: Hintergrund, Arena, Strahlen, Bälle, Partikel, Timer, Rangliste |
| `handleEvents()` | Ereignisse ⇒ Töne (WebAudio), Partikel, Hinweise |
| `newRound` / `startFight` / `startDuel` / `showResult` | Spielablauf |
| `startRecording` / `stopRecording` | Clip-Aufnahme |
| `window.BB` | Zugriff für Tests in der Konsole |

Zeichenfläche 720 × 1280, per CSS skaliert. UI-Panels sind HTML über dem Canvas.

## Aufgaben – in dieser Reihenfolge

### 1. Repo einrichten ✅ erledigt
- Prüfen, dass `index.html`, `README.md`, `CLAUDE.md`, `.gitignore`, `tests/` im Repo-Root liegen.
- Beide Tests ausführen; beide müssen grün sein.
- **Fertig, wenn:** Tests grün, Commit gepusht.

### 2. Spielname festlegen ✅ erledigt
- Der User hat entschieden: Das Spiel heißt **„Color Clash“** (`<title>`, Regeln-Text, Teilen-Text,
  Clip-Dateiname `color-clash.*`, README).
- Der `localStorage`-Präfix `bb_` und `window.BB` bleiben absichtlich unverändert (sonst geht
  gespeicherter Fortschritt verloren).

### 3. Auf echten Handys testbar machen (Manifest + Icon ✅, Branch `main` ✅ – offen: Pages-Einstellung, Handy-Test durch den User)
- Sicherstellen, dass GitHub Pages läuft (Settings → Pages → Branch `main`, Ordner `/ (root)`).
- Optional: `manifest.webmanifest` + Icon (als Inline-SVG oder kleine PNG im Repo), damit
  „Zum Home-Bildschirm“ wie eine App aussieht. Kein Service-Worker nötig.
- **Fertig, wenn:** Seite unter der Pages-Adresse lädt; User hat auf iPhone/Android gespielt.

### 4. Duell-Schwierigkeit ausbalancieren
- Bisher: Stufe 1 wirkt eher leicht (im Test gewann schon wahlloses Wischen).
- Messen statt raten: in `tests/` ein Skript, das einen einfachen Bot (z. B. alle 1,2 s zufällig
  lenken) über je 200 Runden pro Stufe spielen lässt und die Siegquote ausgibt.
- Ziel: Stufe 1 ≈ 50–60 % Siegquote für den Zufalls-Bot, ab Stufe 7 ≈ 15–25 %.
- Stellschrauben: `cpuMult`, Gegnerzahl, `STEER_CD`, Joker-Dauern.
- **Fertig, wenn:** Skript im Repo, Werte erreicht, Tipp-Modus-Balance unverändert (`sim.test.js` grün).

### 5. Mehr zum Freischalten
- Neue Arenen: Quadrat und Sechseck (Wand-Abprall + Strahl-Ankerpunkte für Polygone; Sudden Death
  skaliert das Polygon). Freischaltbar mit Münzen, wählbar in Tippen und Duell.
- Ball-Skins (z. B. Muster, Leuchtspur) als Belohnung für Duell-Stufen.
- **Fertig, wenn:** beides wählbar, Fortschritt gespeichert, Tests angepasst und grün.

### 6. Später (nur auf Anweisung)
- Computer-Gegner im Duell, die selbst lenken (ab höheren Stufen).
- Video-Generator: Regeln, Farben, Titeltext wählen ⇒ fertige Clips für TikTok/Reels.
- Als Store-App verpacken (z. B. Capacitor) – erst, wenn die Web-Version gut ankommt
  (kostet: Apple 99 $/Jahr, Google 25 $ einmalig).

## Arbeitsweise

- Vor jedem Commit: `node tests/sim.test.js` und `node tests/ui.test.js` – beide grün.
- Bei UI-Änderungen die Screenshots in `tests/screenshots/` ansehen (Überlappungen, Lesbarkeit).
- Wer an der Simulation dreht: Balance-Ausgabe von `sim.test.js` vorher/nachher vergleichen und
  im Commit nennen.
- Kleine, klare Commits auf Deutsch, z. B. „Duell: Gegner ab Stufe 7 schneller“.
- Nach jeder Aufgabe dem User kurz sagen, was sich geändert hat und wie man es ausprobiert.
