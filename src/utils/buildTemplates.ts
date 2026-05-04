import { useState, useCallback } from 'react';
import { MapPin, Instagram, Globe, Zap, Mail, Database } from "lucide-react";
import type { Region } from '@/types';

export function buildTemplates(r: string, REGIONS: Record<string, Region>, year: number) {
  const R = REGIONS[r];
  const k = R.kw;
  const kws = (field: string, n = 2) => k[field].split('|').slice(0, n).map((w: string) => `"${w}"`).join(" OR ");

  return {
    gmb: {
      name: "Google My Business", icon: "MapPin", color: "#4285F4",
      desc: "Negocios en Google Maps sin presencia web",
      templates: [
        { name: "Perfiles de negocios", query: `site:${R.maps}/place/ "{NICHE}" "{CITY}"`, desc: "Perfiles GMB" },
        { name: "Pocas reseñas", query: `site:${R.google}/maps "{NICHE}" "{CITY}" (${kws("review", 3)})`, desc: "Negocios que necesitan gestión" },
        { name: "Negocios nuevos", query: `"{NICHE}" "{CITY}" (${kws("open", 3)}) after:${year}-01-01`, desc: "Negocios recientemente abiertos" },
      ]
    },
    instagram: {
      name: "Instagram Leads", icon: "Instagram", color: "#E1306C",
      desc: "Cuentas IG de negocios sin website",
      templates: [
        { name: "Solo perfiles", query: `site:instagram.com "{NICHE}" "{CITY}" -inurl:/p/ -inurl:/reel/`, desc: "Filtra posts" },
        { name: "Linktree users", query: `site:instagram.com "{NICHE}" "{CITY}" "linktr.ee" OR "linktree"`, desc: "Usan Linktree" },
        { name: "Email en bio", query: `site:instagram.com "{NICHE}" "{CITY}" "@gmail.com" OR "@hotmail.com"`, desc: "Email visible" },
      ]
    },
    emails: {
      name: "Emails & Datos", icon: "Mail", color: "#00C853",
      desc: "Datos de contacto expuestos",
      templates: [
        { name: "Emails en docs", query: `filetype:pdf OR filetype:xlsx "{NICHE}" "{CITY}" "@gmail.com" OR "@hotmail.com"`, desc: "Archivos con emails" },
        { name: "WhatsApp", query: `"{NICHE}" "{CITY}" "wa.me/" OR "api.whatsapp.com/send"`, desc: "Links WhatsApp" },
        { name: "Directorios", query: `"{NICHE}" "{CITY}" (${R.dirs.slice(0,2).map((d: string) => `site:${d}`).join(" OR ")})`, desc: "Directorios locales" },
      ]
    },
    social: {
      name: "Redes Sociales", icon: "Globe", color: "#7C4DFF",
      desc: "Presencia en redes sin sitio web",
      templates: [
        { name: "Facebook Only", query: `site:facebook.com "{NICHE}" "{CITY}" -inurl:www. -inurl:.com/`, desc: "Solo Facebook" },
        { name: "LinkedIn", query: `site:linkedin.com/company/ "{NICHE}" "{CITY}"`, desc: "Perfiles LinkedIn" },
        { name: "TikTok", query: `site:tiktok.com "{NICHE}" "{CITY}"`, desc: "Emprendedores" },
      ]
    },
    regional: {
      name: "Regional Tools", icon: "Database", color: "#FFD600",
      desc: `Plataformas de ${R.name}`,
      templates: [
        ...(R.ml ? [{ name: "MercadoLibre", query: `site:${R.ml} "{NICHE}" "{CITY}"`, desc: "Vendedores" }] : []),
        ...(R.pa ? [{ name: "Paginas Amarillas", query: `site:${R.pa} "{NICHE}" "{CITY}"`, desc: "Directorio" }] : []),
        ...R.apps.map((a: string) => ({ name: a, query: `"{NICHE}" "{CITY}" "${a}"`, desc: `En ${a}` })),
      ]
    },
    advanced: {
      name: "Power Combos", icon: "Zap", color: "#FF9100",
      desc: "Combinaciones de alta precisión",
      templates: [
        { name: "Hot Leads", query: `"{NICHE}" "{CITY}" ("@gmail.com" OR "@hotmail.com" OR "wa.me") -site:instagram.com -site:facebook.com`, desc: "Contactos directos" },
        { name: "Freelancers", query: `"{NICHE}" "{CITY}" (${kws("independent")}) ("whatsapp" OR "@gmail")`, desc: "Profesionales" },
        { name: "Weak SEO", query: `"{NICHE}" "{CITY}" -site:instagram.com -site:facebook.com inurl:${k.contact.split("|")[0]}`, desc: "Sitios con bajo SEO" },
      ]
    }
  };
}
