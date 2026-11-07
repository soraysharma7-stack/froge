import React from 'react';
import {
  Search,
  Plus,
  Compass,
  ArrowLeft,
  User,
  Users,
  Sparkles,
  Bookmark,
  Share2,
} from 'lucide-react';
import { UserProfile } from '../../community/types';

interface CommunityHeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreatePost: () => void;
  onOpenCreateCommunity: () => void;
  onOpenProfile: () => void;
  onBackToChat: () => void;
  currentUser: UserProfile;
  activeCommunityName?: string;
  onClearActiveCommunity?: () => void;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onOpenCreatePost,
  onOpenCreateCommunity,
  onOpenProfile,
  onBackToChat,
  currentUser,
  activeCommunityName,
  onClearActiveCommunity,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-2xs">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Back to FROGÉ AI & Community Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBackToChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors border border-zinc-200/70 shadow-2xs shrink-0"
            title="Return to FROGÉ AI Chat"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Chat</span>
          </button>

          <div className="h-5 w-px bg-zinc-200 hidden sm:block shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0" role="img" aria-label="frog">🐸</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-zinc-900 truncate">
                  COMMUNITY HUB
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full shrink-0">
                  V1
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search posts, questions, topics, #tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs text-zinc-800 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white placeholder-zinc-400 rounded-lg border border-zinc-200/80 focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCreateCommunity}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors border border-zinc-200/70"
            title="Create a new community"
          >
            <Users className="w-3.5 h-3.5 text-zinc-500" />
            <span>New Community</span>
          </button>

          <button
            onClick={onOpenCreatePost}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Post</span>
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-zinc-100 border border-zinc-200/70 transition-colors"
            title={`Logged in as @${currentUser.username}`}
          >
            <div
              className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold shadow-2xs"
              style={{ backgroundColor: currentUser.avatarColor || '#10b981' }}
            >
              {(currentUser.displayName || currentUser.username || 'F')[0].toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-zinc-700 max-w-[100px] truncate">
              {currentUser.displayName || currentUser.username}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      <div className="px-3 pb-2.5 md:hidden">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search community posts & tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-zinc-800 bg-zinc-50 rounded-lg border border-zinc-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between overflow-x-auto border-t border-zinc-100 no-scrollbar">
        <div className="flex items-center gap-1 py-1">
          <button
            onClick={() => {
              if (onClearActiveCommunity) onClearActiveCommunity();
              onSelectTab('feed');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 ${
              currentTab === 'feed' && !activeCommunityName
                ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
            }`}
          >
            All Feed
          </button>

          <button
            onClick={() => {
              if (onClearActiveCommunity) onClearActiveCommunity();
              onSelectTab('discussions');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 ${
              currentTab === 'discussions'
                ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
            }`}
          >
            Discussions
          </button>

          <button
            onClick={() => {
              if (onClearActiveCommunity) onClearActiveCommunity();
              onSelectTab('questions');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 ${
              currentTab === 'questions'
                ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
            }`}
          >
            Questions
          </button>

          <button
            onClick={() => {
              if (onClearActiveCommunity) onClearActiveCommunity();
              onSelectTab('projects');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 ${
              currentTab === 'projects'
                ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
            }`}
          >
            Project Showcase
          </button>

          <button
            onClick={() => {
              if (onClearActiveCommunity) onClearActiveCommunity();
              onSelectTab('discover');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 flex items-center gap-1.5 ${
              currentTab === 'discover'
                ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Communities</span>
          </button>

          <button
            onClick={() => {
              if (onClearActiveCommunity) onClearActiveCommunity();
              onSelectTab('saved');
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors shrink-0 flex items-center gap-1.5 ${
              currentTab === 'saved'
                ? 'text-emerald-700 bg-emerald-50/80 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
          </button>
        </div>

        {activeCommunityName && (
          <div className="flex items-center gap-2 py-1 shrink-0">
            <span className="text-xs text-zinc-500">Filtered by:</span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              c/{activeCommunityName}
              {onClearActiveCommunity && (
                <button
                  onClick={onClearActiveCommunity}
                  className="hover:text-red-500 ml-1 font-bold"
                  title="Clear community filter"
                >
                  ×
                </button>
              )}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
