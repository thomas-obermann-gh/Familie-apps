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
