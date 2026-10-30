// 短いリンク /line → 全国版の公式LINE（遊べるお寺プロジェクト｜全国）の友だち追加（2026年10月30日）
// 投稿に貼るときは印をつける：/line?from=threads など（印の一覧は go/lib.js）
import { go } from "./go/lib.js";

export const onRequest = (ctx) => go(ctx, "line", () => "https://lin.ee/Z4hBJBe");
