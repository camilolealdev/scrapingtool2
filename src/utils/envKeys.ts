export const ENV: Record<string, string> = {
  VITE_GEMINI_API_KEY:     import.meta.env.VITE_GEMINI_API_KEY     || '',
  VITE_ANTHROPIC_API_KEY:  import.meta.env.VITE_ANTHROPIC_API_KEY  || '',
  VITE_OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  VITE_NVIDIA_API_KEY:     import.meta.env.VITE_NVIDIA_API_KEY      || '',
  VITE_GOOGLE_CS_API_KEY:  import.meta.env.VITE_GOOGLE_CS_API_KEY  || '',
  VITE_GOOGLE_CS_CX:       import.meta.env.VITE_GOOGLE_CS_CX       || '',
  VITE_BING_API_KEY:       import.meta.env.VITE_BING_API_KEY       || '',
  VITE_BRAVE_API_KEY:      import.meta.env.VITE_BRAVE_API_KEY      || '',
};

export const getStoredKey = (key: string): string =>
  localStorage.getItem(`osint_${key}`) || ENV[key] || '';

export const persistEnvKeys = () => {
  Object.entries(ENV).forEach(([key, val]) => {
    if (val && !localStorage.getItem(`osint_${key}`)) {
      localStorage.setItem(`osint_${key}`, val);
    }
  });
};
