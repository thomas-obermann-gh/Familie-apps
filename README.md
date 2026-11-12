# Familien-Apps

Kleine Web-Apps für die Familie, ausgeliefert über GitHub Pages.

| App | Pfad | Daten |
|---|---|---|
| Eiweiß-Tagebuch | `eiweiss/` | Supabase-Projekt „familie“ (Frankfurt), Tabellen `eiweiss_*` |

Anmeldung über Supabase Auth. Zugriff auf die Daten haben nur Adressen in der Tabelle `mitglieder`
(Row Level Security). Der Schlüssel in `eiweiss/index.html` ist der öffentliche Publishable Key,
er gibt ohne Anmeldung keinen Zugriff auf Daten.

Neue App: eigenen Ordner anlegen, eigene Tabellen mit Präfix (z. B. `einkauf_*`) und dieselbe
`mitglieder`-Regel verwenden.
