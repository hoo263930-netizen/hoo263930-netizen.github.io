// 短いリンクの押された数を見る（/go/count・2026年10月30日）。数字の画面（こーせんのPCの中）の「数字更新.bat」が読む
// 形：{ "日付": { "line": { "threads": 2 }, "substack": { "x": 1 } } }。数だけで、だれが押したかは入っていない
export async function onRequest({ env }) {
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" };
  if (!env.DL) return new Response(JSON.stringify({ note: "KV（DL）がまだつながっていません" }), { headers });
  const out = {};
  let cursor;
  do {
    const r = await env.DL.list({ prefix: "go:", cursor });
    for (const k of r.keys) {
      const [, day, to, from] = k.name.split(":");
      const n = k.metadata && k.metadata.n != null ? k.metadata.n : Number(await env.DL.get(k.name));
      ((out[day] ||= {})[to] ||= {})[from] = n;
    }
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return new Response(JSON.stringify(out, null, 1), { headers });
}
