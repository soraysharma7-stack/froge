import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Sparkles,
  Zap,
  Terminal,
  BrainCircuit,
  GraduationCap,
  Settings,
  X,
  Check,
  Edit2,
  Trash2,
  Pin,
  PinOff,
  MoreVertical,
  Loader2,
  AlertCircle,
  Users,
  Cpu,
} from 'lucide-react';
import { Conversation, FrogeModeId } from '../types';
import { FROGE_MODES, FROGE_MODE_LIST } from '../constants/modes';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onTogglePinChat: (id: string) => void;
  onClearAllChats: () => void;
  activeMode: FrogeModeId;
  onSelectMode: (mode: FrogeModeId) => void;
  isGenerating?: boolean;
  errorModeId?: FrogeModeId | null;
  onClearError?: () => void;
  onOpenCommunity?: () => void;
  isCommunityActive?: boolean;
  onOpenNeuralControlCenter?: () => void;
  isNeuralActive?: boolean;
  isOwnerVerified?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
  onClearAllChats,
  activeMode,
  onSelectMode,
  isGenerating = false,
  errorModeId = null,
  onClearError,
  onOpenCommunity,
  isCommunityActive = false,
  onOpenNeuralControlCenter,
  isNeuralActive = false,
  isOwnerVerified = false,
}) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const getModeIcon = (id: FrogeModeId, iconClass = 'w-3.5 h-3.5') => {
    switch (id) {
      case 'simple-chat':
        return <MessageSquare className={iconClass} />;
      case 'deep-thinking':
        return <BrainCircuit className={iconClass} />;
      case 'froge-code':
        return <Terminal className={iconClass} />;
      case 'max':
        return <Zap className={iconClass} />;
      case 'student-mode':
        return <GraduationCap className={iconClass} />;
    }
  };

  const startEditing = (chat: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitleValue(chat.title);
  };

  const saveEditing = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitleValue.trim()) {
      onRenameChat(id, editTitleValue.trim());
    }
    setEditingChatId(null);
    setEditTitleValue('');
  };

  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const pinnedChats = safeConversations.filter((c) => c && c.isPinned);
  const recentChats = safeConversations.filter((c) => c && !c.isPinned);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        id="froge-left-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#FAFAFB] border-r border-zinc-200/70 flex flex-col justify-between transition-transform duration-200 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {/* Logo Bar */}
          <div className="p-3.5 pb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onNewChat} role="button">
              <span className="text-xl" role="img" aria-label="FROGÉ">
                🐸
              </span>
              <span className="font-bold text-base tracking-tight text-zinc-900">
                FROGÉ
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                App 1
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg md:hidden"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* + New Chat Button with Shortcut */}
          <div className="px-3 mb-3">
            <button
              id="sidebar-new-chat-btn"
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium text-xs flex items-center justify-between shadow-2xs transition-all active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5" />
                <span className="font-semibold">New Chat</span>
              </div>
              <kbd className="text-[9px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                ⌘ N
              </kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-2.5 space-y-3 flex-1">
            {/* Primary Neural Network Portal Quick Access */}
            {onOpenNeuralControlCenter && (
              <div>
                <button
                  id="sidebar-neural-network-top-btn"
                  onClick={() => {
                    onOpenNeuralControlCenter();
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    isNeuralActive
                      ? 'bg-amber-600 text-white ring-2 ring-amber-400 font-extrabold'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80'
                  }`}
                  title="FROGÉ Neural Network Control Center (8.03B Transformer Architecture, LoRA Training, Checkpoints)"
                >
                  <div className="flex items-center gap-2">
                    <Cpu className={`w-4 h-4 ${isNeuralActive ? 'text-white' : 'text-amber-600'} animate-pulse`} />
                    <span>Neural Network</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isNeuralActive ? 'bg-amber-800 text-amber-100' : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    8.03B
                  </span>
                </button>
              </div>
            )}

            {/* The 5 FROGÉ Modes */}
            <div>
              <div className="px-2 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Five Modes (FROGÉ)
                </span>
                <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-100 px-1.5 py-0.2 rounded">
                  5
                </span>
              </div>
              <div className="space-y-0.5">
                {FROGE_MODE_LIST.map((mode) => {
                  const isSelected = activeMode === mode.id;
                  const isLoading = isSelected && isGenerating;
                  const isError = errorModeId === mode.id;

                  return (
                    <button
                      key={mode.id}
                      id={`sidebar-mode-${mode.id}`}
                      onClick={() => {
                        if (isError && onClearError) onClearError();
                        onSelectMode(mode.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isError
                          ? 'bg-red-50 text-red-900 border border-red-200'
                          : isSelected
                          ? 'bg-white text-zinc-900 shadow-2xs border border-zinc-200/80 font-semibold'
                          : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900'
                      }`}
                      title={`${mode.name}: ${mode.tagline}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        ) : isError ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        ) : (
                          <span
                            style={{ color: isSelected ? mode.accentColor : undefined }}
                            className={isSelected ? '' : 'text-zinc-400'}
                          >
                            {getModeIcon(mode.id, 'w-3.5 h-3.5')}
                          </span>
                        )}
                        <span className="truncate">{mode.name}</span>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {isLoading ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        ) : isError ? (
                          <span className="text-[9px] font-bold text-red-600">ERR</span>
                        ) : isSelected ? (
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: mode.accentColor }}
                          />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COMMUNITY HUB SECTION */}
            <div className="pt-2 border-t border-zinc-200/60">
              <div className="px-2 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  COMMUNITY
                </span>
                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded">
                  HUB
                </span>
              </div>
              <button
                id="sidebar-community-btn"
                onClick={() => {
                  if (onOpenCommunity) onOpenCommunity();
                  if (window.innerWidth < 768) onClose();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isCommunityActive
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'text-zinc-700 hover:bg-emerald-50/80 hover:text-emerald-950 border border-emerald-200/60 bg-emerald-50/20'
                }`}
                title="Enter FROGÉ Community Hub"
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-3.5 h-3.5 ${isCommunityActive ? 'text-white' : 'text-emerald-600'}`} />
                  <span>Community Hub</span>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isCommunityActive
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  ENTER
                </span>
              </button>
            </div>

            {/* Neural Network Section (Owner Control Center) */}
            {onOpenNeuralControlCenter && (
              <div>
                <div className="px-2 mb-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    Neural Network
                  </span>
                  <span className="text-[9px] font-semibold text-amber-800 bg-amber-100 border border-amber-300/80 px-1.5 py-0.2 rounded">
                    Owner
                  </span>
                </div>
                <button
                  id="sidebar-neural-network-nav-btn"
                  onClick={() => {
                    onOpenNeuralControlCenter();
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-98 ${
                    isNeuralActive
                      ? 'bg-amber-600 text-white shadow-2xs font-bold border border-amber-600'
                      : 'text-amber-950 bg-amber-50 hover:bg-amber-100/90 border border-amber-300/80 shadow-2xs'
                  }`}
                  title="FROGÉ Neural Network Control Center: Architecture, Models, Datasets, Training, Evaluation, Checkpoints"
                >
                  <div className="flex items-center gap-2.5">
                    <Cpu className={`w-3.5 h-3.5 ${isNeuralActive ? 'text-white' : 'text-amber-600'} animate-pulse`} />
                    <span className="font-bold">Neural Network</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isNeuralActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    6 Tabs
                  </span>
                </button>
              </div>
            )}

            {/* Chat History Section */}
            {safeConversations.length > 0 && (
              <div className="pt-2 border-t border-zinc-200/60">
                <div className="px-2 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Conversations
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {safeConversations.length}
                  </span>
                </div>

                {/* Pinned Chats */}
                {pinnedChats.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-0.5 text-[9px] font-semibold text-zinc-400 flex items-center gap-1 uppercase tracking-wider">
                      <Pin className="w-2.5 h-2.5" />
                      <span>Pinned</span>
                    </div>
                    <div className="space-y-0.5">
                      {pinnedChats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => {
                            onSelectChat(chat.id);
                            if (window.innerWidth < 768) onClose();
                          }}
                          className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            activeChatId === chat.id
                              ? 'bg-zinc-200/70 font-semibold text-zinc-900'
                              : 'text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900'
                          }`}
                        >
                          {editingChatId === chat.id ? (
                            <form
                              onSubmit={(e) => saveEditing(chat.id, e)}
                              className="flex items-center gap-1 w-full"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={editTitleValue}
                                onChange={(e) => setEditTitleValue(e.target.value)}
                                onBlur={() => saveEditing(chat.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') setEditingChatId(null);
                                }}
                                className="w-full px-1.5 py-0.5 text-xs bg-white border border-emerald-500 rounded outline-none"
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 truncate pr-1">
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{
                                    backgroundColor:
                                      FROGE_MODES[chat.mode]?.accentColor || '#10b981',
                                  }}
                                />
                                <span className="truncate">{chat.title}</span>
                              </div>

                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePinChat(chat.id);
                                  }}
                                  className="p-1 hover:text-zinc-900 text-zinc-400 rounded"
                                  title="Unpin chat"
                                >
                                  <PinOff className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => startEditing(chat, e)}
                                  className="p-1 hover:text-zinc-900 text-zinc-400 rounded"
                                  title="Rename chat"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteChat(chat.id);
                                  }}
                                  className="p-1 hover:text-red-600 text-zinc-400 rounded"
                                  title="Delete chat"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Chats */}
                <div className="space-y-0.5">
                  {recentChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onSelectChat(chat.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        activeChatId === chat.id
                          ? 'bg-zinc-200/70 font-semibold text-zinc-900'
                          : 'text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900'
                      }`}
                    >
                      {editingChatId === chat.id ? (
                        <form
                          onSubmit={(e) => saveEditing(chat.id, e)}
                          className="flex items-center gap-1 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            onBlur={() => saveEditing(chat.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') setEditingChatId(null);
                            }}
                            className="w-full px-1.5 py-0.5 text-xs bg-white border border-emerald-500 rounded outline-none"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 truncate pr-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  FROGE_MODES[chat.mode]?.accentColor || '#10b981',
                              }}
                            />
                            <span className="truncate">{chat.title}</span>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePinChat(chat.id);
                              }}
                              className="p-1 hover:text-zinc-900 text-zinc-400 rounded"
                              title="Pin chat"
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => startEditing(chat, e)}
                              className="p-1 hover:text-zinc-900 text-zinc-400 rounded"
                              title="Rename chat"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteChat(chat.id);
                              }}
                              className="p-1 hover:text-red-600 text-zinc-400 rounded"
                              title="Delete chat"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Quick Links & Profile */}
        <div className="p-3 border-t border-zinc-200/70 space-y-1">
          {conversations.length > 0 && (
            <button
              onClick={onClearAllChats}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            onClick={() => onSelectMode('simple-chat')}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-lg transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Workspace Settings</span>
          </button>

          {onOpenNeuralControlCenter && (
            <button
              id="sidebar-neural-network-btn"
              onClick={() => {
                onOpenNeuralControlCenter();
                if (window.innerWidth < 768) onClose();
              }}
              className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                isOwnerVerified
                  ? 'text-amber-900 bg-amber-50 hover:bg-amber-100 font-semibold border border-amber-200/80'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
              }`}
              title="Neural Network Control Center (Owner Access)"
            >
              <div className="flex items-center gap-2">
                <Cpu className={`w-3.5 h-3.5 ${isOwnerVerified ? 'text-amber-600' : 'text-zinc-500'}`} />
                <span>Neural Network</span>
              </div>
              {isOwnerVerified ? (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1 rounded">
                  Owner
                </span>
              ) : (
                <span className="text-[10px] text-zinc-400">
                  Private
                </span>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
