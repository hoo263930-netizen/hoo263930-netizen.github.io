// たかしまーじゃんの資料を開く：回数を1つ足してから、資料へ送る（2026年11月4日・重いタスク98）
// 数え方は短いリンクと同じ（go/lib.js）：下見の機械は数えない・残すのは数だけ・数えられなくても資料へは必ず送る
// 鍵の名前は dl:日付:資料:印 にして、/go/count（数字の画面が読む）に混ざらないようにする。数は /dougu/count で見る
// 資料の住所そのもの（/takashimahjong/handbook.pdf など）は今までどおり開く。ここを通らない分は数えない
// 資料を足したら、ここに1行足す（ページのリンクは /takashimahjong/dl/名前?from=hp）
import { go } from "../../go/lib.js";

const FILES = {
  handbook: "/takashimahjong/handbook.pdf",
  ippan: "/takashimahjong/ippan-mahjong.pdf",
  shokyu: "/images/takashimahjong/shokyu.jpg",
  chukyu: "/images/takashimahjong/chukyu.jpg",
  jokyu: "/images/takashimahjong/jokyu.jpg",
  yomikata: "/images/takashimahjong/pai-yomikata.jpg",
  agari: "/images/takashimahjong/agari-rei.jpg",
};

export function onRequest(ctx) {
  const { name } = ctx.params;
  const url = (path) => new URL(path, ctx.request.url).toString();
  if (!Object.hasOwn(FILES, name)) return Response.redirect(url("/takashimahjong/"), 302); // 知らない名前は数えない
  return go(ctx, `takashimahjong-${name}`, () => url(FILES[name]), "dl");
}
