import React from 'react';
import { ExternalLink } from "lucide-react";
import { ScrapeResult } from '../types';

interface LeadCardProps {
  lead: ScrapeResult;
}

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <div className="bg-bg1 border border-b0 rounded-lg p-3 hover:border-b1 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm text-blue-brand">{lead.name}</h4>
        <div className="flex gap-2">
          {lead.website && lead.website !== "none" && <a href={lead.website} target="_blank" className="text-cyan-brand hover:scale-110 transition-transform"><ExternalLink className="w-3.5 h-3.5" /></a>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
        <div className="space-y-1">
          {lead.phone && <div className="flex items-center gap-2 text-t1"><div className="w-1.5 h-1.5 rounded-full bg-green-brand" /> {lead.phone}</div>}
          {lead.email && <div className="flex items-center gap-2 text-t1"><div className="w-1.5 h-1.5 rounded-full bg-blue-brand" /> {lead.email}</div>}
        </div>
        <div className="space-y-1">
          {lead.instagram && <div className="flex items-center gap-2 text-t1"><div className="w-1.5 h-1.5 rounded-full bg-pink-brand" /> {lead.instagram}</div>}
          {lead.address && <div className="flex items-center gap-2 text-t1"><div className="w-1.5 h-1.5 rounded-full bg-orange-brand" /> {lead.address}</div>}
        </div>
      </div>
      {lead.notes && <p className="mt-2 pt-2 border-t border-b0 text-[10px] text-t2 italic line-clamp-1">{lead.notes}</p>}
    </div>
  );
}
