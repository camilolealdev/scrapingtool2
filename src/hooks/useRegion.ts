import { useState, useMemo, useEffect } from "react";
import type { Region } from '../types';
import { REGIONS } from '../utils/dorkBuilder';
import { buildTemplates } from '../utils/dorkBuilder';

export function useRegion() {
  const [region, setRegion] = useState(() => localStorage.getItem("osint_region") || "co");
  const year = new Date().getFullYear();
  const R = REGIONS[region];
  const TEMPLATES = useMemo(() => buildTemplates(region), [region]);

  useEffect(() => { localStorage.setItem("osint_region", region); }, [region]);

  return { region, setRegion, R, year, TEMPLATES };
}
