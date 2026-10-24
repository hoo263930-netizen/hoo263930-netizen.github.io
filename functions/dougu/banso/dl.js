// 伴走のダウンロード：回数を1つ足してから、zipへ送る（2026年10月21日に works で作り、10月24日に今のHPへ移した）
// 回数は Cloudflare の KV（名前 DL・中身は works と同じ「works-downloads」）に入れる。KV をつなぐまでは数えずに、そのまま zip へ送る
// KEY は works のときと同じ＝数は続きから。版を上げたら FILE と KEY を直す（dougu/banso/index.html のボタンも）
const FILE = "/dougu/banso/banso-0.9.zip";
const KEY = "banso-0.9";

export async function onRequest({ env, request }) {
  if (env.DL) {
    try {
      const n = parseInt((await env.DL.get(KEY)) || "0", 10) + 1;
      await env.DL.put(KEY, String(n));
    } catch (e) {
      // 数えられなくても、ダウンロードは止めない
    }
  }
  return Response.redirect(new URL(FILE, request.url).toString(), 302);
}
