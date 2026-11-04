// 短いリンク（/line・/substack）の共通の中身（2026年10月30日・数字の画面の「どこから来たか」）
// 押されたら、その日（日本の日付）・行き先・印（?from=x など）ごとに1つ足してから、行き先へ送る
// 残すのは数だけ。だれが押したか（IP・端末・名前）は残さない
// 置き場は伴走のダウンロード数と同じKV（DL）。鍵の名前は go:日付:行き先:印。数は metadata にも入れる（/go/count が一度に読めるように）
// KV をつなぐまで・数えられないときも、行き先へは必ず送る
// 資料を開いた数（takashimahjong/dl）も同じ形で数える。鍵の頭だけ dl にして、/go/count に混ざらないようにする（2026年11月4日）

// 印の一覧。ここにない印は other、印なしは none にまとめる（へんな印で置き場が増えないように）
const FROM = ["x", "threads", "notes", "post", "insta", "youtube", "note", "hp", "qr"];
// リンクの下見（Xやスレッズが投稿のときに読みにくるもの）・機械は数えない
const BOT = /bot|crawl|spider|preview|facebookexternalhit|meta-external|embedly|headless|curl|wget|python|okhttp|go-http/i;

export function fromOf(request) {
  const raw = (new URL(request.url).searchParams.get("from") || "").toLowerCase();
  return !raw ? "none" : FROM.includes(raw) ? raw : "other";
}

export function go({ env, request, waitUntil }, to, dest, kind = "go") {
  const from = fromOf(request);
  const ua = request.headers.get("user-agent") || "";
  const pre = (request.headers.get("sec-purpose") || "") + (request.headers.get("purpose") || "");
  if (env.DL && request.method === "GET" && ua && !BOT.test(ua) && !/prefetch/i.test(pre)) {
    const day = new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
    const key = `${kind}:${day}:${to}:${from}`;
    waitUntil((async () => {
      try {
        const n = parseInt((await env.DL.get(key)) || "0", 10) + 1;
        await env.DL.put(key, String(n), { metadata: { n } });
      } catch (e) {
        // 数えられなくても、送るのは止めない
      }
    })());
  }
  return new Response(null, {
    status: 302,
    headers: { location: dest(from), "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}
