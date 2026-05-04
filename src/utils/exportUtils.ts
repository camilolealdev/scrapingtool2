import { ScrapeResult } from '../types';

export function exportLeadsCSV(scrapeResults: ScrapeResult[], niche: string, city: string) {
  if (!scrapeResults.length) return;
  const headers = "Name,Phone,Email,WhatsApp,Website,Instagram,Address,Notes";
  const rows = scrapeResults.map(l =>
    `"${(l.name||'').replace(/"/g,'""')}","${l.phone||''}","${l.email||''}","${l.whatsapp||''}","${l.website||''}","${l.instagram||''}","${(l.address||'').replace(/"/g,'""')}","${(l.notes||'').replace(/"/g,'""')}"`
  ).join("\n");
  const blob = new Blob(["\uFEFF" + headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads_${niche || "leads"}_${city || "data"}.csv`;
  a.click();
}

export function exportScrapeLog(scrapeLog: any[]) {
  if (!scrapeLog.length) return;
  const content = scrapeLog.map(l => `[${l.time}] ${l.msg}`).join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `osint_log_${new Date().getTime()}.txt`;
  a.click();
}

export function exportAllLogs(scrapeLog: any[], allHistoryLogs: any[]) {
  const combined = [...allHistoryLogs, ...scrapeLog];
  if (!combined.length) return;
  const content = combined.map(l => `[${l.time}] ${l.msg}`).join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `osint_combined_logs_${new Date().getTime()}.txt`;
  a.click();
}

export function generatePythonScript(TEMPLATES: any, niche: string, city: string, zone: string, year: number) {
  const bulkDorks = Object.values(TEMPLATES).flatMap((c: any) => c.templates.map((t: any) => {
    return t.query
      .replace(/\{NICHE\}/g, niche || "restaurante")
      .replace(/\{CITY\}/g, city || "bogota")
      .replace(/\{YEAR\}/g, String(year))
      .replace(/\{ZONE\}/g, zone || "centro");
  }));
  const script = `#!/usr/bin/env python3
"""
DORKING LAB — Advanced Lead Extractor v2.0
Author: OSINT AI
"""
import requests
from bs4 import BeautifulSoup
import csv, re, time, json
from urllib.parse import quote

NICHE = "${niche || "restaurante"}"
CITY = "${city || "bogota"}"
QUERIES = [
${bulkDorks.slice(0, 15).map(q => `    "${q.replace(/"/g, '\\"')}",`).join("\n")}
]

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}

def get_links_from_search(query):
    print(f"[*] Searching: {query}")
    url = f"https://www.google.com/search?q={quote(query)}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, 'html.parser')
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if "url?q=" in href and "google.com" not in href:
                clean_url = href.split("url?q=")[1].split("&")[0]
                links.append(clean_url)
        return list(set(links))
    except Exception as e:
        print(f"[!] Search Error: {e}")
        return []

def extract_leads(target_url):
    print(f" [+] Scraping: {target_url}")
    try:
        resp = requests.get(target_url, headers=HEADERS, timeout=10)
        text = resp.text
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', text)
        phones = re.findall(r'\\+?\\d{1,3}[\\s.-]?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}', text)
        socials = re.findall(r'instagram\\.com/[a-zA-Z0-9._-]+|facebook\\.com/[a-zA-Z0-9._-]+', text)
        return {
            "source": target_url,
            "emails": list(set(emails)),
            "phones": list(set(phones)),
            "socials": list(set(socials))
        }
    except:
        return None

def main():
    all_leads = []
    for q in QUERIES:
        links = get_links_from_search(q)
        for link in links[:5]:
            lead = extract_leads(link)
            if lead:
                all_leads.append(lead)
            time.sleep(2)
    with open(f"leads_{NICHE}_{CITY}.json", "w") as f:
        json.dump(all_leads, f, indent=4)
    print(f"[*] Done! Saved {len(all_leads)} leads to JSON.")

if __name__ == "__main__":
    main()
`;
  navigator.clipboard.writeText(script);
}
