#!/usr/bin/env python3
"""ШЕФиКО: сборка индекса товаров для умного поиска.

Берёт каталог с публичного API магазина Tilda (store.tildaapi.com), ничего секретного не требуется.
Результат: docs/index.json (его читает сайт) и docs/status.json (когда и сколько).
Если собрано заметно меньше товаров, чем в прошлый раз, старый файл НЕ перезаписывается.
"""
import json, os, re, sys, time, urllib.request, urllib.parse
from datetime import datetime, timezone

SITE = "https://shefiko.ru"
API = "https://store.tildaapi.com/api"
UA = "Mozilla/5.0 (compatible; ShefikoSearchBuilder/1.0)"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
CFG = json.load(open(os.path.join(ROOT, "config.json"), encoding="utf-8"))


def get(url, retries=3, timeout=30):
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:  # noqa
            last = e
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"GET {url} -> {last}")


def api_json(path, **params):
    url = f"{API}/{path}/?" + urllib.parse.urlencode(params)
    txt = get(url)
    if txt.startswith("ERROR"):
        raise RuntimeError(f"{path}: {txt[:80]}")
    return json.loads(txt)


def valid_part(uid):
    try:
        api_json("getfilters", storepartuid=uid)
        return True
    except Exception:
        return False


def discover_parts():
    """Номера основных категорий: из конфига + страницы категорий сайта."""
    found = {str(x) for x in CFG.get("parts", [])}
    try:
        html = get(f"{SITE}/catalog")
    except Exception as e:
        print("WARN: /catalog не открылся:", e)
        return found
    slugs = sorted(set(re.findall(r'href="(?:https://shefiko\.ru)?/catalog/([a-z0-9\-]+)/?"', html)))
    slugs = [s for s in slugs if s != "tproduct"]
    print(f"категорий-страниц найдено: {len(slugs)}: {slugs}")
    cand_re = [
        r'storepartuid["\'\s:=]+["\']?(\d{9,15})',
        r'store[_-]?part(?:uid)?["\'\s:=]+["\']?(\d{9,15})',
        r'data-store-part[a-z\-]*=["\'](\d{9,15})',
    ]
    for s in slugs:
        try:
            page = get(f"{SITE}/catalog/{s}")
        except Exception as e:
            print("WARN: страница", s, e)
            continue
        cands = []
        for rx in cand_re:
            cands += re.findall(rx, page)
        if not cands:  # запасной путь: любые 12-значные числа проверяем через API
            cands = list(dict.fromkeys(re.findall(r"\b(\d{12})\b", page)))[:40]
        got = None
        for c in dict.fromkeys(cands):
            if c in found or valid_part(c):
                got = c
                break
        print(f"  {s}: {got}")
        if got:
            found.add(got)
    return found


def photo_of(p):
    g = p.get("gallery")
    if isinstance(g, str):
        g = g.strip()
        if g.startswith("["):
            try:
                g = json.loads(g)
            except Exception:
                g = None
        elif g:
            return g
    if isinstance(g, list) and g:
        first = g[0]
        return first.get("img") if isinstance(first, dict) else first
    return ""


def fetch_part(uid):
    out, sl, total = {}, 1, None
    while sl:
        d = api_json("getproductslist", storepartuid=uid, slice=sl, size=100, getparts="true")
        total = d.get("total", total)
        for p in d.get("products", []):
            out[str(p["uid"])] = p
        nxt = d.get("nextslice")
        sl = int(nxt) if nxt else 0
        if sl and sl > 200:
            break
    print(f"  часть {uid}: товаров {len(out)} (total={total})")
    return out


def part_names(uid):
    names = {}
    try:
        d = api_json("getfilters", storepartuid=uid)
        for f in d.get("filters", []):
            if f.get("name") == "storepartuid":
                for it in f.get("values", f.get("items", [])) or []:
                    if "id" in it:
                        names[str(it["id"])] = it.get("value", "")
    except Exception as e:
        print("WARN: названия категорий", uid, e)
    return names


def main():
    parts = sorted(discover_parts())
    print("основные категории:", parts)
    products, names = {}, {}
    for uid in parts:
        names.update(part_names(uid))
        try:
            products.update(fetch_part(uid))
        except Exception as e:
            print("WARN: категория", uid, e)
    cats, ci, rows = [], {}, []
    for uid, p in products.items():
        title = (p.get("title") or "").strip()
        if not title:
            continue
        pu = [str(x) for x in (p.get("partuids") or [])]
        if not pu and isinstance(p.get("parts"), list):
            pu = [str(x.get("id", x)) if isinstance(x, dict) else str(x) for x in p["parts"]]
        cat_text = " ".join(dict.fromkeys(names.get(x, "") for x in pu if names.get(x)))
        if cat_text not in ci:
            ci[cat_text] = len(cats)
            cats.append(cat_text)
        try:
            price = float(p.get("price") or 0)
            price = int(price) if price == int(price) else round(price, 2)
        except Exception:
            price = ""
        if price == 0:
            price = ""
        photo = (photo_of(p) or "").replace("https://static.tildacdn.com/", "")
        rows.append([uid, title, price, photo, ci[cat_text]])
    rows.sort(key=lambda r: r[1].lower())
    print("итого товаров:", len(rows))

    os.makedirs(DOCS, exist_ok=True)
    old_n = 0
    try:
        old_n = len(json.load(open(os.path.join(DOCS, "index.json"), encoding="utf-8"))["p"])
    except Exception:
        pass
    min_ok = max(100, int(old_n * 0.8))
    status = {"generated": datetime.now(timezone.utc).isoformat(timespec="seconds"), "products": len(rows), "previous": old_n, "parts": parts}
    if len(rows) < min_ok:
        status["error"] = f"собрано {len(rows)} < {min_ok}: индекс не обновлён"
        json.dump(status, open(os.path.join(DOCS, "status.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print("ОШИБКА:", status["error"])
        sys.exit(1)
    data = {"c": cats, "p": rows}
    with open(os.path.join(DOCS, "index.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    json.dump(status, open(os.path.join(DOCS, "status.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("OK")


if __name__ == "__main__":
    main()
