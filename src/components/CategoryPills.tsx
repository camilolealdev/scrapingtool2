interface Props {
  TEMPLATES: Record<string, any>;
  activeCategory: string;
  onSelect: (k: string) => void;
}

export function CategoryPills({ TEMPLATES, activeCategory, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(TEMPLATES).map(([k, c]: any) => {
        const isActive = activeCategory === k;
        return (
          <button
            key={k}
            onClick={() => onSelect(k)}
            className={`flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg border text-[10px] font-semibold tracking-wide transition-all duration-150 whitespace-nowrap
              ${isActive ? 'text-white' : 'bg-bg1 border-b0 text-t2 hover:text-white'}`}
            style={isActive ? { background: `${c.color}cc`, borderColor: c.color, boxShadow: `0 0 10px ${c.color}50` } : {}}
          >
            <span className="text-[11px] leading-none">{c.icon}</span>
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
