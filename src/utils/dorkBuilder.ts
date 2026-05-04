import type { Template, CategoryTemplate, Region } from '../types';

export const REGIONS: Record<string, Region> = {
  co: { name: "Colombia", flag: "🇨🇴", lang: "es", google: "google.com.co", tld: ".com.co", bing_loc: "co", ddg_region: "co-es",
    maps: "google.com.co/maps", ml: "mercadolibre.com.co", pa: "paginasamarillas.com.co",
    dirs: ["cylex.com.co","infoisinfo.com.co","tupalo.com","empresite.eleconomistaamerica.co"],
    apps: ["Rappi","Domicilios.com"], phone: "+57",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular|móvil|llamar", order: "pedidos|domicilios|envíos|delivery",
      open: "abrimos|inauguración|apertura|nuevo local", review: "reseña|reseñas|review|reviews", schedule: "horario|horarios",
      quote: "cotización|cotizar|presupuesto", independent: "independiente|freelance|por cuenta propia" }
  },
  mx: { name: "México", flag: "🇲🇽", lang: "es", google: "google.com.mx", tld: ".com.mx", bing_loc: "mx", ddg_region: "mx-es",
    maps: "google.com.mx/maps", ml: "mercadolibre.com.mx", pa: "seccionamarilla.com.mx",
    dirs: ["cylex.com.mx","infoisinfo.com.mx","guialis.com.mx","mexpages.com"],
    apps: ["Rappi","Didi Food","Uber Eats"], phone: "+52",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|a domicilio|envíos|delivery",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review|opinión", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  ar: { name: "Argentina", flag: "🇦🇷", lang: "es", google: "google.com.ar", tld: ".com.ar", bing_loc: "ar", ddg_region: "ar-es",
    maps: "google.com.ar/maps", ml: "mercadolibre.com.ar", pa: "paginasamarillas.com.ar",
    dirs: ["cylex.com.ar","guiafe.com.ar","donempresa.com"],
    apps: ["Rappi","PedidosYa"], phone: "+54",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review", schedule: "horario|horarios",
      quote: "presupuesto|cotización", independent: "independiente|freelance" }
  },
  cl: { name: "Chile", flag: "🇨🇱", lang: "es", google: "google.cl", tld: ".cl", bing_loc: "cl", ddg_region: "cl-es",
    maps: "google.cl/maps", ml: "mercadolibre.cl", pa: "paginasamarillas.cl",
    dirs: ["cylex.cl","amarillas.cl","guioteca.com"],
    apps: ["Rappi","PedidosYa","Cornershop"], phone: "+56",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular|fono", order: "pedidos|despacho|envíos|delivery",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  pe: { name: "Perú", flag: "🇵🇪", lang: "es", google: "google.com.pe", tld: ".com.pe", bing_loc: "pe", ddg_region: "pe-es",
    maps: "google.com.pe/maps", ml: "mercadolibre.com.pe", pa: "paginasamarillas.com.pe",
    dirs: ["cylex.com.pe","infoisinfo.com.pe"],
    apps: ["Rappi","PedidosYa"], phone: "+51",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|review|opinión", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  ec: { name: "Ecuador", flag: "🇪🇨", lang: "es", google: "google.com.ec", tld: ".com.ec", bing_loc: "ec", ddg_region: "ec-es",
    maps: "google.com.ec/maps", ml: "mercadolibre.com.ec", pa: "paginasamarillas.com.ec",
    dirs: ["cylex.com.ec","guialocal.com.ec"],
    apps: ["Rappi","PedidosYa"], phone: "+593",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|review", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  br: { name: "Brasil", flag: "🇧🇷", lang: "pt", google: "google.com.br", tld: ".com.br", bing_loc: "br", ddg_region: "br-pt",
    maps: "google.com.br/maps", ml: "mercadolivre.com.br", pa: null,
    dirs: ["telelistas.net","guiamais.com.br","apontador.com.br"],
    apps: ["iFood","Rappi"], phone: "+55",
    kw: { contact: "contato|fale conosco", phone: "telefone|celular|whatsapp", order: "pedidos|delivery|entregas",
      open: "inauguração|abertura|novo", review: "avaliação|avaliações|review", schedule: "horário|horários",
      quote: "orçamento|solicitar orçamento", independent: "autônomo|freelancer" }
  },
  us: { name: "USA", flag: "🇺🇸", lang: "en", google: "google.com", tld: ".com", bing_loc: "us", ddg_region: "us-en",
    maps: "google.com/maps", ml: null, pa: null,
    dirs: ["yelp.com","yellowpages.com","bbb.org","manta.com","thumbtack.com"],
    apps: ["DoorDash","Uber Eats","GrubHub"], phone: "+1",
    kw: { contact: "contact|contact us", phone: "phone|call|cell", order: "order|delivery|pickup",
      open: "now open|grand opening", review: "review|reviews|rating", schedule: "hours|business hours",
      quote: "quote|estimate", independent: "freelance|independent" }
  },
  es: { name: "España", flag: "🇪🇸", lang: "es", google: "google.es", tld: ".es", bing_loc: "es", ddg_region: "es-es",
    maps: "google.es/maps", ml: null, pa: "paginasamarillas.es",
    dirs: ["qdq.com","cylex.es","infoisinfo.es"],
    apps: ["Glovo","Just Eat"], phone: "+34",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|móvil", order: "pedidos|reparto|delivery",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|valoración", schedule: "horario|horarios",
      quote: "presupuesto|cotización", independent: "autónomo|freelance" }
  }
};

export const OPERATORS: Record<string, any[]> = {
  google: [
    { id: "site", syntax: "site:", status: "active", desc: "Domain restriction", example: "site:instagram.com" },
    { id: "intitle", syntax: "intitle:", status: "active", desc: "Title match", example: 'intitle:"contacto"' },
    { id: "inurl", syntax: "inurl:", status: "active", desc: "URL match", example: "inurl:admin" },
    { id: "filetype", syntax: "filetype:", status: "active", desc: "File type", example: "filetype:pdf" },
    { id: "before", syntax: "before:", status: "active", desc: "Before date", example: "before:2024-01-01" },
    { id: "after", syntax: "after:", status: "active", desc: "After date", example: "after:2024-01-01" },
    { id: "OR", syntax: "OR", status: "active", desc: "Boolean OR", example: "dentist OR doctor" },
    { id: "minus", syntax: "-", status: "active", desc: "Exclude", example: "-franchise" },
    { id: "exact", syntax: '""', status: "active", desc: "Exact phrase", example: '"web design"' },
    { id: "AROUND", syntax: "AROUND(n)", status: "active", desc: "Proximity", example: '"dentist" AROUND(3) "reviews"' },
    { id: "ext:", syntax: "ext:", status: "deprecated", desc: "⚠️ Deprecated — use filetype:", example: "ext:pdf" },
    { id: "inanchor:", syntax: "inanchor:", status: "deprecated", desc: "⚠️ Deprecated — low reliability", example: "inanchor:keyword" },
    { id: "allintext:", syntax: "allintext:", status: "deprecated", desc: "⚠️ Deprecated — use quotes", example: "allintext:contact us" },
  ],
  bing: [
    { id: "b_contains", syntax: "contains:", status: "active", desc: "File link", example: "contains:pdf" },
    { id: "b_loc", syntax: "loc:", status: "active", desc: "Country code", example: "loc:co" },
  ],
  ddg: [
    { id: "d_region", syntax: "region:", status: "active", desc: "Region filter", example: "region:co-es" },
  ]
};

export function buildTemplates(r: string): Record<string, CategoryTemplate> {
  const R = REGIONS[r];
  const k = R.kw;
  const kws = (field: string, n = 2) => k[field].split("|").slice(0, n).map((w: string) => `"${w}"`).join(" OR ");
  const year = new Date().getFullYear();

  return {
      gmb: {
        name: "Google My Business", icon: null, color: "#4285F4",
        desc: "Negocios en Google Maps sin presencia web",
        templates: [
          { name: "Perfiles de negocios", query: `site:${R.maps}/place/ "{NICHE}" "{CITY}"`, desc: "Perfiles GMB — muchos sin web propia", proTip: "Filtra perfiles que no tienen sitio web vinculado" },
          { name: "Pocas reseñas", query: `site:${R.google}/maps "{NICHE}" "{CITY}" (${kws("review", 3)})`, desc: "Negocios que necesitan gestión de reseñas", proTip: "Busca menos de 10 reseñas para encontrar oportunidades" },
          { name: "Negocios nuevos", query: `"{NICHE}" "{CITY}" (${kws("open", 3)}) after:{YEAR}-01-01`, desc: "Negocios recientemente abiertos", proTip: "Usa after: para encontrar negocios nuevos este año" },
        ]
      },
    instagram: {
        name: "Instagram Leads", icon: null, color: "#E1306C",
        desc: "Cuentas IG de negocios sin website",
        templates: [
          { name: "Solo perfiles", query: `site:instagram.com "{NICHE}" "{CITY}" -inurl:/p/ -inurl:/reel/`, desc: "Filtra posts individuales", proTip: "Excluye /p/ y /reel/ para ver solo perfiles" },
          { name: "Linktree users", query: `site:instagram.com "{NICHE}" "{CITY}" "linktr.ee" OR "linktree"`, desc: "Usan Linktree = sin web propia", proTip: "Linktree indica que no tienen sitio web propio" },
          { name: "Email en bio", query: `site:instagram.com "{NICHE}" "{CITY}" "@gmail.com" OR "@hotmail.com"`, desc: "Email personal visible en bio", proTip: "Busca @gmail o @hotmail en la bio del perfil" },
        ]
      },
    obsolete: {
        name: "Webs Obsoletas", icon: null, color: "#FF6B35",
        desc: "Websites anticuados o abandonados",
        templates: [
          { name: "Copyright viejo", query: `"{NICHE}" "{CITY}" intext:"© 2018" OR intext:"© 2019" OR intext:"© 2017"`, desc: "Footer viejo = sitio abandonado", proTip: "Buscando © 2017-2019 encuentras sitios sin mantenimiento" },
          { name: "Sin HTTPS", query: `"{NICHE}" "{CITY}" inurl:http:// -inurl:https:// intext:"${k.contact.split("|")[0]}"`, desc: "Sin certificado SSL", proTip: "HTTP (sin S) indica sitio desactualizado" },
        ]
      },
    emails: {
        name: "Emails & Datos", icon: null, color: "#00C853",
        desc: "Datos de contacto expuestos públicos",
        templates: [
          { name: "Emails en docs", query: `filetype:pdf OR filetype:xlsx "{NICHE}" "{CITY}" "@gmail.com" OR "@hotmail.com"`, desc: "Archivos con emails expuestos", proTip: "PDFs y XLSX a menudo exponen emails de contacto" },
          { name: "WhatsApp", query: `"{NICHE}" "{CITY}" "wa.me/" OR "api.whatsapp.com/send"`, desc: "Links directos de WhatsApp", proTip: "wa.me/ links son clicks-to-chat directos" },
          { name: "Directorios", query: `"{NICHE}" "{CITY}" (${R.dirs.slice(0, 2).map((d: string) => `site:${d}`).join(" OR ")})`, desc: "Directorios específicos de la región", proTip: "Cylex, PaginasAmillas, etc. suelen listar emails" },
        ]
      },
    social: {
        name: "Redes Sociales", icon: null, color: "#7C4DFF",
        desc: "Presencia en redes sin sitio web propio",
        templates: [
          { name: "Facebook Only", query: `site:facebook.com "{NICHE}" "{CITY}" -inurl:www. -inurl:.com/`, desc: "Negocios que solo operan en FB", proTip: "Filtra www. y .com/ para evitar posts" },
          { name: "LinkedIn Co.", query: `site:linkedin.com/company/ "{NICHE}" "{CITY}"`, desc: "Perfiles de empresa en LinkedIn", proTip: "Ideal para B2B y servicios profesionales" },
          { name: "TikTok Leads", query: `site:tiktok.com "{NICHE}" "{CITY}"`, desc: "Emprendedores activos en TikTok", proTip: "TikTok indica negocio joven y digital" },
        ]
      },
    regional: {
        name: "Regional Tools", icon: null, color: "#FFD600",
        desc: `Plataformas locales de ${R.name}`,
        templates: [
          ...(R.ml ? [{ name: "MercadoLibre", query: `site:${R.ml} "{NICHE}" "{CITY}"`, desc: "Vendedores locales con volumen", proTip: "ML tiene miles de vendedores B2B locales" }] : []),
          ...(R.pa ? [{ name: "Paginas Amarillas", query: `site:${R.pa} "{NICHE}" "{CITY}"`, desc: "Directorio tradicional", proTip: "Directorios locales suelen tener datos de contacto" }] : []),
          ...R.apps.map((a: string) => ({ name: a, query: `"{NICHE}" "{CITY}" "${a}"`, desc: `Presentes en ${a}`, proTip: `Filtra negocios que usan ${a} para pedidos` })),
        ]
      },
    advanced: {
        name: "Power Combos", icon: null, color: "#FF9100",
        desc: "Combinaciones de alta precisión",
        templates: [
          { name: "Hot Leads", query: `"{NICHE}" "{CITY}" ("@gmail.com" OR "@hotmail.com" OR "wa.me") -site:instagram.com -site:facebook.com`, desc: "Contactos directos fuera de redes", proTip: "Excluye IG/FB para encontrar emails directos" },
          { name: "Freelancers", query: `"{NICHE}" "{CITY}" (${kws("independent")}) ("whatsapp" OR "@gmail")`, desc: "Profesionales independientes", proTip: "Busca palabras como 'freelance', 'independiente', 'autónomo'" },
          { name: "Weak SEO", query: `"{NICHE}" "{CITY}" -site:instagram.com -site:facebook.com inurl:${k.contact.split("|")[0]}`, desc: "Sitios con bajo SEO (sin redes)", proTip: "Sin IG/FB + inurl:contacto = oportunidad" },
        ]
      }
  };
}

export function fillTemplate(q: string, niche: string, city: string, zone: string, year: number, showErrors: boolean): string {
  return q
    .replace(/\{NICHE\}/g, niche || (showErrors ? "!!!" : "restaurante"))
    .replace(/\{CITY\}/g, city || (showErrors ? "!!!" : "bogota"))
    .replace(/\{YEAR\}/g, String(year))
    .replace(/\{ZONE\}/g, zone || (showErrors ? "!!!" : "centro"));
}

export function getBulkDorks(TEMPLATES: Record<string, CategoryTemplate>, niche: string, city: string, zone: string, region: string, showErrors: boolean): any[] {
  const year = new Date().getFullYear();
  const all: any[] = [];
  if (!niche.trim() || !city.trim() || !zone.trim()) return [];
  for (const cat of Object.values(TEMPLATES)) {
    for (const t of cat.templates) {
      const query = fillTemplate(t.query, niche, city, zone, year, showErrors);
      all.push({ cat: cat.name, name: t.name, query });
    }
  }
  return all;
}
