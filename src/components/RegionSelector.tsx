import type { Region } from '../types';

interface Props {
  REGIONS: Record<string, Region>;
  region: string;
  setRegion: (id: string) => void;
  setActiveCategory: (id: string) => void;
}

export function RegionSelector({ REGIONS, region, setRegion, setActiveCategory }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6 p-2.5 bg-bgc border border-b0 rounded-xl">
      {Object.entries(REGIONS).map(([id, rg]) => (
        <button key={id}
          className={`btn border border-b0 bg-bg1 text-t2 font-medium hover:border-b1 hover:text-t0 ${
            region === id ? "!bg-bg3 !border-blue-brand !text-t0 shadow-[0_0_10px_rgba(66,133,244,0.1)]" : ""
          }`}
          onClick={() => { setRegion(id); setActiveCategory("gmb"); }}
        >
          <span className="text-base">{rg.flag}</span> {rg.name}
        </button>
      ))}
    </div>
  );
}
