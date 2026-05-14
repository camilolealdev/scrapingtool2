import { Star, Search, Filter } from "lucide-react";

interface Props {
  TEMPLATES: any;
  activeCategory: string;
  setActiveCategory: (k: string) => void;
  fillTemplate: (q: string) => string;
  favorites: string[];
  toggleFavorite: (q: string) => void;
  openSearch: (query: string, engine?: string) => void;
  setScrapeQuery: (q: string) => void;
  setTab: (t: string) => void;
  dorkSearch: string;
  setDorkSearch: (v: string) => void;
  dorkOpFilter: string;
  setDorkOpFilter: (v: string) => void;
}

export default function TemplateList({ TEMPLATES, activeCategory, setActiveCategory, fillTemplate, favorites, toggleFavorite, openSearch, setScrapeQuery, setTab, dorkSearch, setDorkSearch, dorkOpFilter, setDorkOpFilter }: Props) {
  const filteredDorks = Object.values(TEMPLATES)
    .flatMap((cat: any) => cat.templates.map((t: any) => ({ ...t, catColor: cat.color })))
    .filter((t: any) => {
      const matchesSearch = !dorkSearch ||
        t.name.toLowerCase().includes(dorkSearch.toLowerCase()) ||
        t.desc.toLowerCase().includes(dorkSearch.toLowerCase()) ||
        t.query.toLowerCase().includes(dorkSearch.toLowerCase());
      let matchesOp = true;
      if (dorkOpFilter === "all") matchesOp = true;
      else if (dorkOpFilter === "email") matchesOp = t.query.includes("@") || t.query.toLowerCase().includes("email");
      else if (dorkOpFilter === "phone") matchesOp = t.query.includes("tel") || t.query.includes("phone") || t.query.includes("celular");
      else matchesOp = t.query.toLowerCase().includes(dorkOpFilter.toLowerCase());
      return matchesSearch && matchesOp;
    });

  const renderHighlightedQuery = (q: string) => {
    if (!q) return null;
    return q.split(/(\b(?:site|intitle|inurl|filetype|before|after|AROUND):|OR|AND|-\w+|"[^"]*"|\{[^}]+\})/g)
      .map((p, i) => {
        if (/^(site|intitle|inurl|filetype|before|after|AROUND):$/i.test(p)) return <span key={i} className="text-orange-brand font-bold">{p}</span>;
        if (p === "OR" || p === "AND") return <span key={i} className="text-orange-brand font-bold">{p}</span>;
        if (p.startsWith("-")) return <span key={i} className="text-green-brand">{p}</span>;
        if (p.startsWith('"')) return <span key={i} className="text-pink-brand">{p}</span>;
        if (p.startsWith("{")) return <span key={i} className="text-t2 italic">{p}</span>;
        return <span key={i}>{p}</span>;
      });
  };

  return (
    <>
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TEMPLATES).map(([k, c]: any) => {
            const isActive = activeCategory === k;
            return (
              <button
                key={k}
                onClick={() => setActiveCategory(k)}
                className={`flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg border text-[10px] font-semibold tracking-wide transition-all duration-150 whitespace-nowrap
                  ${isActive ? 'text-white' : 'bg-bg1 border-b0 text-t2 hover:text-white'}`}
                style={isActive
                  ? { background: `${c.color}cc`, borderColor: c.color, boxShadow: `0 0 10px ${c.color}50` }
                  : {}}
              >
                <span className="text-[11px] leading-none">{c.icon}</span>
                {c.name}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 bg-bgc border border-b0 p-1.5 rounded-xl w-full lg:w-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-t2" />
            <input className="inp !w-48 !pl-9" placeholder="Filtrar dorks..." value={dorkSearch} onChange={e => setDorkSearch(e.target.value)} />
          </div>
          <select className="inp !w-32 !py-0" value={dorkOpFilter} onChange={e => setDorkOpFilter(e.target.value)}>
            <option value="all">Todo Op.</option>
            <option value="site:">site:</option>
            <option value="inurl:">inurl:</option>
            <option value="intitle:">intitle:</option>
            <option value="filetype:">filetype:</option>
            <option value="email">Emails</option>
            <option value="phone">Telefonos</option>
          </select>
          <button className="btn bg-bg1 border border-b0 text-t2 hover:text-red-brand px-2 py-1 text-[10px]" onClick={() => { setDorkSearch(""); setDorkOpFilter("all"); }}>
            Limpiar
          </button>
        </div>
      </div>

      {filteredDorks.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-b0 rounded-xl text-t2 italic">
          <Filter className="w-8 h-8 mx-auto mb-3 opacity-20" />
          No se encontraron dorks.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDorks.map((t: any, i: number) => {
            const filled = fillTemplate(t.query);
            return (
              <div key={i} className="tc group">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: t.catColor }} />
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xs">{t.name}</h3>
                  <button onClick={() => toggleFavorite(filled)} className={`transition-transform hover:scale-110 ${favorites.includes(filled) ? "text-yellow-brand" : "text-t2 opacity-40"}`}>
                    <Star className={`w-3.5 h-3.5 ${favorites.includes(filled) ? "fill-current" : ""}`} />
                  </button>
                </div>
                <p className="text-[10px] text-t2 mb-3 leading-relaxed">{t.desc}</p>
                <div className="tc-q mb-3 line-clamp-2">{renderHighlightedQuery(filled)}</div>
                <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="btn bg-bg1 border border-b0 px-1.5 py-1 text-[9px] text-blue-400" onClick={() => openSearch(filled)}>Google</button>
                  <button className="btn bg-bg1 border border-b0 px-1.5 py-1 text-[9px] text-cyan-400" onClick={() => openSearch(filled, "bing")}>Bing</button>
                  <button className="btn bg-bg1 border border-b0 px-1.5 py-1 text-[9px] text-orange-400" onClick={() => openSearch(filled, "ddg")}>DDG</button>
                  <button className="btn bg-bg1 border border-b0 px-1.5 py-1 text-[9px] text-red-400" onClick={() => openSearch(filled, "yandex")}>Yandex</button>
                  <button className="btn bg-bg1 border border-b0 px-1.5 py-1 text-[9px] text-orange-300" onClick={() => openSearch(filled, "brave")}>Brave</button>
                  <button className="btn bg-bg1 border border-b0 px-1.5 py-1 text-[9px] text-emerald-400" onClick={() => openSearch(filled, "maps")}>Maps</button>
                  <button className="btn bg-blue-brand/20 border border-blue-brand/30 text-blue-brand px-1.5 py-1 text-[9px] flex-1 text-center" onClick={() => { setScrapeQuery(filled); setTab("scraper"); }}>▶ Scrape</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
