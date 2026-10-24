// 配布物のダウンロード回数を見る（/dougu/count）。2026年10月21日に works で作り（/haifu/count）、10月24日に今のHPへ移した
export async function onRequest({ env }) {
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
  if (!env.DL) return new Response(JSON.stringify({ note: "KV（DL）がまだつながっていません" }), { headers });
  const out = {};
  for (const k of (await env.DL.list()).keys) out[k.name] = Number(await env.DL.get(k.name));
  return new Response(JSON.stringify(out, null, 1), { headers });
}
