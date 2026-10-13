import type { Template, CategoryTemplate, Region } from '../types';

export const REGIONS: Record<string, Region> = {
  // dirs ordered: most-popular portal first → dirsTop3 always picks the best 3
  co: { name: "Colombia", flag: "🇨🇴", lang: "es", google: "google.com.co", tld: ".com.co", bing_loc: "co", ddg_region: "co-es",
    maps: "google.com.co/maps", ml: "mercadolibre.com.co", pa: "paginasamarillas.com.co",
    dirs: ["kompass.com","cylex.com.co","infoisinfo.com.co","directorio-empresas.einforma.co","hotfrog.com.co","yalwa.com.co","tupalo.com","informacolombia.com","blinder.com.co","tripadvisor.com"],
    apps: ["Rappi","Domicilios.com","iFood"], phone: "+57",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular|móvil|llamar", order: "pedidos|domicilios|envíos|delivery",
      open: "abrimos|inauguración|apertura|nuevo local", review: "reseña|reseñas|review|reviews", schedule: "horario|horarios",
      quote: "cotización|cotizar|presupuesto", independent: "independiente|freelance|por cuenta propia" }
  },
  mx: { name: "México", flag: "🇲🇽", lang: "es", google: "google.com.mx", tld: ".com.mx", bing_loc: "mx", ddg_region: "mx-es",
    maps: "google.com.mx/maps", ml: "mercadolibre.com.mx", pa: "seccionamarilla.com.mx",
    dirs: ["mx.kompass.com","cylex.com.mx","infoisinfo.com.mx","hotfrog.com.mx","yalwa.com.mx","tuugo.com.mx","guiamexico.com.mx","indizze.mx","directorio.com.mx","citiservi.com.mx","tupalo.com","tripadvisor.com"],
    apps: ["Rappi","Didi Food","Uber Eats","Sin Delantal"], phone: "+52",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|a domicilio|envíos|delivery",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review|opinión", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  ar: { name: "Argentina", flag: "🇦🇷", lang: "es", google: "google.com.ar", tld: ".com.ar", bing_loc: "ar", ddg_region: "ar-es",
    maps: "google.com.ar/maps", ml: "mercadolibre.com.ar", pa: "paginasamarillas.com.ar",
    dirs: ["ar.kompass.com","cylex.com.ar","hotfrog.com.ar","tuugo.com.ar","yalwa.com.ar","yelp.com.ar","dir.ar","opendi.com.ar","paginasblancas.com.ar","infobel.com","tupalo.com","tripadvisor.com"],
    apps: ["Rappi","PedidosYa","Glovo"], phone: "+54",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review", schedule: "horario|horarios",
      quote: "presupuesto|cotización", independent: "independiente|freelance" }
  },
  cl: { name: "Chile", flag: "🇨🇱", lang: "es", google: "google.cl", tld: ".cl", bing_loc: "cl", ddg_region: "cl-es",
    maps: "google.cl/maps", ml: "mercadolibre.cl", pa: "paginasamarillas.cl",
    dirs: ["cl.kompass.com","cylex.cl","infoisinfo.cl","hotfrog.cl","yalwa.cl","tuugo.cl","opendi.cl","directorioempresaschile.cl","pymesdechile.cl","chileservicios.com","basededatoschile.cl","kom.cl","tupalo.com","tripadvisor.com"],
    apps: ["Rappi","PedidosYa","Cornershop","Justo"], phone: "+56",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular|fono", order: "pedidos|despacho|envíos|delivery",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  pe: { name: "Perú", flag: "🇵🇪", lang: "es", google: "google.com.pe", tld: ".com.pe", bing_loc: "pe", ddg_region: "pe-es",
    maps: "google.com.pe/maps", ml: "mercadolibre.com.pe", pa: "paginasamarillas.com.pe",
    dirs: ["kompass.com","cylex.com.pe","infoisinfo.com.pe","dir.pe","hotfrog.com.pe","yalwa.com.pe","pyme.pe","negociovirtualperu.com","cclnegocios.pe","tupalo.com","tripadvisor.com"],
    apps: ["Rappi","PedidosYa","Yango Eats"], phone: "+51",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|review|opinión", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  ec: { name: "Ecuador", flag: "🇪🇨", lang: "es", google: "google.com.ec", tld: ".com.ec", bing_loc: "ec", ddg_region: "ec-es",
    maps: "google.com.ec/maps", ml: "mercadolibre.com.ec", pa: "paginasamarillas.com.ec",
    dirs: ["ec.kompass.com","yalwa.com.ec","eqnegocios.com","web593.com","directorioempresasecuador.com","tupalo.com","tripadvisor.com"],
    apps: ["Rappi","PedidosYa","Picap"], phone: "+593",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|review", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  br: { name: "Brasil", flag: "🇧🇷", lang: "pt", google: "google.com.br", tld: ".com.br", bing_loc: "br", ddg_region: "br-pt",
    maps: "google.com.br/maps", ml: "mercadolivre.com.br", pa: null,
    dirs: ["br.kompass.com","telelistas.net","guiamais.com.br","cylex.com.br","hotfrog.com.br","infoisinfo.com.br","yelp.com.br","reclameaqui.com.br","listato.com.br","opendi.com.br","yalwa.com.br","tupalo.com","tripadvisor.com"],
    apps: ["iFood","Rappi","Loggi"], phone: "+55",
    kw: { contact: "contato|fale conosco", phone: "telefone|celular|whatsapp", order: "pedidos|delivery|entregas",
      open: "inauguração|abertura|novo", review: "avaliação|avaliações|review", schedule: "horário|horários",
      quote: "orçamento|solicitar orçamento", independent: "autônomo|freelancer" }
  },
  us: { name: "USA", flag: "🇺🇸", lang: "en", google: "google.com", tld: ".com", bing_loc: "us", ddg_region: "us-en",
    maps: "google.com/maps", ml: null, pa: null,
    dirs: ["us.kompass.com","yelp.com","yellowpages.com","bbb.org","manta.com","foursquare.com","cylex.us.com","superpages.com","merchantcircle.com","hotfrog.com","crunchbase.com","mapquest.com","thumbtack.com","tripadvisor.com"],
    apps: ["DoorDash","Uber Eats","GrubHub","Instacart"], phone: "+1",
    kw: { contact: "contact|contact us", phone: "phone|call|cell", order: "order|delivery|pickup",
      open: "now open|grand opening", review: "review|reviews|rating", schedule: "hours|business hours",
      quote: "quote|estimate|free estimate", independent: "freelance|independent|self-employed" }
  },
  es: { name: "España", flag: "🇪🇸", lang: "es", google: "google.es", tld: ".es", bing_loc: "es", ddg_region: "es-es",
    maps: "google.es/maps", ml: null, pa: "paginasamarillas.es",
    dirs: ["es.kompass.com","einforma.com","qdq.com","cylex.es","infoisinfo.es","axesor.es","yelp.es","hotfrog.es","europages.es","yalwa.es","11870.com","vulka.es","tupalo.com","tripadvisor.com"],
    apps: ["Glovo","Just Eat","Uber Eats"], phone: "+34",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|móvil", order: "pedidos|reparto|delivery",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|valoración", schedule: "horario|horarios",
      quote: "presupuesto|cotización", independent: "autónomo|freelance" }
  },
  do: { name: "Rep. Dominicana", flag: "🇩🇴", lang: "es", google: "google.com.do", tld: ".com.do", bing_loc: "do", ddg_region: "do-es",
    maps: "google.com.do/maps", ml: null, pa: "paginasamarillas.com.do",
    dirs: ["do.kompass.com","directoriodominicano.net","baseempresarial.com","prodominicana.gob.do","tupalo.com","tripadvisor.com"],
    apps: ["Uber Eats","PedidosYa","HeyJude"], phone: "+1-809",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular|móvil", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  }
};

// ─── ALL SEARCH ENGINES WITH METADATA ────────────────────────────────────────

export interface SearchEngine {
  id: string;
  name: string;
  icon: string;
  color: string;
  baseUrl: string;
  paramKey: string;         // URL param for query
  suffix?: string;          // appended after encoded query
  category: "general" | "social" | "business" | "technical" | "media" | "latam";
  operators: string[];      // supported operator ids
  notes?: string;
}

export const SEARCH_ENGINES: Record<string, SearchEngine> = {
  // ── GENERAL ──────────────────────────────────────────────────────────────
  google: {
    id: "google", name: "Google", icon: "G", color: "#4285F4", category: "general",
    baseUrl: "https://www.google.com/search?q=", paramKey: "q",
    operators: ["site","intitle","inurl","intext","filetype","before","after","OR","AND","minus","exact","AROUND","allintitle","allinurl","related","cache","define"],
    notes: "Most powerful. Use dorks for lead extraction."
  },
  bing: {
    id: "bing", name: "Bing", icon: "B", color: "#00809D", category: "general",
    baseUrl: "https://www.bing.com/search?q=", paramKey: "q",
    operators: ["site","intitle","inurl","inbody","contains","loc","ip","near","meta","feed","hasfeed","language","prefer","filetype","b_after","b_before","exact","minus","OR","AND","NOT"],
    notes: "Great for loc: country filter. inbody: finds text not in title."
  },
  ddg: {
    id: "ddg", name: "DuckDuckGo", icon: "D", color: "#DE5833", category: "general",
    baseUrl: "https://duckduckgo.com/?q=", paramKey: "q",
    operators: ["site","intitle","inurl","filetype","sort_date","region","lang","safe","exact","minus","bang"],
    notes: "Bangs (!yelp, !li, !tw) redirect instantly. Privacy-first index."
  },
  yandex: {
    id: "yandex", name: "Yandex", icon: "Y", color: "#FF0000", category: "general",
    baseUrl: "https://yandex.com/search/?text=", paramKey: "text",
    operators: ["url","host","domain","title","body","link","y_date","y_mime","y_lang","y_exact","y_NOT","y_AND","y_OR","y_proximity","y_required","y_exclude","y_group"],
    notes: "Best for CIS + Russia. Strong URL/host operators. Finds regional business data Google misses."
  },
  brave: {
    id: "brave", name: "Brave", icon: "Br", color: "#FB542B", category: "general",
    baseUrl: "https://search.brave.com/search?q=", paramKey: "q",
    operators: ["site","intitle","inurl","filetype","br_lang","br_country","br_after","br_before","exact","OR","AND","NOT","minus"],
    notes: "Independent index (not Google/Bing). Finds pages big engines miss."
  },
  mojeek: {
    id: "mojeek", name: "Mojeek", icon: "M", color: "#2E86AB", category: "general",
    baseUrl: "https://www.mojeek.com/search?q=", paramKey: "q",
    operators: ["site","intitle","inurl","exact","minus"],
    notes: "100% independent crawler. Useful for sites excluded from Google."
  },
  // ── SOCIAL ───────────────────────────────────────────────────────────────
  linkedin: {
    id: "linkedin", name: "LinkedIn", icon: "Li", color: "#0077B5", category: "social",
    baseUrl: "https://www.linkedin.com/search/results/all/?keywords=", paramKey: "keywords",
    operators: ["li_AND","li_OR","li_NOT","li_exact","li_group"],
    notes: "Boolean: AND OR NOT \" \" (). No wildcard *. Best for B2B contacts."
  },
  linkedin_people: {
    id: "linkedin_people", name: "LinkedIn People", icon: "LP", color: "#0077B5", category: "social",
    baseUrl: "https://www.linkedin.com/search/results/people/?keywords=", paramKey: "keywords",
    operators: ["li_AND","li_OR","li_NOT","li_exact","li_group"],
    notes: "Direct people search. Combine with title= and company= filters in Sales Nav."
  },
  linkedin_companies: {
    id: "linkedin_companies", name: "LinkedIn Companies", icon: "LC", color: "#004471", category: "social",
    baseUrl: "https://www.linkedin.com/search/results/companies/?keywords=", paramKey: "keywords",
    operators: ["li_AND","li_OR","li_NOT","li_exact"],
    notes: "B2B company discovery. Filter by size, industry, location."
  },
  twitter: {
    id: "twitter", name: "X / Twitter", icon: "X", color: "#000000", category: "social",
    baseUrl: "https://x.com/search?q=", paramKey: "q",
    operators: ["tw_from","tw_to","tw_since","tw_until","tw_lang","tw_near","tw_within","tw_geocode","tw_list","tw_source","tw_filter","exact","minus","OR"],
    notes: "from:user to:user since:YYYY-MM-DD until: lang: geocode:lat,lng,radiuskm near:city."
  },
  instagram: {
    id: "instagram", name: "Instagram (Google)", icon: "IG", color: "#E1306C", category: "social",
    baseUrl: "https://www.google.com/search?q=site:instagram.com+", paramKey: "q",
    operators: ["site","inurl","minus","exact"],
    notes: "Instagram has no public search API. Use Google site:instagram.com dorks."
  },
  tiktok: {
    id: "tiktok", name: "TikTok (Google)", icon: "TT", color: "#000000", category: "social",
    baseUrl: "https://www.google.com/search?q=site:tiktok.com+", paramKey: "q",
    operators: ["site","inurl","minus","exact"],
    notes: "Use Google site:tiktok.com. Filter -inurl:/@/video/ for profiles only."
  },
  youtube: {
    id: "youtube", name: "YouTube", icon: "YT", color: "#FF0000", category: "media",
    baseUrl: "https://www.youtube.com/results?search_query=", paramKey: "search_query",
    operators: ["exact","minus","OR"],
    notes: "Find business channels. Add channel: filter. Use Google site:youtube.com for advanced."
  },
  facebook: {
    id: "facebook", name: "Facebook (Google)", icon: "FB", color: "#1877F2", category: "social",
    baseUrl: "https://www.google.com/search?q=site:facebook.com+", paramKey: "q",
    operators: ["site","inurl","minus","exact"],
    notes: "Use site:facebook.com/pages/ for business pages. Exclude /posts/ /photos/."
  },
  // ── BUSINESS DIRECTORIES ─────────────────────────────────────────────────
  yelp: {
    id: "yelp", name: "Yelp", icon: "Yp", color: "#C41200", category: "business",
    baseUrl: "https://www.yelp.com/search?find_desc=", paramKey: "find_desc",
    suffix: "&find_loc={CITY}",
    operators: ["exact"],
    notes: "US/Canada B2C leads. Returns phone, address, hours, email links."
  },
  yellowpages: {
    id: "yellowpages", name: "Yellow Pages", icon: "YP", color: "#FFD700", category: "business",
    baseUrl: "https://www.yellowpages.com/search?search_terms=", paramKey: "search_terms",
    suffix: "&geo_location_terms={CITY}",
    operators: ["exact"],
    notes: "Large US business DB. Returns phone, address, website."
  },
  manta: {
    id: "manta", name: "Manta", icon: "Mt", color: "#FF6900", category: "business",
    baseUrl: "https://www.manta.com/search?search=", paramKey: "search",
    operators: ["exact"],
    notes: "SMB-focused US directory. Good for small business leads with emails."
  },
  clutch: {
    id: "clutch", name: "Clutch.co", icon: "Cl", color: "#FF3D2E", category: "business",
    baseUrl: "https://clutch.co/search?search_term=", paramKey: "search_term",
    operators: ["exact"],
    notes: "B2B agencies/tech companies. Has reviews + contact info."
  },
  bbb: {
    id: "bbb", name: "BBB", icon: "BB", color: "#003E7E", category: "business",
    baseUrl: "https://www.bbb.org/search?find_text=", paramKey: "find_text",
    operators: ["exact"],
    notes: "Better Business Bureau. US/Canada. Verified business data."
  },
  trustpilot: {
    id: "trustpilot", name: "Trustpilot", icon: "Tp", color: "#00B67A", category: "business",
    baseUrl: "https://www.trustpilot.com/search?query=", paramKey: "query",
    operators: ["exact"],
    notes: "Verified business reviews. Find competitors with bad reviews = your leads."
  },
  tripadvisor: {
    id: "tripadvisor", name: "TripAdvisor", icon: "TA", color: "#34E0A1", category: "business",
    baseUrl: "https://www.tripadvisor.com/Search?q=", paramKey: "q",
    operators: ["exact"],
    notes: "Hotels, restaurants, tourism. Has phone + website + email links."
  },
  // ── LATAM SPECIFIC ───────────────────────────────────────────────────────
  mercadolibre: {
    id: "mercadolibre", name: "MercadoLibre", icon: "ML", color: "#FFE600", category: "latam",
    baseUrl: "https://listado.mercadolibre.com.co/", paramKey: "",
    operators: [],
    notes: "LATAM marketplace. Find B2B sellers with high volume. Check seller profile for contact."
  },
  olx: {
    id: "olx", name: "OLX", icon: "OL", color: "#6CC26A", category: "latam",
    baseUrl: "https://www.olx.com.co/items/q-", paramKey: "",
    operators: [],
    notes: "LATAM classifieds. B2C small business leads with direct phones."
  },
  computrabajo: {
    id: "computrabajo", name: "Computrabajo", icon: "CT", color: "#0070C0", category: "latam",
    baseUrl: "https://co.computrabajo.com/trabajo-de-", paramKey: "",
    operators: [],
    notes: "Job listings = hiring companies. Find growing businesses needing services."
  },
  // ── TECHNICAL / OSINT ────────────────────────────────────────────────────
  shodan: {
    id: "shodan", name: "Shodan", icon: "Sh", color: "#A9312A", category: "technical",
    baseUrl: "https://www.shodan.io/search?query=", paramKey: "query",
    operators: ["sh_port","sh_org","sh_country","sh_city","sh_hostname","sh_os","sh_product","sh_version","sh_net","sh_asn","sh_http_title","sh_http_html","sh_http_status","sh_ssl","sh_has_screenshot","sh_vuln","exact","minus"],
    notes: "Finds exposed web servers, panels, and systems. Map business infrastructure."
  },
  censys: {
    id: "censys", name: "Censys", icon: "Ce", color: "#1A1A2E", category: "technical",
    baseUrl: "https://search.censys.io/search?resource=hosts&q=", paramKey: "q",
    operators: ["sh_port","sh_country","sh_org","exact","AND","OR","NOT"],
    notes: "Internet-wide scan. ip:, port:, services.service_name:, location.country:"
  },
  zoomeye: {
    id: "zoomeye", name: "ZoomEye", icon: "ZE", color: "#1890FF", category: "technical",
    baseUrl: "https://www.zoomeye.ai/searchResult?q=", paramKey: "q",
    operators: ["exact","AND","OR"],
    notes: "Chinese-focused internet scanner. Good for Asian market OSINT."
  },
  github: {
    id: "github", name: "GitHub", icon: "GH", color: "#24292E", category: "technical",
    baseUrl: "https://github.com/search?type=code&q=", paramKey: "q",
    operators: ["gh_repo","gh_org","gh_user","gh_path","gh_extension","gh_language","exact","minus","OR"],
    notes: "Find exposed emails, API keys, contact info in public repos."
  },
  reddit: {
    id: "reddit", name: "Reddit", icon: "Rd", color: "#FF4500", category: "social",
    baseUrl: "https://www.reddit.com/search/?q=", paramKey: "q",
    operators: ["rd_subreddit","rd_author","rd_flair","rd_after","rd_before","rd_sort","rd_type","exact","minus","OR"],
    notes: "subreddit: author: flair: after: before: sort:relevance/new/top type:link/comment"
  },
  // ── ACADEMIC / RESEARCH ─────────────────────────────────────────────────
  scholar: {
    id: "scholar", name: "Google Scholar", icon: "GS", color: "#4285F4", category: "technical",
    baseUrl: "https://scholar.google.com/scholar?q=", paramKey: "q",
    operators: ["exact","author","source","minus","OR"],
    notes: "author: source: allintitle: Find research contacts = B2B leads for consulting."
  },
};

// ─── DUCKDUCKGO BANGS FOR LEAD GENERATION ────────────────────────────────────

export const DDG_BANGS: Record<string, { bang: string; name: string; desc: string; category: string }> = {
  // Business directories
  "!yelp":       { bang: "!yelp",       name: "Yelp",         desc: "US/CA business directory",          category: "business" },
  "!yp":         { bang: "!yp",         name: "Yellow Pages", desc: "US Yellow Pages",                   category: "business" },
  "!bbb":        { bang: "!bbb",        name: "BBB",          desc: "Better Business Bureau",            category: "business" },
  "!manta":      { bang: "!manta",      name: "Manta",        desc: "SMB directory with emails",         category: "business" },
  "!clutch":     { bang: "!clutch",     name: "Clutch",       desc: "B2B agencies & tech companies",     category: "business" },
  "!tp":         { bang: "!tp",         name: "Trustpilot",   desc: "Reviews = find weak competitors",   category: "business" },
  // Social
  "!li":         { bang: "!li",         name: "LinkedIn",     desc: "Professional network",              category: "social" },
  "!tw":         { bang: "!tw",         name: "Twitter/X",    desc: "Real-time business mentions",       category: "social" },
  "!yt":         { bang: "!yt",         name: "YouTube",      desc: "Business channels",                 category: "social" },
  "!in":         { bang: "!in",         name: "Instagram",    desc: "Business profiles",                 category: "social" },
  "!r":          { bang: "!r",          name: "Reddit",       desc: "Community lead discovery",          category: "social" },
  "!fb":         { bang: "!fb",         name: "Facebook",     desc: "Business pages",                    category: "social" },
  // Technical
  "!gh":         { bang: "!gh",         name: "GitHub",       desc: "Code with exposed contacts",        category: "technical" },
  "!so":         { bang: "!so",         name: "Stack Overflow", desc: "Tech leads & developers",         category: "technical" },
  "!shodan":     { bang: "!shodan",     name: "Shodan",       desc: "Internet-connected devices",        category: "technical" },
  // Maps & Local
  "!maps":       { bang: "!maps",       name: "Google Maps",  desc: "Local business discovery",          category: "maps" },
  "!gm":         { bang: "!gm",         name: "Google Maps",  desc: "Business location search",          category: "maps" },
  "!waze":       { bang: "!waze",       name: "Waze",         desc: "Local business search",             category: "maps" },
  // LATAM
  "!ml":         { bang: "!ml",         name: "MercadoLibre", desc: "LATAM marketplace sellers",         category: "latam" },
  "!olx":        { bang: "!olx",        name: "OLX",          desc: "LATAM classifieds",                 category: "latam" },
  // Search engines
  "!g":          { bang: "!g",          name: "Google",       desc: "Direct to Google",                  category: "general" },
  "!b":          { bang: "!b",          name: "Bing",         desc: "Direct to Bing",                    category: "general" },
  "!brave":      { bang: "!brave",      name: "Brave Search", desc: "Independent index",                 category: "general" },
  "!ya":         { bang: "!ya",         name: "Yandex",       desc: "Russian/CIS search",                category: "general" },
  // Docs
  "!pdf":        { bang: "!pdf",        name: "PDF Search",   desc: "Find PDF documents",                category: "docs" },
  "!scholar":    { bang: "!scholar",    name: "Scholar",      desc: "Academic/research contacts",        category: "docs" },
  "!wb":         { bang: "!wb",         name: "Wayback",      desc: "Archived pages (find old emails)",  category: "docs" },
  // E-commerce
  "!amz":        { bang: "!amz",        name: "Amazon",       desc: "Seller contact discovery",          category: "ecommerce" },
  "!etsy":       { bang: "!etsy",       name: "Etsy",         desc: "Creator/maker leads",               category: "ecommerce" },
};

// ─── OPERATORS DATABASE ───────────────────────────────────────────────────────

export const OPERATORS: Record<string, any[]> = {
  // ── GOOGLE ───────────────────────────────────────────────────────────────
  google: [
    { id: "site",        syntax: "site:",          status: "active",     desc: "Restrict to domain",          example: "site:instagram.com" },
    { id: "intitle",     syntax: "intitle:",       status: "active",     desc: "Word in page title",          example: 'intitle:"contacto"' },
    { id: "allintitle",  syntax: "allintitle:",    status: "active",     desc: "All words in title",          example: 'allintitle:dentista medellín contacto' },
    { id: "inurl",       syntax: "inurl:",         status: "active",     desc: "Word in URL",                 example: "inurl:admin" },
    { id: "allinurl",    syntax: "allinurl:",      status: "active",     desc: "All words in URL",            example: "allinurl:contact php" },
    { id: "intext",      syntax: "intext:",        status: "active",     desc: "Word in page body",           example: 'intext:"whatsapp"' },
    { id: "allintext",   syntax: "allintext:",     status: "active",     desc: "All words in body",           example: "allintext:teléfono email contacto" },
    { id: "filetype",    syntax: "filetype:",      status: "active",     desc: "File type",                   example: "filetype:pdf" },
    { id: "before",      syntax: "before:",        status: "active",     desc: "Published before date",       example: "before:2024-01-01" },
    { id: "after",       syntax: "after:",         status: "active",     desc: "Published after date",        example: "after:2024-01-01" },
    { id: "OR",          syntax: "OR",             status: "active",     desc: "Boolean OR",                  example: "dentist OR doctor" },
    { id: "AND",         syntax: "AND",            status: "active",     desc: "Boolean AND (implicit)",      example: "dentist AND clinic" },
    { id: "minus",       syntax: "-",              status: "active",     desc: "Exclude term",                example: "-franchise" },
    { id: "exact",       syntax: '""',             status: "active",     desc: "Exact phrase",                example: '"web design"' },
    { id: "AROUND",      syntax: "AROUND(n)",      status: "active",     desc: "Proximity (n words apart)",   example: '"dentist" AROUND(3) "reviews"' },
    { id: "related",     syntax: "related:",       status: "active",     desc: "Similar websites",            example: "related:yellowpages.com" },
    { id: "cache",       syntax: "cache:",         status: "active",     desc: "Cached version of page",      example: "cache:example.com" },
    { id: "define",      syntax: "define:",        status: "active",     desc: "Word definition",             example: "define:PYME" },
    { id: "numrange",    syntax: "..",             status: "active",     desc: "Number range",                example: "precio 100..500" },
    { id: "source",      syntax: "source:",        status: "active",     desc: "News source (Google News)",   example: "source:elpais.com" },
    { id: "ext",         syntax: "ext:",           status: "deprecated", desc: "⚠️ Use filetype: instead",    example: "ext:pdf" },
    { id: "inanchor",    syntax: "inanchor:",      status: "deprecated", desc: "⚠️ Low reliability",          example: "inanchor:keyword" },
  ],

  // ── BING ─────────────────────────────────────────────────────────────────
  bing: [
    { id: "site",        syntax: "site:",          status: "active",     desc: "Restrict to domain",          example: "site:linkedin.com/company/" },
    { id: "intitle",     syntax: "intitle:",       status: "active",     desc: "Word in page title",          example: 'intitle:"contacto"' },
    { id: "inurl",       syntax: "inurl:",         status: "active",     desc: "Word in URL",                 example: "inurl:contact" },
    { id: "inbody",      syntax: "inbody:",        status: "active",     desc: "Word in page body/meta",      example: 'inbody:"teléfono"' },
    { id: "contains",    syntax: "contains:",      status: "active",     desc: "Page links to filetype",      example: "contains:pdf" },
    { id: "loc",         syntax: "loc:",           status: "active",     desc: "Country code filter",         example: "loc:co" },
    { id: "ip",          syntax: "ip:",            status: "active",     desc: "Pages at specific IP",        example: "ip:192.168.1.1" },
    { id: "near",        syntax: "near:",          status: "active",     desc: "Word proximity",              example: "dentista near:5 medellín" },
    { id: "meta",        syntax: "meta:",          status: "active",     desc: "In meta description/keywords",example: 'meta:"restaurante"' },
    { id: "feed",        syntax: "feed:",          status: "active",     desc: "RSS/Atom feed content",       example: "feed:restaurante" },
    { id: "hasfeed",     syntax: "hasfeed:",       status: "active",     desc: "Site has RSS feed",           example: "hasfeed:restaurante" },
    { id: "language",    syntax: "language:",      status: "active",     desc: "Page language",               example: "language:es" },
    { id: "prefer",      syntax: "prefer:",        status: "active",     desc: "Boost this term",             example: "prefer:celular" },
    { id: "b_filetype",  syntax: "filetype:",      status: "active",     desc: "File type",                   example: "filetype:xlsx" },
    { id: "b_after",     syntax: "after:",         status: "active",     desc: "After date YYYY-MM-DD",       example: "after:2024-01-01" },
    { id: "b_before",    syntax: "before:",        status: "active",     desc: "Before date YYYY-MM-DD",      example: "before:2025-01-01" },
    { id: "exact",       syntax: '""',             status: "active",     desc: "Exact phrase",                example: '"contacto directo"' },
    { id: "minus",       syntax: "-",              status: "active",     desc: "Exclude",                     example: "-franchise" },
    { id: "OR",          syntax: "OR",             status: "active",     desc: "Boolean OR (uppercase)",      example: "teléfono OR celular" },
    { id: "AND",         syntax: "AND",            status: "active",     desc: "Boolean AND (&)",             example: "dentista AND contacto" },
    { id: "NOT",         syntax: "NOT",            status: "active",     desc: "Boolean NOT (uppercase)",     example: "NOT franchise" },
  ],

  // ── DUCKDUCKGO ───────────────────────────────────────────────────────────
  ddg: [
    { id: "site",        syntax: "site:",          status: "active",     desc: "Restrict to domain",          example: "site:instagram.com" },
    { id: "intitle",     syntax: "intitle:",       status: "active",     desc: "Word in title",               example: 'intitle:"contacto"' },
    { id: "inurl",       syntax: "inurl:",         status: "active",     desc: "Word in URL",                 example: "inurl:contact" },
    { id: "filetype",    syntax: "filetype:",      status: "active",     desc: "File type",                   example: "filetype:pdf" },
    { id: "sort_date",   syntax: "sort:date",      status: "active",     desc: "Sort by date (freshness)",    example: "restaurante sort:date" },
    { id: "region",      syntax: "region:",        status: "active",     desc: "Region filter (xx-xx)",       example: "region:co-es" },
    { id: "lang",        syntax: "lang:",          status: "active",     desc: "Page language",               example: "lang:es" },
    { id: "safe",        syntax: "safe:on/off",    status: "active",     desc: "SafeSearch per-query",        example: "safe:off" },
    { id: "exact",       syntax: '""',             status: "active",     desc: "Exact phrase",                example: '"teléfono directo"' },
    { id: "minus",       syntax: "-",              status: "active",     desc: "Exclude",                     example: "-inurl:facebook" },
    { id: "bang",        syntax: "!bang",          status: "active",     desc: "Direct to another engine",    example: "!yelp dentista medellín" },
    { id: "first",       syntax: "\\",             status: "active",     desc: "Go to first result",          example: "\\dentista medellín contacto" },
    { id: "semantic",    syntax: '~""',            status: "active",     desc: "Semantic/near match",         example: '~"marketing digital"' },
  ],

  // ── YANDEX ───────────────────────────────────────────────────────────────
  yandex: [
    { id: "y_exact",     syntax: '""',             status: "active",     desc: "Exact phrase",                example: '"контакты" OR "contacto"' },
    { id: "y_required",  syntax: "+",              status: "active",     desc: "Word must appear",            example: "+teléfono restaurante" },
    { id: "y_exclude",   syntax: "~~",             status: "active",     desc: "Exclude (NOT)",               example: "restaurante ~~franquicia" },
    { id: "y_AND",       syntax: "&&",             status: "active",     desc: "AND (both in same sentence)", example: "dentista && medellín" },
    { id: "y_OR",        syntax: "||",             status: "active",     desc: "OR (either word)",            example: "teléfono || celular" },
    { id: "y_proximity", syntax: "/n",             status: "active",     desc: "Within n words apart",        example: "dentista /5 contacto" },
    { id: "y_group",     syntax: "()",             status: "active",     desc: "Group operators",             example: "(dentista || médico) && medellín" },
    { id: "y_exact_form",syntax: "!",              status: "active",     desc: "Exact word form (no stem)",   example: "!teléfono" },
    { id: "url",         syntax: "url:",           status: "active",     desc: "URL contains string",         example: "url:contacto" },
    { id: "host",        syntax: "host:",          status: "active",     desc: "Exact domain",                example: "host:restaurante.com.co" },
    { id: "domain",      syntax: "domain:",        status: "active",     desc: "Root domain filter",          example: "domain:.com.co" },
    { id: "title",       syntax: "title:",         status: "active",     desc: "In page title",               example: "title:restaurante" },
    { id: "body",        syntax: "body:",          status: "active",     desc: "In page body text",           example: "body:teléfono" },
    { id: "link",        syntax: "link:",          status: "active",     desc: "Pages linking to URL",        example: "link:wa.me" },
    { id: "y_date",      syntax: "date:",          status: "active",     desc: "Publication date range",      example: "date:20240101..20251231" },
    { id: "y_mime",      syntax: "mime:",          status: "active",     desc: "File/MIME type",              example: "mime:pdf" },
    { id: "y_lang",      syntax: "lang:",          status: "active",     desc: "Page language",               example: "lang:es" },
  ],

  // ── BRAVE SEARCH ─────────────────────────────────────────────────────────
  brave: [
    { id: "site",        syntax: "site:",          status: "active",     desc: "Restrict to domain",          example: "site:trustpilot.com" },
    { id: "intitle",     syntax: "intitle:",       status: "active",     desc: "Word in title",               example: 'intitle:"contacto"' },
    { id: "inurl",       syntax: "inurl:",         status: "active",     desc: "Word in URL",                 example: "inurl:directorio" },
    { id: "filetype",    syntax: "filetype:",      status: "active",     desc: "File type",                   example: "filetype:csv" },
    { id: "br_lang",     syntax: "lang:",          status: "active",     desc: "Page language",               example: "lang:es" },
    { id: "br_country",  syntax: "country:",       status: "active",     desc: "Country code",                example: "country:co" },
    { id: "br_after",    syntax: "after:",         status: "active",     desc: "After date",                  example: "after:2024-01-01" },
    { id: "br_before",   syntax: "before:",        status: "active",     desc: "Before date",                 example: "before:2025-01-01" },
    { id: "exact",       syntax: '""',             status: "active",     desc: "Exact phrase",                example: '"datos de contacto"' },
    { id: "minus",       syntax: "-",              status: "active",     desc: "Exclude",                     example: "-site:facebook.com" },
    { id: "OR",          syntax: "OR",             status: "active",     desc: "Boolean OR (uppercase)",      example: "teléfono OR celular" },
    { id: "AND",         syntax: "AND",            status: "active",     desc: "Boolean AND (uppercase)",     example: "contacto AND email" },
    { id: "NOT",         syntax: "NOT",            status: "active",     desc: "Boolean NOT (uppercase)",     example: "NOT franquicia" },
  ],

  // ── SHODAN ───────────────────────────────────────────────────────────────
  shodan: [
    { id: "sh_http_title",   syntax: "http.title:",   status: "active",  desc: "Page title content",          example: 'http.title:"admin"' },
    { id: "sh_http_html",    syntax: "http.html:",    status: "active",  desc: "HTML body contains",          example: 'http.html:"contacto"' },
    { id: "sh_http_status",  syntax: "http.status:",  status: "active",  desc: "HTTP response code",          example: "http.status:200" },
    { id: "sh_port",         syntax: "port:",         status: "active",  desc: "Open port number",            example: "port:80" },
    { id: "sh_org",          syntax: "org:",          status: "active",  desc: "Organization/ISP name",       example: 'org:"Claro Colombia"' },
    { id: "sh_country",      syntax: "country:",      status: "active",  desc: "Country code (ISO)",          example: "country:CO" },
    { id: "sh_city",         syntax: "city:",         status: "active",  desc: "City name",                   example: "city:Medellin" },
    { id: "sh_hostname",     syntax: "hostname:",     status: "active",  desc: "Hostname contains",           example: "hostname:.com.co" },
    { id: "sh_os",           syntax: "os:",           status: "active",  desc: "Operating system",            example: "os:Windows" },
    { id: "sh_product",      syntax: "product:",      status: "active",  desc: "Software/service name",       example: 'product:"WordPress"' },
    { id: "sh_version",      syntax: "version:",      status: "active",  desc: "Software version",            example: 'version:"5.9"' },
    { id: "sh_net",          syntax: "net:",          status: "active",  desc: "IP range (CIDR)",             example: "net:190.0.0.0/8" },
    { id: "sh_asn",          syntax: "asn:",          status: "active",  desc: "Autonomous System Number",    example: "asn:AS3816" },
    { id: "sh_ssl",          syntax: "ssl:",          status: "active",  desc: "SSL certificate contains",    example: 'ssl:"empresa.com.co"' },
    { id: "sh_vuln",         syntax: "vuln:",         status: "active",  desc: "CVE vulnerability",           example: "vuln:CVE-2021-44228" },
    { id: "sh_has_screenshot", syntax: "has_screenshot:true", status: "active", desc: "Has screenshot",      example: "has_screenshot:true" },
    { id: "exact",           syntax: '""',            status: "active",  desc: "Exact phrase",                example: '"login" "admin"' },
    { id: "minus",           syntax: "-",             status: "active",  desc: "Exclude",                     example: "-http.status:404" },
  ],

  // ── LINKEDIN BOOLEAN ─────────────────────────────────────────────────────
  linkedin: [
    { id: "li_AND",          syntax: "AND",           status: "active",  desc: "Both terms (uppercase)",      example: "CEO AND medellín" },
    { id: "li_OR",           syntax: "OR",            status: "active",  desc: "Either term (uppercase)",     example: "gerente OR director OR CEO" },
    { id: "li_NOT",          syntax: "NOT",           status: "active",  desc: "Exclude (uppercase)",         example: "developer NOT junior" },
    { id: "li_exact",        syntax: '""',            status: "active",  desc: "Exact phrase or title",       example: '"marketing manager"' },
    { id: "li_group",        syntax: "()",            status: "active",  desc: "Group logic",                 example: '("CEO" OR "founder") AND medellín' },
    { id: "li_no_wildcard",  syntax: "* ❌",          status: "inactive", desc: "No wildcard support",         example: "Manage* ❌ not supported" },
  ],

  // ── TWITTER / X ──────────────────────────────────────────────────────────
  twitter: [
    { id: "tw_from",         syntax: "from:",         status: "active",  desc: "Tweets from user",            example: "from:eltiempo" },
    { id: "tw_to",           syntax: "to:",           status: "active",  desc: "Tweets replying to user",     example: "to:empresa" },
    { id: "tw_since",        syntax: "since:",        status: "active",  desc: "Since date YYYY-MM-DD",       example: "since:2024-01-01" },
    { id: "tw_until",        syntax: "until:",        status: "active",  desc: "Until date YYYY-MM-DD",       example: "until:2025-01-01" },
    { id: "tw_lang",         syntax: "lang:",         status: "active",  desc: "Tweet language",              example: "lang:es" },
    { id: "tw_near",         syntax: "near:",         status: "active",  desc: "Near location",               example: "near:Medellín" },
    { id: "tw_within",       syntax: "within:",       status: "active",  desc: "Within radius of near:",      example: "within:50km" },
    { id: "tw_filter",       syntax: "filter:",       status: "active",  desc: "Filter by type",              example: "filter:links" },
    { id: "tw_source",       syntax: "source:",       status: "active",  desc: "Posted via app",              example: 'source:"Twitter for Business"' },
    { id: "tw_geocode",      syntax: "geocode:",      status: "active",  desc: "GPS lat,lng,radius",          example: "geocode:6.25,-75.57,50km" },
    { id: "exact",           syntax: '""',            status: "active",  desc: "Exact phrase",                example: '"restaurante medellín"' },
    { id: "minus",           syntax: "-",             status: "active",  desc: "Exclude",                     example: "-retweet" },
    { id: "OR",              syntax: "OR",            status: "active",  desc: "Boolean OR",                  example: "teléfono OR celular OR WhatsApp" },
  ],

  // ── GITHUB ───────────────────────────────────────────────────────────────
  github: [
    { id: "gh_repo",         syntax: "repo:",         status: "active",  desc: "Specific repo",               example: "repo:empresa/website" },
    { id: "gh_org",          syntax: "org:",          status: "active",  desc: "Organization",                example: "org:empresa-co" },
    { id: "gh_user",         syntax: "user:",         status: "active",  desc: "User's code",                 example: "user:developer123" },
    { id: "gh_path",         syntax: "path:",         status: "active",  desc: "File path contains",          example: "path:config" },
    { id: "gh_extension",    syntax: "extension:",    status: "active",  desc: "File extension",              example: "extension:env" },
    { id: "gh_language",     syntax: "language:",     status: "active",  desc: "Programming language",        example: "language:python" },
    { id: "exact",           syntax: '""',            status: "active",  desc: "Exact string",                example: '"contact@empresa.com"' },
    { id: "minus",           syntax: "-",             status: "active",  desc: "Exclude",                     example: "-repo:test" },
    { id: "OR",              syntax: "OR",            status: "active",  desc: "Boolean OR",                  example: "email OR phone OR contact" },
  ],

  // ── REDDIT ───────────────────────────────────────────────────────────────
  reddit: [
    { id: "rd_subreddit",    syntax: "subreddit:",    status: "active",  desc: "Specific subreddit",          example: "subreddit:Colombia" },
    { id: "rd_author",       syntax: "author:",       status: "active",  desc: "Posts by user",               example: "author:username" },
    { id: "rd_flair",        syntax: "flair:",        status: "active",  desc: "Post flair",                  example: "flair:negocios" },
    { id: "rd_after",        syntax: "after:",        status: "active",  desc: "After date (epoch)",          example: "after:2024-01-01" },
    { id: "rd_before",       syntax: "before:",       status: "active",  desc: "Before date (epoch)",         example: "before:2025-01-01" },
    { id: "rd_sort",         syntax: "sort:",         status: "active",  desc: "Sort order",                  example: "sort:new" },
    { id: "rd_type",         syntax: "type:",         status: "active",  desc: "Result type",                 example: "type:link" },
    { id: "exact",           syntax: '""',            status: "active",  desc: "Exact phrase",                example: '"busco proveedor"' },
    { id: "minus",           syntax: "-",             status: "active",  desc: "Exclude",                     example: "-subreddit:spam" },
    { id: "OR",              syntax: "OR",            status: "active",  desc: "Boolean OR",                  example: "proveedor OR vendedor OR fabricante" },
  ],
};

// ─── TEMPLATE BUILDER ─────────────────────────────────────────────────────────

export function buildTemplates(r: string): Record<string, CategoryTemplate> {
  const R = REGIONS[r];
  const k = R.kw;
  const kws = (field: string, n = 2) => k[field].split("|").slice(0, n).map((w: string) => `"${w}"`).join(" OR ");
  const year = new Date().getFullYear();
  const dirsTop2 = R.dirs.slice(0, 2).map((d: string) => `site:${d}`).join(" OR ");
  const dirsTop3 = R.dirs.slice(0, 3).map((d: string) => `site:${d}`).join(" OR ");
  const dirsTop4 = R.dirs.slice(0, 4).map((d: string) => `site:${d}`).join(" OR ");
  const dirsTop5 = R.dirs.slice(0, 5).map((d: string) => `site:${d}`).join(" OR ");
  const dirsAll  = R.dirs.map((d: string) => `site:${d}`).join(" OR ");

  return {
    // ── GOOGLE MY BUSINESS / DIRECTORIOS ──────────────────────────────────
    gmb: {
      name: "Google My Business", icon: null, color: "#4285F4",
      desc: "Negocios en Google Maps sin presencia web",
      templates: [
        { name: "Portales top 2", query: `"{NICHE}" "{CITY}" ${dirsTop2}`, desc: "Los 2 portales más populares del país", proTip: "Son los dos portales más usados del país según la lista de cada región" },
        { name: "Portales top 3", query: `"{NICHE}" "{CITY}" ${dirsTop3}`, desc: "3 portales de mayor tráfico", proTip: "Combina 3 portales para cobertura amplia" },
        { name: "Portales top 4", query: `"{NICHE}" "{CITY}" ${dirsTop4}`, desc: "4 portales con datos estructurados", proTip: "Añade un cuarto portal para leads adicionales" },
        { name: "Portales top 5", query: `"{NICHE}" "{CITY}" ${dirsTop5}`, desc: "Los 5 portales líderes por país", proTip: "Máxima cobertura con 5 portales en un solo dork" },
        { name: "Contacto expuesto", query: `"{NICHE}" "{CITY}" (${kws("contact")} OR ${kws("phone")}) -site:instagram.com -site:facebook.com`, desc: "Páginas con datos de contacto visibles", proTip: "Excluye redes para solo páginas web propias" },
        { name: "Negocios nuevos", query: `"{NICHE}" "{CITY}" (${kws("open")}) after:${year-1}-01-01`, desc: "Aperturas desde el año pasado", proTip: "Usa after: para encontrar negocios que abrieron recientemente" },
        { name: "Sin web propia", query: `"{NICHE}" "{CITY}" (site:instagram.com OR site:facebook.com OR site:wa.me) -site:${R.tld}`, desc: "Solo en redes, sin web", proTip: "Alta conversión: necesitan presencia web" },
        { name: "Cotización activa", query: `"{NICHE}" "{CITY}" (${kws("quote")}) site:${R.tld}`, desc: "Ofrecen cotización o presupuesto", proTip: "Indica negocio activo buscando clientes" },
      ]
    },

    // ── INSTAGRAM ─────────────────────────────────────────────────────────
    instagram: {
      name: "Instagram Leads", icon: null, color: "#E1306C",
      desc: "Cuentas IG de negocios sin website",
      templates: [
        { name: "Perfiles IG (sin posts)", query: `site:instagram.com "{NICHE}" "{CITY}" -inurl:/p/ -inurl:/reel/ -inurl:/tv/`, desc: "Solo perfiles, sin posts/reels", proTip: "Excluir /p/ /reel/ /tv/ filtra solo cuentas" },
        { name: "Email en bio", query: `site:instagram.com "{NICHE}" "{CITY}" "@gmail" OR "@hotmail" OR "@yahoo" OR "@outlook"`, desc: "Emails visibles en bio de IG", proTip: "Emails en bio son leads directos de alta calidad" },
        { name: "WhatsApp en bio", query: `site:instagram.com "{NICHE}" "{CITY}" "wa.me" OR "whatsapp"`, desc: "Links WA en bios de IG", proTip: "wa.me/... = click-to-chat directo al negocio" },
        { name: "Linktree (sin web)", query: `site:instagram.com "{NICHE}" "{CITY}" "linktr.ee" OR "linktree" OR "beacons.ai"`, desc: "Usan Linktree como web", proTip: "Linktree = no tienen web propia = tu cliente" },
        { name: "Zona específica", query: `site:instagram.com "{NICHE}" "{CITY}" "{ZONE}" -inurl:/p/ -inurl:/reel/`, desc: "Perfiles IG en zona exacta", proTip: "Agrega zona para leads ultra-localizados" },
        { name: "IG Recientes (Google)", query: `site:instagram.com "{NICHE}" "{CITY}" after:${year}-01-01 -inurl:/p/`, desc: "Perfiles indexados este año", proTip: "after:YEAR filtra cuentas recientes" },
        { name: "IG via Yandex", query: `site:instagram.com "{NICHE}" "{CITY}"`, desc: "Buscar en Yandex (índice diferente)", proTip: "Yandex indexa contenido de IG que Google no muestra" },
      ]
    },

    // ── WHATSAPP BUSINESS ─────────────────────────────────────────────────
    whatsapp: {
      name: "WhatsApp Business", icon: null, color: "#25D366",
      desc: "Links y números de WhatsApp de negocios",
      templates: [
        { name: "Links wa.me directos", query: `"{NICHE}" "{CITY}" "wa.me/" -site:instagram.com -site:facebook.com`, desc: "Links click-to-chat de WA", proTip: "wa.me/57... = número colombiano directo" },
        { name: "WhatsApp en webs", query: `"{NICHE}" "{CITY}" intext:"api.whatsapp.com" OR intext:"wa.me"`, desc: "WA embebido en páginas web", proTip: "api.whatsapp.com/send es integración formal" },
        { name: "Catálogo WA Business", query: `"{NICHE}" "{CITY}" "wa.me" "catalog" OR "catálogo"`, desc: "Tienen catálogo de WhatsApp Business", proTip: "Catálogo WA = negocio activo sin e-commerce" },
        { name: "WA en documentos", query: `filetype:pdf OR filetype:docx "{NICHE}" "{CITY}" "whatsapp" OR "wa.me"`, desc: "PDFs/DOCX con número WA", proTip: "Documentos oficiales contienen WA del negocio" },
        { name: "WA + IG combo", query: `site:instagram.com "{NICHE}" "{CITY}" "whatsapp" OR "wa.me" OR "+${R.phone.replace("+","")}"`, desc: "IG con WA visible", proTip: "Doble canal de contacto = negocio activo" },
      ]
    },

    // ── FACEBOOK ──────────────────────────────────────────────────────────
    facebook: {
      name: "Facebook Leads", icon: null, color: "#1877F2",
      desc: "Páginas de Facebook de negocios",
      templates: [
        { name: "Páginas FB (sin posts)", query: `site:facebook.com "{NICHE}" "{CITY}" -inurl:/posts/ -inurl:/photos/ -inurl:/videos/`, desc: "Páginas sin filtrar posts", proTip: "Excluir /posts/ /photos/ muestra solo páginas/perfiles" },
        { name: "Páginas /pages/", query: `site:facebook.com/pages/ "{NICHE}" "{CITY}"`, desc: "Páginas de negocio FB formales", proTip: "facebook.com/pages/ son páginas de empresa, no personales" },
        { name: "FB Marketplace leads", query: `site:facebook.com/marketplace/ "{NICHE}" "{CITY}"`, desc: "Vendedores activos en Marketplace", proTip: "Marketplace = negocios B2C con alto volumen" },
        { name: "FB con teléfono", query: `site:facebook.com "{NICHE}" "{CITY}" (${kws("phone")}) -inurl:/posts/`, desc: "Páginas FB con teléfono visible", proTip: "Teléfono en FB = dato de contacto directo" },
        { name: "Grupos FB activos", query: `site:facebook.com/groups/ "{NICHE}" "{CITY}"`, desc: "Comunidades de negocio activas", proTip: "Grupos = comunidad de compradores/proveedores" },
      ]
    },

    // ── LINKEDIN ──────────────────────────────────────────────────────────
    linkedin: {
      name: "LinkedIn B2B", icon: null, color: "#0077B5",
      desc: "Empresas y decisores B2B en LinkedIn",
      templates: [
        { name: "Empresas en LinkedIn", query: `site:linkedin.com/company/ "{NICHE}" "{CITY}"`, desc: "Páginas de empresa LI", proTip: "linkedin.com/company/ = empresa formal con empleados" },
        { name: "Decisores (Google)", query: `site:linkedin.com/in/ ("CEO" OR "gerente" OR "director" OR "founder") "{NICHE}" "{CITY}"`, desc: "Perfiles de líderes de negocio", proTip: "Busca CEO, gerente, director para B2B directo" },
        { name: "Empresas buscando (Jobs)", query: `site:linkedin.com/jobs/ "{NICHE}" "{CITY}"`, desc: "Empresas contratando (crecimiento)", proTip: "Empresa que contrata = empresa con presupuesto" },
        { name: "Freelancers LI", query: `site:linkedin.com/in/ ("freelance" OR "independiente" OR "autónomo" OR "consultor") "{NICHE}" "{CITY}"`, desc: "Profesionales independientes", proTip: "Freelancers buscan herramientas y servicios constantemente" },
      ]
    },

    // ── EMAILS & ARCHIVOS ─────────────────────────────────────────────────
    emails: {
      name: "Emails & Datos Directos", icon: null, color: "#00C853",
      desc: "Datos de contacto expuestos en documentos y páginas",
      templates: [
        { name: "Emails en PDFs", query: `filetype:pdf "{NICHE}" "{CITY}" "@"`, desc: "PDFs con emails visibles", proTip: "PDFs de menús, catálogos y tarifas contienen emails reales" },
        { name: "Emails en Excel/CSV", query: `filetype:xlsx OR filetype:csv OR filetype:xls "{NICHE}" "{CITY}" "@"`, desc: "Bases de datos con emails", proTip: "Excel/CSV de proveedores = lista de leads directa" },
        { name: "Emails en Word/DOCX", query: `filetype:docx OR filetype:doc "{NICHE}" "{CITY}" "@"`, desc: "Documentos con contactos", proTip: "Propuestas y contratos expuestos contienen emails" },
        { name: "Emails en texto plano", query: `filetype:txt "{NICHE}" "{CITY}" "@gmail" OR "@hotmail" OR "@outlook"`, desc: "Archivos TXT con emails", proTip: "Listas de distribución y bases simples en .txt" },
        { name: "Emails en slides", query: `filetype:pptx OR filetype:ppt "{NICHE}" "{CITY}" "@"`, desc: "Presentaciones con contactos", proTip: "Presentaciones de empresa = correo del director visible" },
        { name: "Emails en páginas web", query: `"{NICHE}" "{CITY}" "@gmail.com" OR "@yahoo.com" OR "@hotmail.com" -site:instagram.com -site:facebook.com`, desc: "Emails gratuitos en páginas web", proTip: "Gmail/hotmail = PYME sin servidor de correo corporativo" },
        { name: "Correos corporativos", query: `"{NICHE}" "{CITY}" "info@" OR "ventas@" OR "contacto@" OR "admin@" -site:instagram.com`, desc: "Emails corporativos reales", proTip: "info@ ventas@ son contactos del área comercial" },
        { name: "Teléfonos en documentos", query: `filetype:pdf OR filetype:xlsx "{NICHE}" "{CITY}" "${R.phone}"`, desc: "Docs con prefijo de teléfono", proTip: "Prefijo ${R.phone} en doc = teléfono real del negocio" },
      ]
    },

    // ── REDES SOCIALES (OTROS) ────────────────────────────────────────────
    social: {
      name: "Multi-Red Social", icon: null, color: "#7C4DFF",
      desc: "Presencia en redes: TikTok, YouTube, Twitter, Reddit",
      templates: [
        { name: "TikTok Negocios", query: `site:tiktok.com "@" "{NICHE}" "{CITY}" -inurl:/video/`, desc: "Cuentas TikTok de negocio", proTip: "TikTok = negocio digital activo. -inurl:/video/ filtra solo perfiles" },
        { name: "YouTube Canales", query: `site:youtube.com/channel/ OR site:youtube.com/c/ "{NICHE}" "{CITY}"`, desc: "Canales de negocio en YouTube", proTip: "Canal YouTube = negocio con presupuesto de marketing" },
        { name: "Twitter negocios", query: `site:x.com "{NICHE}" "{CITY}" -inurl:/status/`, desc: "Cuentas Twitter de negocio", proTip: "-inurl:/status/ filtra solo perfiles, no tweets" },
        { name: "Pinterest catálogos", query: `site:pinterest.com "{NICHE}" "{CITY}"`, desc: "Catálogos visuales en Pinterest", proTip: "Pinterest = negocio con productos visuales (moda, deco, comida)" },
        { name: "Reddit proveedores", query: `site:reddit.com "proveedor" OR "vendedor" OR "fabricante" "{NICHE}" "{CITY}"`, desc: "Ofertas de proveedores en Reddit", proTip: "subreddit:Colombia subreddit:latinamerica para LATAM" },
      ]
    },

    // ── WEBS OBSOLETAS / OPORTUNIDADES ───────────────────────────────────
    obsolete: {
      name: "Webs Obsoletas", icon: null, color: "#FF6B35",
      desc: "Sitios abandonados, sin HTTPS, con tecnología vieja",
      templates: [
        { name: "Copyright viejo", query: `"{NICHE}" "{CITY}" intext:"© 2018" OR intext:"© 2019" OR intext:"© 2017" OR intext:"© 2016"`, desc: "Footer con copyright viejo", proTip: "© 2016-2019 = sitio abandonado = oportunidad de redesign" },
        { name: "Sin HTTPS", query: `"{NICHE}" "{CITY}" inurl:http:// -inurl:https:// intext:"${k.contact.split("|")[0]}"`, desc: "Sin certificado SSL", proTip: "HTTP sin S = hosting viejo o sitio desactualizado" },
        { name: "WordPress antiguo", query: `"{NICHE}" "{CITY}" inurl:wp-content intext:"© 2019" OR intext:"© 2018"`, desc: "WordPress sin actualizar", proTip: "WP viejo = vulnerable + cliente para mantenimiento" },
        { name: "Joomla/Drupal viejo", query: `"{NICHE}" "{CITY}" inurl:index.php?option= OR inurl:node/ intext:"${k.contact.split("|")[0]}"`, desc: "Joomla/Drupal sin actualizar", proTip: "Joomla con URL ?option= = sitio muy viejo" },
        { name: "Sin móvil", query: `"{NICHE}" "{CITY}" intext:"best viewed in" OR intext:"Internet Explorer" -site:facebook.com`, desc: "No responsive/mobile", proTip: '"Best viewed in" = sin diseño móvil' },
      ]
    },

    // ── REGIONAL (LATAM SPECIFIC) ─────────────────────────────────────────
    regional: {
      name: `Regional ${R.name}`, icon: null, color: "#FFD600",
      desc: `Plataformas y directorios locales de ${R.name}`,
      templates: [
        ...(R.ml ? [
          { name: "MercadoLibre vendedores", query: `site:${R.ml} "{NICHE}" "${R.name === "Brasil" ? "São Paulo" : "{CITY}"}"`, desc: "Vendedores con volumen en ML", proTip: "Vendedores ML top = B2B con inventario alto" },
          { name: "ML con email", query: `site:${R.ml} "{NICHE}" "{CITY}" "@"`, desc: "Vendedores ML con email expuesto", proTip: "Emails en perfiles ML son reales y verificados" },
        ] : []),
        ...(R.pa ? [
          { name: "Páginas Amarillas", query: `site:${R.pa} "{NICHE}" "{CITY}"`, desc: "Directorio tradicional local", proTip: "PA tiene datos de contacto estructurados" },
        ] : []),
        ...R.dirs.map((d: string) => ({
          name: `Dir: ${d}`, query: `site:${d} "{NICHE}" "{CITY}"`, desc: `Directorio ${d}`, proTip: `${d} tiene datos estructurados de negocios locales`
        })),
        ...R.apps.map((a: string) => ({
          name: `App: ${a}`, query: `"{NICHE}" "{CITY}" "${a}"`, desc: `Presentes en ${a}`, proTip: `Negocios en ${a} son activos y buscan más clientes`
        })),
      ]
    },

    // ── MARKETPLACE ───────────────────────────────────────────────────────
    marketplace: {
      name: "Marketplaces & Clasificados", icon: null, color: "#FF9100",
      desc: "OLX, Craigslist, Trovit, clasificados locales",
      templates: [
        // OLX, Trovit y Locanto: solo se usan con dominio .co (no verificados para otros países)
        ...(r === "co" ? [
          { name: "OLX negocios", query: `site:olx.com.co "{NICHE}" "{CITY}"`, desc: "Vendedores en OLX", proTip: "Solo Colombia: dominio olx.com.co" },
          { name: "Trovit servicios", query: `site:trovit.com.co "{NICHE}" "{CITY}"`, desc: "Servicios en Trovit Colombia", proTip: "Trovit agrega clasificados de múltiples fuentes" },
          { name: "Locanto servicios", query: `site:locanto.com.co "{NICHE}" "{CITY}"`, desc: "Locanto = clasificados con contacto", proTip: "Locanto muestra el número por defecto" },
        ] : []),
        { name: "Clasificados locales", query: `"{NICHE}" "{CITY}" "clasificados" OR "anuncios" OR "avisos" -site:facebook.com`, desc: "Clasificados de nicho", proTip: "Clasificados locales = negocios pequeños con necesidades reales" },
        // Computrabajo existe con subdominio por país en LATAM hispana
        ...(["co","mx","ar","cl","pe","ec"].includes(r) ? [
          { name: "Computrabajo (leads)", query: `site:${r}.computrabajo.com "{NICHE}" "{CITY}"`, desc: "Empresas contratando = creciendo", proTip: "Empresa que publica empleo tiene presupuesto y decisores" },
        ] : []),
        { name: "Indeed empresas", query: `site:indeed.com "{NICHE}" "{CITY}"`, desc: "Empresas en Indeed", proTip: "Indeed muestra empresa + descripción + a veces email" },
      ]
    },

    // ── REVIEWS / REPUTACIÓN ──────────────────────────────────────────────
    reviews: {
      name: "Reviews & Reputación", icon: null, color: "#FF4081",
      desc: "Trustpilot, G2, Clutch, TripAdvisor — encuentra clientes insatisfechos",
      templates: [
        { name: "Reviews negativos (leads)", query: `site:trustpilot.com "{NICHE}" "{CITY}" "1 star" OR "2 star" OR "bad" OR "terrible"`, desc: "Clientes insatisfechos con competidores", proTip: "Review negativo de competidor = tu lead activo" },
        { name: "Clutch agencias", query: `site:clutch.co "{NICHE}" "{CITY}"`, desc: "Agencias B2B en Clutch", proTip: "Clutch tiene email y teléfono verificado de cada agencia" },
        { name: "G2 software", query: `site:g2.com "{NICHE}" "{CITY}"`, desc: "SaaS y software en G2", proTip: "G2 muestra empresa + contacto + alternativas" },
        { name: "TripAdvisor turismo", query: `site:tripadvisor.com "{NICHE}" "{CITY}"`, desc: "Turismo, hoteles, restaurantes", proTip: "TripAdvisor tiene teléfono, web y email directo" },
        { name: "Google reviews (dork)", query: `"{NICHE}" "{CITY}" "Google Maps" "reseñas" OR "reviews" ${kws("phone")}`, desc: "Negocios con reviews de Google", proTip: "Busca negocios que mencionan sus Google reviews" },
        { name: "Capterra software", query: `site:capterra.com "{NICHE}" "{CITY}"`, desc: "Software con reviews en Capterra", proTip: "Capterra tiene contacto del proveedor de software" },
      ]
    },


    // ── YANDEX EXCLUSIVO ──────────────────────────────────────────────────
    yandex_ops: {
      name: "Yandex Power Operators", icon: null, color: "#FF0000",
      desc: "Operadores exclusivos de Yandex — indexa lo que Google ignora",
      templates: [
      ]
    },

    // ── BRAVE EXCLUSIVO ───────────────────────────────────────────────────
    brave_ops: {
      name: "Brave Search Operators", icon: null, color: "#FB542B",
      desc: "Índice independiente de Brave — resultados que Google/Bing no muestran",
      templates: [
        { name: "País + nicho (independiente)", query: `"{NICHE}" "{CITY}" loc:${r} lang:${R.lang}`, desc: "Brave: filtro país y lengua", proTip: "Brave tiene índice propio. Encuentra páginas no en Google." },
        { name: "Contactos recientes Brave", query: `"{NICHE}" "{CITY}" (${kws("contact")}) NOT site:instagram.com`, desc: "Páginas de contacto indexadas Brave", proTip: "after: filtra páginas nuevas no en Google aún" },
        { name: "Filetype Brave", query: `"{NICHE}" "{CITY}" filetype:pdf "@" loc:${r}`, desc: "PDFs por país en Brave", proTip: "Brave indexa PDFs que Google omite" },
        { name: "Directorios Brave", query: `site:${R.dirs[0] || "cylex.com"} "{NICHE}" "{CITY}" loc:${r}`, desc: "Directorio + filtro país Brave", proTip: "Combina site: y country: para precisión máxima" },
      ]
    },

    // ── POWER COMBOS ──────────────────────────────────────────────────────
    advanced: {
      name: "Power Combos", icon: null, color: "#FF9100",
      desc: "Combinaciones multi-operador de alta precisión",
      templates: [
        { name: "Hot Lead (email+WA)", query: `"{NICHE}" "{CITY}" ("@gmail" OR "@hotmail" OR "wa.me") -site:instagram.com -site:facebook.com`, desc: "Contacto directo: email o WA", proTip: "Excluye IG/FB = solo webs propias con datos directos" },
        { name: "Freelancers activos", query: `"{NICHE}" "{CITY}" (${kws("independent")}) -site:linkedin.com -site:computrabajo.com`, desc: "Profesionales independientes", proTip: "Freelancers activos buscan servicios constantemente" },
        { name: "Bajo SEO + contacto", query: `"{NICHE}" "{CITY}" -site:instagram.com -site:facebook.com intitle:"${k.contact.split("|")[0]}"`, desc: "Web propia + contacto en título", proTip: "intitle:contacto = página dedicada de contacto" },
        { name: "Teléfono en URL", query: `"{NICHE}" "{CITY}" inurl:tel: OR inurl:phone OR inurl:telefono`, desc: "Teléfono en la URL", proTip: "tel: en URL = schema de teléfono clickeable" },
        { name: "AROUND proximity combo", query: `"{NICHE}" AROUND(5) "${k.contact.split("|")[0]}" site:${R.tld}`, desc: "Nicho a 5 palabras de contacto", proTip: "AROUND(n) = ambas palabras dentro de n palabras" },
        { name: "Nuevos en 90 días", query: `"{NICHE}" "{CITY}" after:${new Date(Date.now()-90*24*60*60*1000).toISOString().split("T")[0]} (${kws("open")})`, desc: "Abiertos en últimos 90 días", proTip: "Últimos 90 días = negocios que acaban de abrir" },
        { name: "Triple motor combo", query: `"{NICHE}" "{CITY}" (${kws("contact")}) filetype:pdf OR filetype:xlsx OR filetype:csv`, desc: "Datos en archivos descargables", proTip: "Combinación filetype = bases de datos de contacto directas" },
        { name: "Bing loc + teléfono", query: `"{NICHE}" "{CITY}" loc:${R.bing_loc} "${k.phone.split("|")[0]}"`, desc: "Bing: país + teléfono en body", proTip: "loc: filtra por país en Bing; la frase exacta reemplaza a inbody:, poco fiable" },
      ]
    },

    // ── PORTALES POPULARES POR PAÍS ────────────────────────────────────────
    portales: {
      name: "Portales por País", icon: null, color: "#1565C0",
      desc: "Los portales de búsqueda y directorios más visitados de cada país",
      templates: [
        { name: "TripAdvisor (portal #1)", query: `site:tripadvisor.com "{NICHE}" "{CITY}"`, desc: "Portal de reviews más grande del mundo", proTip: "TripAdvisor tiene teléfono, web y email directo de cada negocio" },
        ...(R.pa ? [{ name: "Páginas Amarillas + contacto", query: `site:${R.pa} "{NICHE}" "{CITY}" (${kws("phone")})`, desc: "Directorio oficial con filtro de teléfono", proTip: "PA es el directorio más confiable — datos estructurados y verificados" }] : []),
        { name: "Top 5 portales combo", query: `"{NICHE}" "{CITY}" (${dirsTop5})`, desc: "5 portales más populares en un solo dork", proTip: "Máxima cobertura — Google devuelve 10 por página, pagina para más" },
        { name: "Top 3 + email/WA", query: `"{NICHE}" "{CITY}" (${dirsTop3}) ("@" OR "wa.me" OR ${kws("phone")})`, desc: "Portales top con contacto directo visible", proTip: "Filtra solo negocios que exponen contacto en el directorio" },
        { name: "Portales + archivo", query: `"{NICHE}" "{CITY}" (${dirsTop4}) (filetype:pdf OR filetype:xlsx)`, desc: "Documentos descargables en directorios top", proTip: "PDFs de directorios suelen tener bases de datos completas" },
        { name: "Todos los portales (ALL)", query: `"{NICHE}" "{CITY}" (${dirsAll})`, desc: "Todos los portales del país en un dork", proTip: "Máxima cobertura — puede devolver muchos resultados" },
        { name: "Bing local + portales", query: `"{NICHE}" "{CITY}" loc:${R.bing_loc} (${dirsTop3})`, desc: "Portales filtrados por país en Bing", proTip: "Combina loc: de Bing con site: de directorios para precisión máxima" },
      ]
    },

    // ── BULK DORKS ────────────────────────────────────────────────────────
    bulk: {
      name: "Bulk & Automatización", icon: null, color: "#607D8B",
      desc: "Dorks para generación masiva de leads",
      templates: [
        { name: "Todas las redes", query: `"{NICHE}" "{CITY}" (site:instagram.com OR site:facebook.com OR site:tiktok.com OR site:x.com) -inurl:/p/ -inurl:/posts/`, desc: "Todas las redes en un dork", proTip: "Un solo dork para cubrir todas las redes" },
        { name: "Todos los portales (país)", query: `"{NICHE}" "{CITY}" (${dirsAll})`, desc: "Todos los portales y directorios del país", proTip: "Combina todos los portales en un solo dork — máxima cobertura" },
        { name: "Todos los archivos", query: `"{NICHE}" "{CITY}" (filetype:pdf OR filetype:xlsx OR filetype:csv OR filetype:docx) "@"`, desc: "Todos los tipos de archivo con email", proTip: "Cubre todos los formatos de archivo con emails" },
        { name: "Multi-motor Bing loc", query: `"{NICHE}" "{CITY}" loc:${R.bing_loc} (${kws("contact")}) (${kws("phone")})`, desc: "Bing con filtro local", proTip: "Bing loc: es más agresivo que Google para datos locales" },
      ]
    },
  };
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

export function fillTemplate(q: string, niche: string, city: string, zone: string, year: number, showErrors: boolean): string {
  const n = niche || (showErrors ? "!!!" : "dentista");
  const c = city || (showErrors ? "!!!" : "medellín");
  return q
    .replace(/\{NICHE\}/g, n)
    .replace(/\{CITY\}/g, c)
    .replace(/\{YEAR\}/g, String(year))
    .replace(/\{ZONE\}/g, zone || (showErrors ? "!!!" : "centro"));
}

export function getBulkDorks(TEMPLATES: Record<string, CategoryTemplate>, niche: string, city: string, zone: string, region: string, showErrors: boolean): any[] {
  const year = new Date().getFullYear();
  const all: any[] = [];
  if (!niche.trim() || !city.trim()) return [];
  for (const cat of Object.values(TEMPLATES)) {
    for (const t of cat.templates) {
      const query = fillTemplate(t.query, niche, city, zone, year, showErrors);
      all.push({ cat: cat.name, name: t.name, query });
    }
  }
  return all;
}

// Build search URL for any registered engine
// Google ignora num=100 desde sept-2025 (10 por página); Bing max 50; DDG no admite count
export function buildSearchUrl(engineId: string, query: string, regionKey?: string): string {
  const engine = SEARCH_ENGINES[engineId];
  const q = encodeURIComponent(query);
  if (!engine) return `https://www.google.com/search?q=${q}`;

  // Special: google uses region-specific domain + max results
  if (engineId === "google" && regionKey) {
    const R = REGIONS[regionKey];
    if (R) return `https://www.${R.google}/search?q=${q}`;
  }
  if (engineId === "google") return `https://www.google.com/search?q=${q}`;

  // Special: bing uses region cc param + max count
  if (engineId === "bing" && regionKey) {
    const R = REGIONS[regionKey];
    if (R) return `https://www.bing.com/search?cc=${R.bing_loc}&count=50&q=${q}`;
  }
  if (engineId === "bing") return `https://www.bing.com/search?count=50&q=${q}`;

  // Special: DDG uses region param
  if (engineId === "ddg" && regionKey) {
    const R = REGIONS[regionKey];
    if (R) return `https://duckduckgo.com/?kl=${R.ddg_region}&q=${q}`;
  }

  return `${engine.baseUrl}${q}`;
}

// Get all engines by category
export function getEnginesByCategory(category: string): SearchEngine[] {
  return Object.values(SEARCH_ENGINES).filter(e => e.category === category);
}

// Get all bangs by category
export function getBangsByCategory(category: string) {
  return Object.values(DDG_BANGS).filter(b => b.category === category);
}

// Wrap query with DDG bang
export function applyBang(bang: string, query: string): string {
  return `${bang} ${query}`;
}
