import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Terminal,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface FrogeApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'froge_api_key';

function generateRandomKey(): string {
  const chars = 'abcdef0123456789';
  let hex = '';
  for (let i = 0; i < 32; i++) {
    hex += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `froge-live-core-sk-${hex}`;
}

export const FrogeApiKeyModal: React.FC<FrogeApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curl' | 'python'>('overview');

  useEffect(() => {
    let stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      stored = generateRandomKey();
      localStorage.setItem(STORAGE_KEY, stored);
    }
    setApiKey(stored);
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotate = () => {
    setIsRotating(true);
    setTimeout(() => {
      const fresh = generateRandomKey();
      localStorage.setItem(STORAGE_KEY, fresh);
      setApiKey(fresh);
      setIsRotating(false);
    }, 400);
  };

  const curlSnippet = `curl -X POST http://localhost:3000/api/chat/stream \\
  -H "Content-Type: application/json" \\
  -H "X-FROGE-API-KEY: ${apiKey}" \\
  -d '{"prompt": "Hello FROGÉ AI", "mode": "simple-chat"}'`;

  const pythonSnippet = `import requests

url = "http://localhost:3000/api/chat/stream"
headers = {
    "Content-Type": "application/json",
    "X-FROGE-API-KEY": "${apiKey}"
}
payload = {
    "prompt": "Explain neural cognition in 2 sentences",
    "mode": "deep-thinking"
}

response = requests.post(url, json=payload, stream=True)
for chunk in response.iter_lines():
    if chunk:
        print(chunk.decode("utf-8"))`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-zinc-200/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-emerald-50/60 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight">FROGÉ AI In-House API Key</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Autonomous Core
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">100% In-Computer Brain Processing (फॉग कंपनी)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Active Key Display Card */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
              <span>Your Secret API Key</span>
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Zero External Keys Needed
              </span>
            </label>

            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-300/80 bg-zinc-50 shadow-inner">
              <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full bg-transparent text-xs font-mono text-zinc-900 focus:outline-hidden select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-emerald-700 hover:border-emerald-300 shadow-2xs flex items-center gap-1 transition-all shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleRotate}
              disabled={isRotating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Regenerate Key</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>In-Brain Engine Active</span>
            </div>
          </div>

          {/* Architectural Guarantees */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-2 text-xs">
            <div className="font-bold text-zinc-900 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>Proprietary Architecture Specifications:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-zinc-600">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Autonomous Model Architecture:</strong> All third-party external model dependencies have been completely removed. Connect your own model via FROGÉ Model Gateway.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>100% In-Computer Processing:</strong> Every token, reasoning chain, and cognitive step executes inside your computer&apos;s brain.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Expanded Cognitive Reach:</strong> Deploys multi-horizon See, Think, Reach &amp; Understand reasoning on every prompt.</span>
              </li>
            </ul>
          </div>

          {/* Code Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-zinc-200 pb-1.5">
              <span className="font-bold text-zinc-800">Developer Integration</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('curl')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    activeTab === 'curl' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveTab('python')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    activeTab === 'python' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Python
                </button>
              </div>
            </div>

            <pre className="p-3 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-zinc-800">
              {activeTab === 'python' ? pythonSnippet : curlSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-zinc-50 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
