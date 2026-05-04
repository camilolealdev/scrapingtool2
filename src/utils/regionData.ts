import type { Region } from '@/types';

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
    apps: ["Rappi","DiDi Food","Uber Eats"], phone: "+52",
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
  pe: { name: "Perú", flag: "🇵🇵", lang: "es", google: "google.com.pe", tld: ".com.pe", bing_loc: "pe", ddg_region: "pe-es",
    maps: "google.com.pe/maps", ml: "mercadolibre.com.pe", pa: "paginasamarillas.com.pe",
    dirs: ["cylex.com.pe","infoisinfo.com.pe"],
    apps: ["Rappi","PedidosYa"], phone: "+51",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review", schedule: "horario|horarios",
      quote: "presupuesto|cotización", independent: "independiente|freelance" }
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

export const OPERATORS = [
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
];
