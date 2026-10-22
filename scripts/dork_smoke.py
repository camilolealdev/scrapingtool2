"""Prueba real de dorks desde TU máquina (necesita internet abierto a buscadores).
Uso (Windows):  py -m pip install "scrapling[fetchers]" ddgs requests beautifulsoup4
                py scripts/dork_smoke.py dentista bogota co
Para cada tipo de dork reporta cuántos resultados devuelve cada motor y marca los que dan 0.
No guarda nada; espera ~3 s entre consultas para no ser bloqueado."""
import sys, os, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import dorking_scraper as d

niche = sys.argv[1] if len(sys.argv) > 1 else "dentista"
city = sys.argv[2] if len(sys.argv) > 2 else "bogota"
region = sys.argv[3] if len(sys.argv) > 3 else "co"
engines = [("ddg", d.search_ddg), ("brave", d.search_brave), ("bing", lambda q, r, n: d.search_bing(q, r, n)), ("yandex", d.search_yandex)]

dorks = d.build_dorks(niche, city, region)
print(f"{len(dorks)} dorks para {niche}/{city}/{region}\n")
zero = []
for i, q in enumerate(dorks, 1):
    row = []
    for name, fn in engines:
        try:
            n = len(fn(q, region, 5))
        except Exception as e:
            n = -1
        row.append(f"{name}={n}")
        time.sleep(3)
    flag = "  <-- 0 en todos" if all(x.endswith("=0") or x.endswith("=-1") for x in row) else ""
    if flag:
        zero.append(q)
    print(f"[{i:02d}] {' '.join(row)}  {q[:90]}{flag}")
print(f"\nDorks sin resultados en ningún motor: {len(zero)}/{len(dorks)}")
for q in zero:
    print("  -", q)
