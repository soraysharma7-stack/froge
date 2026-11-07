import React, { useState } from 'react';
import { Globe, ExternalLink, ChevronDown, ChevronUp, Check, Copy } from 'lucide-react';
import { WebSearchResult } from '../types';

interface WebSourcesViewProps {
  sources: WebSearchResult[];
  className?: string;
}

export const WebSourcesView: React.FC<WebSourcesViewProps> = ({ sources, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!sources || sources.length === 0) return null;

  const displaySources = isExpanded ? sources : sources.slice(0, 3);

  const handleCopyUrl = (e: React.MouseEvent, url: string, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  return (
    <section
      aria-label="Web Sources and Grounding"
      className={`my-3 p-3 sm:p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 transition-all ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 text-xs text-zinc-600 mb-2.5">
        <div className="flex items-center gap-2 font-medium text-zinc-900">
          <Globe className="w-4 h-4 text-blue-600" />
          <span>Web Sources & Grounding</span>
          <span className="text-zinc-400" aria-hidden="true">·</span>
          <span className="text-zinc-500 font-normal">{sources.length} sources consulted</span>
        </div>
        {sources.length > 3 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 transition-colors py-1 px-2 rounded-lg hover:bg-zinc-200/60 cursor-pointer font-medium"
          >
            <span>{isExpanded ? 'Show fewer' : `+${sources.length - 3} more sources`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {displaySources.map((source, idx) => (
          <a
            key={idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-2.5 rounded-lg border border-zinc-200/80 bg-white hover:border-blue-500/50 hover:shadow-xs transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                {source.favicon ? (
                  <img
                    src={source.favicon}
                    alt=""
                    className="w-3.5 h-3.5 rounded-xs object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                )}
                <span className="text-[11px] font-semibold text-zinc-600 truncate max-w-[130px]">
                  {source.sourceDomain}
                </span>
                <span className="text-zinc-400 text-[10px]">[{idx + 1}]</span>
                <span className="ml-auto text-zinc-400 group-hover:text-blue-600 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
              <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {source.title}
              </h4>
              <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-snug">
                {source.snippet}
              </p>
            </div>

            <div className="mt-2 pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
              <span className="font-mono text-zinc-500">{source.publishedDate || 'Live Web'}</span>
              <button
                type="button"
                onClick={(e) => handleCopyUrl(e, source.url, idx)}
                className="hover:text-zinc-700 flex items-center gap-1 p-0.5 rounded cursor-pointer transition-colors"
                title="Copy source link"
              >
                {copiedIdx === idx ? (
                  <>
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

