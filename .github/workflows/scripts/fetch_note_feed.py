#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys, json, re, html
from urllib.request import urlopen, Request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime

NS = {
    "media": "http://search.yahoo.com/mrss/",
    "atom":  "http://www.w3.org/2005/Atom",
    "note":  "https://note.com",
    "wf":    "http://webfeeds.org/rss/1.0",
}

def text(elem, default=""):
    if elem is None:
        return default
    return (elem.text or "").strip()

def clean_excerpt(s, limit=110):
    # CDATAを含むHTMLをテキスト化
    s = html.unescape(re.sub(r"<[^>]+>", "", s or ""))
    s = re.sub(r"\s+", " ", s).strip()
    return (s[:limit] + "…") if len(s) > limit else s

def get_thumbnail(item):
    # <media:thumbnail> がテキストURL or url属性の場合に対応
    tn = item.find("media:thumbnail", NS)
    if tn is not None:
        url = tn.get("url") or text(tn, "")
        return url.strip()
    return ""

def parse_feed(xml_bytes):
    root = ET.fromstring(xml_bytes)
    channel = root.find("channel")
    last_build = text(channel.find("lastBuildDate"))
    items = []
    for it in channel.findall("item"):
        title = text(it.find("title"))
        link  = text(it.find("link"))
        desc  = text(it.find("description"))
        pub   = text(it.find("pubDate"))
        thumb = get_thumbnail(it)

        try:
            iso = parsedate_to_datetime(pub).isoformat()
        except Exception:
            iso = ""

        items.append({
            "title": title,
            "link": link,
            "thumbnail": thumb,
            "pubDate": pub,
            "isoDate": iso,
            "excerpt": clean_excerpt(desc),
        })

    # pubDate降順に
    items.sort(key=lambda x: x.get("isoDate",""), reverse=True)
    return {"source":"note_magazine","lastBuildDate":last_build,"items":items}

def main():
    if len(sys.argv) < 3:
        print("Usage: fetch_note_feed.py <rss_url> <out_json>", file=sys.stderr)
        sys.exit(1)
    rss_url = sys.argv[1]
    out_path = sys.argv[2]

    req = Request(rss_url, headers={"User-Agent":"Mozilla/5.0"})
    with urlopen(req, timeout=30) as r:
        data = r.read()

    feed = parse_feed(data)
    # 上位3件のみ保存（必要に応じて増減可能）
    feed["items"] = feed["items"][:3]

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(feed, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
