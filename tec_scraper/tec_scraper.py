#!/usr/bin/env python3
"""
tec_scraper.py — Scraper genérico de planes de estudio del TEC
==============================================================

Uso:
    python tec_scraper.py <url-del-plan-de-estudios> [clave] [--json] [--js] [--stdout]

Ejemplos:
    python tec_scraper.py https://www.tec.ac.cr/licenciatura-ingenieria-fisica fisica
    python tec_scraper.py https://www.tec.ac.cr/licenciatura-ingenieria-electronica-0 electronica
    python tec_scraper.py https://www.tec.ac.cr/bachillerato-ingenieria-computadores computacion --stdout

Salida (por defecto genera ambos):
    <clave>_plan.json   — array JSON de cursos
    <clave>_plan.js     — fragmento JS listo para pegar en el proyecto

Requisitos:
    pip install requests beautifulsoup4
"""

import re
import sys
import json
import argparse
from pathlib import Path
from collections import Counter

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Faltan dependencias. Instalá con:\n  pip install requests beautifulsoup4")
    sys.exit(1)


# ── Fetch ──────────────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "es-CR,es;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.tec.ac.cr/carreras",
}

RE_CODE = re.compile(r'[A-Z]{2,4}\d{4}', re.IGNORECASE)


def fetch_html(url: str) -> str:
    print(f"  Descargando: {url}")
    r = requests.get(url, headers=HEADERS, timeout=20)
    r.raise_for_status()
    return r.text


# ── Parser ─────────────────────────────────────────────────────────────────────

def parse_html(html: str) -> list[dict]:
    """
    Extrae los cursos del HTML del TEC usando las clases CSS de la página.

    Estructura del DOM (igual para todas las carreras del TEC):

        div.slider.slider-single
          div  ← un hijo directo por bloque (índice = número de bloque)
            div.box  ← un box por curso
              span.central
                span.title
                  span.code      ← "MA1102"
                  span.name      ← "cálculo diferencial e integral"
              span.circles
                span.block [0]   → span.circle = créditos
                span.block [1]   → span.circle = horas
              span.requirements
                span.requirement
                  span.label3    ← "No hay" | "XX1234, YY5678"
                span.corequirement
                  span.label3    ← "No hay" | "XX1234, YY5678"
    """
    soup = BeautifulSoup(html, "html.parser")

    single = soup.find("div", class_="slider-single")
    if not single:
        return []

    # Cada div hijo directo = un bloque (Bloque 0, Bloque 1, ...)
    bloque_divs = [c for c in single.children if getattr(c, "name", None) == "div"]

    courses = []

    for block_num, bdiv in enumerate(bloque_divs):
        for box in bdiv.find_all("div", class_="box"):

            code_tag = box.find("span", class_="code")
            name_tag = box.find("span", class_="name")
            if not code_tag or not name_tag:
                continue

            cid  = code_tag.get_text(strip=True).upper()
            name = name_tag.get_text(strip=True).lower()

            # Créditos y horas — primer y segundo span.circle
            circles = box.find_all("span", class_="circle")
            cred = int(circles[0].get_text(strip=True)) if len(circles) > 0 else 0
            hrs  = int(circles[1].get_text(strip=True)) if len(circles) > 1 else 0

            # Requisitos y correquisitos
            req_tag   = box.find("span", class_="requirement")
            coreq_tag = box.find("span", class_="corequirement")
            reqs   = _parse_ids(req_tag.find("span",   class_="label3")) if req_tag   else []
            coreqs = _parse_ids(coreq_tag.find("span", class_="label3")) if coreq_tag else []

            courses.append({
                "id":      cid,
                "block":   block_num,
                "name":    name,
                "cred":    cred,
                "hrs":     hrs,
                "reqs":    reqs,
                "coreqs":  coreqs,
                "userSem": block_num,
            })

    return courses


def _parse_ids(tag) -> list[str]:
    """Extrae lista de códigos de curso de un span.label3."""
    if not tag:
        return []
    text = tag.get_text(strip=True)
    if not text or text.lower() == "no hay":
        return []
    return [x.upper() for x in RE_CODE.findall(text)]


# ── Salida ─────────────────────────────────────────────────────────────────────

def to_js(courses: list[dict], key: str) -> str:
    """Genera el fragmento JS listo para pegar en el proyecto."""
    out = [f"            {key}: ["]
    cur_block = None

    for c in courses:
        if c["block"] != cur_block:
            cur_block = c["block"]
            out.append(f"                // BLOQUE {cur_block} ")

        reqs_s   = ", ".join(f"'{r}'" for r in c["reqs"])
        coreqs_s = ", ".join(f"'{r}'" for r in c["coreqs"])
        name_t   = c["name"].title()

        out.append(
            f"                {{ id: '{c['id']}', block: {c['block']}, "
            f"name: '{name_t}', cred: {c['cred']}, hrs: {c['hrs']}, "
            f"reqs: [{reqs_s}], coreqs: [{coreqs_s}], userSem: {c['userSem']} }},"
        )

    out.append("            ],")
    return "\n".join(out)


def print_summary(courses: list[dict], url: str, key: str):
    print(f"\n  Carrera : {key}")
    print(f"  URL     : {url}")
    print(f"  Cursos  : {len(courses)}")
    blocks = Counter(c["block"] for c in courses)
    for b in sorted(blocks):
        print(f"    Bloque {b:2d}: {blocks[b]} cursos")


# ── CLI ────────────────────────────────────────────────────────────────────────

def slug_from_url(url: str) -> str:
    """Deriva una clave corta del slug del URL."""
    slug = url.rstrip("/").split("/")[-1]
    for prefix in ("licenciatura-", "bachillerato-", "ingenieria-", "en-"):
        slug = slug.replace(prefix, "")
    return "_".join(slug.split("-")[:2])


def main():
    parser = argparse.ArgumentParser(
        description="Scraper genérico de planes de estudio del TEC",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("url",  help="URL de la página del plan de estudios")
    parser.add_argument("key",  nargs="?", default=None,
                        help="Clave JS para el array (ej: fisica). "
                             "Si se omite, se deriva del URL.")
    parser.add_argument("--json",   action="store_true", dest="out_json",
                        help="Generar archivo JSON")
    parser.add_argument("--js",     action="store_true", dest="out_js",
                        help="Generar archivo JS")
    parser.add_argument("--stdout", action="store_true",
                        help="Imprimir el JS en pantalla además de guardarlo")
    args = parser.parse_args()

    # Sin flags explícitos → generar ambos formatos
    if not args.out_json and not args.out_js:
        args.out_json = args.out_js = True

    key = args.key or slug_from_url(args.url)

    print("\n[ TEC Plan Scraper ]")
    html    = fetch_html(args.url)
    courses = parse_html(html)

    if not courses:
        print("\n⚠  No se encontraron cursos.")
        print("   Verificá que la URL sea la página del plan de estudios.")
        sys.exit(1)

    print_summary(courses, args.url, key)

    base = Path(f"{key}_plan")

    if args.out_json:
        path = base.with_suffix(".json")
        path.write_text(json.dumps(courses, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\n  ✓ {path}")

    if args.out_js:
        js_text = to_js(courses, key)
        path = base.with_suffix(".js")
        path.write_text(js_text, encoding="utf-8")
        print(f"  ✓ {path}")

        if args.stdout:
            print("\n" + "─" * 60)
            print(js_text)

    print()


if __name__ == "__main__":
    main()
