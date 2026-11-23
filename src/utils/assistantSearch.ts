export type AssistantId = 'chatgpt' | 'perplexity' | 'claude' | 'qwen';

export interface AssistantSearch {
  id: AssistantId;
  label: string;
  url: (query: string) => string;
}

// Opens the user's own browser session. No API key or account data is sent.
export const ASSISTANT_SEARCHES: AssistantSearch[] = [
  { id: 'chatgpt', label: 'ChatGPT', url: q => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
  { id: 'perplexity', label: 'Perplexity', url: q => `https://www.perplexity.ai/?q=${encodeURIComponent(q)}` },
  { id: 'claude', label: 'Claude', url: q => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
  { id: 'qwen', label: 'Qwen', url: q => `https://chat.qwen.ai/?input=${encodeURIComponent(q)}` },
];

const REFERRAL_URLS: Partial<Record<AssistantId, string>> = {
  chatgpt: import.meta.env.VITE_REF_CHATGPT_URL,
  perplexity: import.meta.env.VITE_REF_PERPLEXITY_URL,
  claude: import.meta.env.VITE_REF_CLAUDE_URL,
  qwen: import.meta.env.VITE_REF_QWEN_URL,
};

export function openAssistantSearch(id: AssistantId, query: string): boolean {
  const clean = query.trim();
  const assistant = ASSISTANT_SEARCHES.find(item => item.id === id);
  if (!clean || !assistant) return false;
  window.open(assistant.url(clean), '_blank', 'noopener,noreferrer');
  return true;
}

export function getReferralUrl(id: AssistantId): string | undefined {
  const value = REFERRAL_URLS[id]?.trim();
  return value || undefined;
}
