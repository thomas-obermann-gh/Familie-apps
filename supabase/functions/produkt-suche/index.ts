// Sucht ein Produkt per Barcode bei Open Food Facts und liefert Name und Nährwerte pro 100 g.
// Aufruf aus der App: sb.functions.invoke("produkt-suche", { body: { code: "4008400401621" } })
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function antwort(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

function zahl(v: unknown): number | null {
  if (typeof v === "number" && isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && isFinite(Number(v.replace(",", ".")))) return Number(v.replace(",", "."));
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  let code = "";
  try {
    const body = await req.json();
    code = String(body?.code ?? "").replace(/\D/g, "");
  } catch {
    code = "";
  }
  if (code.length < 6 || code.length > 14) return antwort({ fehler: "ungueltiger_barcode" }, 400);

  const felder = "product_name,product_name_de,generic_name_de,brands,quantity,serving_size,serving_quantity,nutriments";
  let r: Response;
  try {
    r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${felder}`, {
      headers: { "User-Agent": "FamilieApps-Eiweiss/1.0 (private Familien-App)" },
    });
  } catch {
    return antwort({ fehler: "dienst_nicht_erreichbar" }, 502);
  }
  if (r.status === 404) return antwort({ gefunden: false, code });
  if (!r.ok) return antwort({ fehler: "dienst_fehler", status: r.status }, 502);

  const d = await r.json().catch(() => null);
  const p = d?.product;
  if (!d || d.status !== 1 || !p) return antwort({ gefunden: false, code });

  const n = p.nutriments ?? {};
  let kcal = zahl(n["energy-kcal_100g"]);
  const kj = zahl(n["energy-kj_100g"]) ?? zahl(n["energy_100g"]);
  if (kcal == null && kj != null) kcal = Math.round((kj / 4.184) * 10) / 10;

  return antwort({
    gefunden: true,
    code,
    name: String(p.product_name_de || p.product_name || p.generic_name_de || "").trim(),
    marke: String(p.brands || "").split(",")[0].trim(),
    menge: String(p.quantity || "").trim(),
    portion: String(p.serving_size || "").trim(),
    portion_g: zahl(p.serving_quantity),
    eiweiss: zahl(n["proteins_100g"]),
    kcal,
  });
});
