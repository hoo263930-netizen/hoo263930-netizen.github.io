// scripts/fetch_note.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { parseStringPromise as parseXML } from 'xml2js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEED = 'https://note.com/loyal_dill1011/rss';

const getOgImage = async (url) => {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
    const html = await res.text();
    const m = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    return m?.[1] || '';
  } catch { return ''; }
};

(async () => {
  const xml = await (await fetch(FEED)).text();
  const rss = await parseXML(xml, { explicitArray:false, ignoreAttrs:false, mergeAttrs:true });
  const items = [].concat(rss?.rss?.channel?.item || []).slice(0, 12);

  const out = [];
  for (const it of items) {
    const link = it.link;
    const title = it.title;
    const pubDate = it.pubDate;

    // RSS内の画像候補
    let img =
      it?.['media:thumbnail']?.url ||
      it?.enclosure?.url ||
      (it?.description?.match(/<img[^>]+src="([^"]+)"/)?.[1]) || '';

    // だめならOG画像
    if (!img && link) img = await getOgImage(link);

    out.push({ title, link, pubDate, image: img });
  }

  const dest = path.join(__dirname, '..', 'assets', 'note_feed.json');
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, JSON.stringify({ updatedAt: new Date().toISOString(), items: out }, null, 2));
  console.log('Saved:', dest);
})();
