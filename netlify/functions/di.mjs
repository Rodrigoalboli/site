// Curva de juros DI1 (futuro de DI da B3), servida em /api/di.
// A B3 não libera CORS, então o navegador busca por aqui.

const B3_URL = "https://cotacao.b3.com.br/mds/api/v1/DerivativeQuotation/DI1";

export default async () => {
  try {
    const res = await fetch(B3_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`B3 respondeu ${res.status}`);
    const data = await res.json();

    const today = new Date().toISOString().slice(0, 10);
    const curve = (data.Scty || [])
      .map((s) => {
        const q = s.SctyQtn || {};
        const live = q.curPrc;
        const rate = live ?? q.prvsDayAdjstmntPric;
        return {
          symbol: s.symb,
          maturity: s.asset?.AsstSummry?.mtrtyCode,
          rate,
          source: live != null ? "último negócio" : "ajuste anterior",
        };
      })
      .filter((c) => c.maturity && c.maturity > today && typeof c.rate === "number")
      .sort((a, b) => a.maturity.localeCompare(b.maturity));

    if (!curve.length) throw new Error("Curva vazia");

    return Response.json(
      { updatedAt: data.Msg?.dtTm ?? null, curve },
      {
        headers: {
          "Cache-Control": "public, max-age=300",
          "Netlify-CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    return Response.json({ error: String(err.message || err) }, { status: 502 });
  }
};

export const config = { path: "/api/di" };
