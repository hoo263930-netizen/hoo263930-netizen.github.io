// 短いリンク /substack → Substack（@kosen3）の登録ページ（2026年10月30日）
// 投稿に貼るときは印をつける：/substack?from=x など（印の一覧は go/lib.js）
// 印があれば utm_source にも渡す（Substackの管理画面の数でも、どこから登録したかが見えるように）
import { go } from "./go/lib.js";

const SUBSCRIBE = "https://kosen3.substack.com/subscribe";

export const onRequest = (ctx) => go(ctx, "substack", (from) =>
  from === "none" || from === "other" ? SUBSCRIBE : `${SUBSCRIBE}?utm_source=${from}&utm_medium=shortlink`);
