import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Star,
  Bell,
  ChevronDown,
  Cpu,
  Sparkles,
  Edit2,
  Check,
  X,
  Loader2,
  AlertCircle,
  Monitor,
  KeyRound,
  Users,
  MessageSquare,
} from 'lucide-react';
import { FrogeModeId } from '../types';
import { FROGE_MODES } from '../constants/modes';
import { FrogeLogo } from './FrogeLogo';
import { ModeSelector } from './ModeSelector';

interface HeaderProps {
  activeMode: FrogeModeId;
  onSelectMode: (mode: FrogeModeId) => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenVoice: () => void;
  onOpenScreenShare?: () => void;
  isSharingScreen?: boolean;
  onOpenShare?: () => void;
  onOpenBrainTests?: () => void;
  onSearchPrompt?: (query: string) => void;
  onRenameChat?: (newTitle: string) => void;
  chatTitle?: string;
  hasMessages: boolean;
  isGenerating?: boolean;
  errorModeId?: FrogeModeId | null;
  onClearError?: () => void;
  activeModelId?: string;
  onOpenModelSelector?: () => void;
  onOpenCommunity?: () => void;
  isCommunityActive?: boolean;
  onOpenNeuralArchitecture?: () => void;
  onOpenApiKey?: () => void;
  onOpenNeuralControlCenter?: () => void;
  isNeuralActive?: boolean;
  onBackToChat?: () => void;
  isOwnerVerified?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  onSelectMode,
  onToggleSidebar,
  onNewChat,
  onOpenVoice,
  onOpenScreenShare,
  isSharingScreen = false,
  onOpenShare,
  onOpenBrainTests,
  onSearchPrompt,
  onRenameChat,
  chatTitle,
  hasMessages,
  isGenerating = false,
  errorModeId = null,
  onClearError,
  activeModelId = 'fog-neural-core-v3',
  onOpenModelSelector,
  onOpenCommunity,
  isCommunityActive = false,
  onOpenNeuralArchitecture,
  onOpenApiKey,
  onOpenNeuralControlCenter,
  isNeuralActive = false,
  onBackToChat,
  isOwnerVerified = false,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(chatTitle || '');
  const [showKeyTooltip, setShowKeyTooltip] = useState(false);
  const currentModeConfig = FROGE_MODES[activeMode] || FROGE_MODES['simple-chat'];

  useEffect(() => {
    setTitleInput(chatTitle || '');
  }, [chatTitle]);

  // Global shortcut for Search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('header-global-search') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim() && onSearchPrompt) {
      onSearchPrompt(searchValue.trim());
      setSearchValue('');
    }
  };

  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (titleInput.trim() && onRenameChat) {
      onRenameChat(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header
      id="froge-app-header"
      className="h-14 px-3 sm:px-6 border-b border-zinc-100 bg-white/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 select-none transition-colors gap-2"
    >
      {/* Left: Sidebar Toggle, Primary Navigation Tabs & Search Input */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Sidebar"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Primary View Switcher: Chat | Neural Network | Community */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
          <button
            id="nav-tab-chat"
            type="button"
            onClick={onBackToChat || (() => {})}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isNeuralActive && !isCommunityActive
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="AI Chat & Assistant"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Chat</span>
          </button>

          <button
            id="nav-tab-neural"
            type="button"
            onClick={onOpenNeuralControlCenter}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isNeuralActive
                ? 'bg-amber-600 text-white shadow-2xs ring-1 ring-amber-500'
                : 'text-amber-800 dark:text-amber-300 hover:bg-amber-100/80 dark:hover:bg-amber-950/40 bg-amber-50/60'
            }`}
            title="Open FROGÉ Neural Network Control Center (8.03B Core Architecture)"
          >
            <Cpu className={`w-3.5 h-3.5 ${isNeuralActive ? 'text-white' : 'text-amber-600'} animate-pulse`} />
            <span>Neural Network</span>
            <span
              className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                isNeuralActive ? 'bg-amber-800 text-amber-100' : 'bg-amber-200 text-amber-900'
              }`}
            >
              8.03B
            </span>
          </button>

          {onOpenCommunity && (
            <button
              id="nav-tab-community"
              type="button"
              onClick={onOpenCommunity}
              className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isCommunityActive
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
              title="Community Hub"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Community</span>
            </button>
          )}
        </div>

        {/* Global Search Bar (Ctrl K) */}
        <form onSubmit={handleSearchSubmit} className="relative hidden 2xl:block w-40">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            id="header-global-search"
            type="text"
            placeholder="Search web or ask..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-8.5 pr-10 py-1 text-xs text-zinc-800 bg-zinc-50 hover:bg-zinc-100/80 placeholder-zinc-400 rounded-lg border border-zinc-200/60 focus:border-zinc-300 focus:bg-white focus:outline-none transition-all"
          />
        </form>
      </div>

      {/* Center: Six-Mode Quick Switcher Pills (Clean, uncluttered, responsive) */}
      <div className="flex-1 max-w-xl mx-auto flex items-center justify-center min-w-0 px-1">
        {hasMessages && chatTitle ? (
          <div className="flex items-center justify-center max-w-xs sm:max-w-md truncate">
            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={() => handleSaveTitle()}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                      setTitleInput(chatTitle || '');
                    }
                  }}
                  className="px-2 py-0.5 text-xs font-semibold text-zinc-900 bg-white border border-emerald-500 rounded-md outline-none max-w-[200px]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                  title="Save title"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTitle(false);
                    setTitleInput(chatTitle || '');
                  }}
                  className="p-1 text-zinc-400 hover:bg-zinc-100 rounded"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 group">
                  <span
                    onClick={() => setIsEditingTitle(true)}
                    className="text-xs font-semibold text-zinc-800 truncate cursor-pointer hover:text-zinc-950"
                    title="Click to rename conversation"
                  >
                    {chatTitle}
                  </span>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-700 transition-opacity rounded"
                    title="Rename conversation"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Compact Mode indicator tag */}
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 shrink-0"
                  style={{
                    color: currentModeConfig.accentColor,
                    borderColor: `${currentModeConfig.accentColor}30`,
                    backgroundColor: `${currentModeConfig.accentColor}0e`,
                  }}
                >
                  {isGenerating ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : errorModeId === activeMode ? (
                    <AlertCircle className="w-2.5 h-2.5 text-red-500" />
                  ) : (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: currentModeConfig.accentColor }}
                    />
                  )}
                  <span>{currentModeConfig.name}</span>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            {/* Header Pills for all 6 Modes */}
            <ModeSelector
              activeMode={activeMode}
              onSelectMode={onSelectMode}
              layout="header-pills"
              isGenerating={isGenerating}
              errorModeId={errorModeId}
              onClearError={onClearError}
            />
          </div>
        )}
      </div>

      {/* Right: Actions, Screen Eye, Router Tests, Key Status */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* COMMUNITY HUB Button */}
        {onOpenCommunity && (
          <button
            id="btn-header-community"
            onClick={onOpenCommunity}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs border transition-all ${
              isCommunityActive
                ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                : 'bg-white hover:bg-emerald-50/80 text-zinc-700 hover:text-emerald-900 border-zinc-200/80'
            }`}
            title="Open FROGÉ Community Hub"
          >
            <Users className={`w-3.5 h-3.5 ${isCommunityActive ? 'text-white' : 'text-emerald-600'}`} />
            <span className="font-bold text-[11px]">Community</span>
          </button>
        )}

        {/* FOG In-House Model Selector Button */}
        {onOpenModelSelector && (
          <button
            id="btn-header-model-selector"
            onClick={onOpenModelSelector}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs border transition-all bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border-emerald-300/80 ring-1 ring-emerald-400/20"
            title="FOG In-Computer Brain: Click to switch models"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[11px]">
              {activeModelId === 'fog-deep-reasoner'
                ? 'FOG Reasoner Ultra'
                : activeModelId === 'fog-code-matrix'
                ? 'FOG Code Matrix'
                : activeModelId === 'froge-model-gateway'
                ? 'FROGÉ Model Gateway'
                : activeModelId === 'fog-turbo-flow'
                ? 'FOG Turbo Flow'
                : 'FOG Neural Core v3'}
            </span>
            <ChevronDown className="w-3 h-3 text-emerald-700/60" />
          </button>
        )}

        {/* FROGÉ Screen Eye Launch Trigger */}
        {onOpenScreenShare && (
          <button
            id="btn-header-screen-eye"
            onClick={onOpenScreenShare}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all ${
              isSharingScreen
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80'
            }`}
            title="Open FROGÉ Screen Eye for Live Screen Perception"
          >
            <Monitor className="w-3.5 h-3.5" />
            {isSharingScreen && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
            <span className="hidden sm:inline text-[11px]">
              {isSharingScreen ? 'Screen Eye Live' : 'Screen Eye'}
            </span>
          </button>
        )}

        {/* FROGÉ In-House API Key Trigger */}
        <button
          id="btn-header-froge-key"
          type="button"
          onClick={onOpenApiKey}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-300/80 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer ring-1 ring-emerald-400/20"
          title="FROGÉ AI In-House API Key & Autonomous Engine"
        >
          <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-bold">FROGÉ Key</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        {/* FOG In-Brain Status Tag with Tooltip */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowKeyTooltip(true)}
            onMouseLeave={() => setShowKeyTooltip(false)}
            onClick={onOpenApiKey || (() => setShowKeyTooltip(!showKeyTooltip))}
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-200/70 bg-emerald-50/60 text-emerald-800 text-[11px] font-semibold cursor-pointer hover:bg-emerald-100/60 transition-colors"
            title="100% In-Computer Brain Processing (फॉग कंपनी)"
          >
            <Cpu className="w-3 h-3 text-emerald-600" />
            <span>FOG In-Brain</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {showKeyTooltip && (
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-zinc-900 text-white text-xs rounded-xl shadow-xl z-50 animate-fade-in border border-zinc-700">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                <Cpu className="w-3.5 h-3.5" />
                100% In-Computer Brain (FOG Company)
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                यह AI पूरी तरह से <strong>फॉग (FOG)</strong> कंपनी द्वारा निर्मित है। यह गूगल या क्लॉड का नहीं है। समस्त प्रोसेसिंग आपके कंप्यूटर के आंतरिक न्यूरल दिमाग में निष्पादित होती है। किसी बाहरी एपीआई कुंजी की आवश्यकता नहीं है।
              </p>
            </div>
          )}
        </div>

        {/* Neural Network Control Center (Owner Section - Always Visible) */}
        {onOpenNeuralControlCenter && (
          <button
            id="btn-header-neural-network"
            onClick={onOpenNeuralControlCenter}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
              isNeuralActive
                ? 'border border-amber-500 bg-amber-600 text-white ring-2 ring-amber-300 shadow-md font-bold'
                : isOwnerVerified
                ? 'border border-amber-300/80 bg-amber-50 hover:bg-amber-100/90 text-amber-900 ring-1 ring-amber-400/20'
                : 'border border-emerald-400 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            }`}
            title="Open FROGÉ Neural Network Control Center (Architecture, Models, Datasets, Training, Evaluation, Checkpoints)"
          >
            <Cpu className={`w-3.5 h-3.5 ${isNeuralActive ? 'text-white' : isOwnerVerified ? 'text-amber-600' : 'text-white'} animate-pulse`} />
            <span className="text-[11px] font-bold">Neural Network</span>
            {isNeuralActive ? (
              <span className="text-[9px] font-bold bg-amber-800 text-amber-100 px-1 py-0.2 rounded">
                Active
              </span>
            ) : isOwnerVerified ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            ) : (
              <span className="text-[9px] font-bold bg-emerald-800 text-emerald-100 px-1 py-0.2 rounded">
                Owner
              </span>
            )}
          </button>
        )}

        {/* Router Diagnostics Trigger */}
        {onOpenBrainTests && (
          <button
            id="btn-header-brain-tests"
            onClick={onOpenBrainTests}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium shadow-2xs transition-colors"
            title="Inspect Model Router & Run Tests"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline text-[11px] font-semibold">Router</span>
          </button>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-zinc-100">
          <button
            type="button"
            onClick={onOpenNeuralControlCenter}
            title={isOwnerVerified ? 'Owner Control Center' : 'User Profile'}
            className="w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center text-[11px] font-semibold shadow-2xs cursor-pointer transition-colors"
          >
            {isOwnerVerified ? '👑' : 'AU'}
          </button>
        </div>
      </div>
    </header>
  );
};

