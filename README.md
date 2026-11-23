# Familien-Apps

Kleine Web-Apps für die Familie, ausgeliefert über GitHub Pages.

| App | Pfad | Daten |
|---|---|---|
| Eiweiß-Tagebuch | `eiweiss/` | Supabase-Projekt „familie“ (Frankfurt), Tabellen `eiweiss_*` |
| Vorrat | `vorrat/` | Supabase-Projekt „familie“, Tabellen `vorrat_*` (Orte, Produkte per Barcode, Bestand) |

Vorrat: Barcode-Scan über die Handykamera (BarcodeDetector, sonst Polyfill `barcode-detector`),
Produktname und Bild aus Open Food Facts. Gescannte Produkte werden in `vorrat_produkte` gemerkt.
Änderungen werden im Gerät zwischengespeichert und nachgereicht, wenn kein Netz da ist (`vorrat/sw.js`
macht die App auch offline startbar).

Anmeldung über Supabase Auth. Zugriff auf die Daten haben nur Adressen in der Tabelle `mitglieder`
(Row Level Security). Der Schlüssel in `eiweiss/index.html` ist der öffentliche Publishable Key,
er gibt ohne Anmeldung keinen Zugriff auf Daten.

Neue App: eigenen Ordner anlegen, eigene Tabellen mit Präfix (z. B. `einkauf_*`) und dieselbe
`mitglieder`-Regel verwenden.

## Barcode (Eiweiß-Tagebuch)

- Scannen im Blatt „Essen suchen“ → „Barcode scannen“. Android/Chrome nutzt den eingebauten
  Barcode-Scanner des Browsers, andere Geräte laden ZXing nach. Nummer eintippen geht immer.
- Bekannter Barcode → direkt zur Menge. Unbekannt → Edge Function `produkt-suche`
  (Quelltext unter `supabase/functions/produkt-suche/`) fragt Open Food Facts nach Name und
  Nährwerten pro 100 g. Die Werte werden vor dem Speichern angezeigt und sollen mit der Packung
  verglichen werden. Alternativ wird der Barcode einem vorhandenen Lebensmittel zugeordnet.
- „Später ergänzen lassen“ legt das Produkt mit `offen = true` und ohne Werte an. Einträge
  dafür werden mit Eiweiß 0 gespeichert und automatisch nachgerechnet, sobald `p` gesetzt
  wird (Trigger `eiweiss_eintraege_nachrechnen`). Nachtragen per SQL:
  `update eiweiss_lebensmittel set p = …, k = …, quelle = 'claude' where name = '…';`
