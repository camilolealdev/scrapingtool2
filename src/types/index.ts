export interface Region {
  name: string;
  flag: string;
  lang: string;
  google: string;
  tld: string;
  bing_loc: string;
  ddg_region: string;
  maps: string;
  ml: string | null;
  pa: string | null;
  dirs: string[];
  apps: string[];
  phone: string;
  kw: {
    contact: string;
    phone: string;
    order: string;
    open: string;
    review: string;
    schedule: string;
    quote: string;
    independent: string;
  };
}

export interface Template {
  name: string;
  query: string;
  desc: string;
  proTip?: string;
}

export interface CategoryTemplate {
  name: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
  templates: Template[];
}

export interface QueryResult {
  query: string;
  engine: string;
  time: string;
  ts: number;
  flag: string;
}

export interface ScrapeResult {
  name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  address?: string;
  lat?: number;
  lng?: number;
  notes?: string;
}

export interface LogEntry {
  time: string;
  msg: string;
}

export interface DorkOp {
  id: string;
  syntax: string;
  status: string;
  desc: string;
  example: string;
}

export interface BulkDork {
  cat: string;
  name: string;
  query: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface MapParams {
  center: [number, number];
  zoom: number;
}

export type TEMPLATES_TYPE = Record<string, CategoryTemplate>;
