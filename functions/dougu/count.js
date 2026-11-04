// 配布物のダウンロード回数を見る（/dougu/count）。2026年10月21日に works で作り（/haifu/count）、10月24日に今のHPへ移した
// たかしまーじゃんの資料（鍵が dl: のもの・11/4）は、資料ごとの合計と「月ごと」（月→資料→印→数）で出す。実績の1枚はこの数から作る
export async function onRequest({ env }) {
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
  if (!env.DL) return new Response(JSON.stringify({ note: "KV（DL）がまだつながっていません" }), { headers });
  const out = {};
  const months = {};
  let cursor;
  do {
    const r = await env.DL.list({ cursor });
    for (const k of r.keys) {
      if (k.name.startsWith("go:")) continue; // 短いリンクの数（/go/count で見る・10/30）は出さない
      if (k.name.startsWith("dl:")) {
        const [, day, name, from] = k.name.split(":");
        const n = k.metadata && k.metadata.n != null ? k.metadata.n : Number(await env.DL.get(k.name));
        out[name] = (out[name] || 0) + n;
        const m = ((months[day.slice(0, 7)] ||= {})[name] ||= {});
        m[from] = (m[from] || 0) + n;
        continue;
      }
      out[k.name] = Number(await env.DL.get(k.name));
    }
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  if (Object.keys(months).length) out["月ごと"] = months;
  return new Response(JSON.stringify(out, null, 1), { headers });
}
