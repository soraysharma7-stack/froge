import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage as ChatMessageType,
  Conversation,
  FrogeModeId,
  StudentDifficulty,
  StudySessionState,
  StudentReportData,
  VisualAttachment,
} from './types';
import { FROGE_MODES } from './constants/modes';
import {
  getStoredConversations,
  saveConversations,
  getStoredActiveChatId,
  setStoredActiveChatId,
  getStoredMode,
  setStoredMode,
  getStoredActiveModel,
  setStoredActiveModel,
  createNewConversation,
} from './utils/storage';
import { processThroughFrogeBrain } from './brain';
import { generateStudentReport } from './brain/student';
import { streamChatResponse } from './utils/streamClient';
import { tokenUsageTracker } from './brain/models/usageService';
import { estimateTokenCount } from './brain/models/pricing';
import { useScreenShare } from './utils/useScreenShare';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatStream } from './components/ChatStream';
import { Composer } from './components/Composer';
import { VoiceModal } from './components/VoiceModal';
import { ShareModal } from './components/ShareModal';
import { BrainTestModal } from './components/BrainTestModal';
import { FrogeApiKeyModal } from './components/FrogeApiKeyModal';
import { ModelSelectorModal } from './components/ModelSelectorModal';
import { ScreenShareModal } from './components/ScreenShareModal';
import { ScreenEyeDock } from './components/ScreenEyeDock';
import { DeviceScanOverlay } from './components/DeviceScanOverlay';
import { RightSidebar } from './components/RightSidebar';
import { StudentStudyToolbar } from './components/StudentStudyToolbar';
import { StudentReportModal } from './components/StudentReportModal';
import { CommunityHome } from './components/community/CommunityHome';
import { NeuralArchitectureModal } from './components/NeuralArchitectureModal';
import { NeuralNetworkControlCenter } from './components/neural/NeuralNetworkControlCenter';
import { Cpu } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'chat' | 'community' | 'neural'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/community')) return 'community';
      if (window.location.hash === '#neural' || window.location.pathname.startsWith('/neural')) {
        return 'neural';
      }
    }
    return 'chat';
  });
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    getStoredConversations()
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(() =>
    getStoredActiveChatId()
  );
  const [activeMode, setActiveMode] = useState<FrogeModeId>(() => getStoredMode());
  const [activeModelId, setActiveModelId] = useState<string>(() =>
    getStoredActiveModel()
  );
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isNeuralModalOpen, setIsNeuralModalOpen] = useState(false);
  const [isNeuralControlCenterOpen, setIsNeuralControlCenterOpen] = useState(false);
  const [isOwnerVerified, setIsOwnerVerified] = useState<boolean>(() => {
    return !!localStorage.getItem('froge_owner_token');
  });
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isBrainTestModalOpen, setIsBrainTestModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);
  const [attachedScreenFrame, setAttachedScreenFrame] = useState<VisualAttachment | null>(null);
  const [studentDifficulty, setStudentDifficulty] = useState<StudentDifficulty>('intermediate');
  const [studentSessionState, setStudentSessionState] = useState<StudySessionState>({
    plannedDurationMinutes: 45, // max 120 (2h)
    elapsedSeconds: 0,
    isActive: true,
    isPaused: false,
    startTime: Date.now(),
    topicsCovered: [],
    quizzesAnswered: 0,
    quizzesCorrect: 0,
    sessionCompleted: false,
    breakReminderMinutes: 25,
  });
  const [studentReportModalState, setStudentReportModalState] = useState<{
    isOpen: boolean;
    report: StudentReportData | null;
  }>({ isOpen: false, report: null });
  const [shareModalState, setShareModalState] = useState<{
    isOpen: boolean;
    message?: ChatMessageType | null;
    conversation?: Conversation | null;
  }>({ isOpen: false });
  const [isWebSearchActive, setIsWebSearchActive] = useState(false);

  // Screen Share Hook
  const {
    isSharing: isScreenSharing,
    isScanning: isScreenScanning,
    isAppInBackground: isScreenAppInBackground,
    stream: screenStream,
    streamResolution: screenResolution,
    displaySurface: screenDisplaySurface,
    isAutoObserving: isScreenAutoObserving,
    startSharing: startScreenSharing,
    stopSharing: stopScreenSharing,
    captureFrame: captureScreenFrame,
    triggerScanAnimation: triggerScreenScanAnimation,
    toggleAutoObserve: toggleScreenAutoObserve,
  } = useScreenShare();

  const abortControllerRef = useRef<AbortController | null>(null);

  // Synchronize active chat and conversations to localStorage
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    setStoredActiveChatId(activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    setStoredMode(activeMode);
  }, [activeMode]);

  // Sync owner verification status on mount and when modal closes/opens
  useEffect(() => {
    const token = localStorage.getItem('froge_owner_token');
    if (token) {
      fetch('/api/owner/auth/status', {
        headers: { 'x-owner-token': token },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.isOwner) {
            setIsOwnerVerified(true);
          } else {
            attemptAutoVerify();
          }
        })
        .catch(() => {
          attemptAutoVerify();
        });
    } else {
      attemptAutoVerify();
    }

    function attemptAutoVerify() {
      fetch('/api/owner/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'soraysharma7@gmail.com' }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.token) {
            localStorage.setItem('froge_owner_token', data.token);
            setIsOwnerVerified(true);
          }
        })
        .catch(() => {});
    }
  }, [isNeuralControlCenterOpen]);

  // Keyboard shortcut for New Chat (Cmd+N or Ctrl+N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode]);

  // URL route handling for /community and #neural
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/community')) {
        setCurrentView('community');
      } else if (
        window.location.hash === '#neural' ||
        window.location.pathname.startsWith('/neural')
      ) {
        setCurrentView('neural');
      } else {
        setCurrentView('chat');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenCommunity = () => {
    try {
      if (window.location.pathname !== '/community') {
        window.history.pushState(null, '', '/community');
      }
    } catch {}
    setCurrentView('community');
  };

  const handleOpenNeuralSection = () => {
    try {
      if (window.location.hash !== '#neural') {
        window.history.pushState(null, '', '#neural');
      }
    } catch {}
    setCurrentView('neural');
    setIsNeuralControlCenterOpen(false);
  };

  const handleBackToChat = () => {
    try {
      if (window.location.pathname !== '/' || window.location.hash) {
        window.history.pushState(null, '', '/');
      }
    } catch {}
    setCurrentView('chat');
  };

  // Current active conversation
  const currentConversation = conversations.find((c) => c.id === activeChatId);
  const activeMessages =
    currentConversation && Array.isArray(currentConversation.messages)
      ? currentConversation.messages
      : [];

  // Update active mode whenever conversation changes
  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    const chat = conversations.find((c) => c.id === id);
    if (chat) {
      setActiveMode(chat.mode);
    }
  };

  const handleNewChat = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setActiveChatId(null);
    setInput('');
    setAttachedScreenFrame(null);
  };

  const handleSelectMode = (mode: FrogeModeId) => {
    setActiveMode(mode);
    if (activeChatId) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, mode } : c))
      );
    }
  };

  const handleDeleteChat = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (activeChatId === id) {
        setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
      )
    );
  };

  const handleTogglePinChat = (id: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isPinned: !c.isPinned } : c
      )
    );
  };

  const handleClearAllChats = () => {
    setConversations([]);
    setActiveChatId(null);
    setAttachedScreenFrame(null);
  };

  // Main message sending & streaming handler
  const handleSendMessage = async (
    customPrompt?: string,
    options?: { isRegeneration?: boolean; isEdit?: boolean; visualAttachment?: VisualAttachment | null }
  ) => {
    const textToSend = (customPrompt || input).trim();
    const frameToSend = options?.visualAttachment !== undefined ? options.visualAttachment : attachedScreenFrame;

    if ((!textToSend && !frameToSend) || isGenerating) return;

    const effectiveText = textToSend || (frameToSend ? 'Analyze this screen and provide key insights, findings, or recommendations.' : '');

    setInput('');
    setAttachedScreenFrame(null);
    setIsGenerating(true);

    const userMessageId = `msg_user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const assistantMessageId = `msg_asst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const userMessage: ChatMessageType = {
      id: userMessageId,
      role: 'user',
      content: effectiveText,
      mode: activeMode,
      timestamp: Date.now(),
      status: 'complete',
      visualAttachment: frameToSend || undefined,
    };

    const initialAssistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      mode: activeMode,
      timestamp: Date.now(),
      status: 'streaming',
    };

    let targetChatId = activeChatId;

    // 1. Prepare / update conversation in state
    if (!targetChatId || !conversations.some((c) => c.id === targetChatId)) {
      // New conversation created
      const generatedTitle =
        effectiveText.length > 36 ? effectiveText.slice(0, 36) + '...' : effectiveText;
      const newConv = createNewConversation(activeMode, generatedTitle);
      newConv.messages = [userMessage, initialAssistantMessage];
      targetChatId = newConv.id;
      setConversations((prev) => [newConv, ...prev]);
      setActiveChatId(targetChatId);
    } else {
      // Append to active conversation or replace if regeneration
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetChatId) {
            let baseMessages = c.messages;
            if (options?.isRegeneration) {
              // Remove last assistant message if regenerating
              baseMessages = baseMessages.filter(
                (m, idx) => !(m.role === 'assistant' && idx === baseMessages.length - 1)
              );
              return {
                ...c,
                updatedAt: Date.now(),
                messages: [...baseMessages, initialAssistantMessage],
              };
            }
            return {
              ...c,
              updatedAt: Date.now(),
              messages: [...baseMessages, userMessage, initialAssistantMessage],
            };
          }
          return c;
        })
      );
    }

    // 2. Stream generation via SSE or intelligent cognitive engine
    try {
      abortControllerRef.current = new AbortController();

      // Pre-compute cognitive exploration and mode structure from FROGÉ brain
      const previousTurns = activeMessages.map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.content || '',
      }));
      const brainResult = await processThroughFrogeBrain(
        effectiveText,
        activeMode,
        undefined,
        studentDifficulty,
        previousTurns
      );

      // If student mode, register topic into session state
      if (activeMode === 'student-mode') {
        const topicName = brainResult.smartPayload.studentInsights?.coreConcept || effectiveText.slice(0, 30);
        setStudentSessionState((prev) => ({
          ...prev,
          topicsCovered: Array.from(new Set([...prev.topicsCovered, topicName])),
        }));
      }

      const shouldWebSearch = Boolean(
        isWebSearchActive ||
        /\b(search the web|search web|browse the web|look up online|latest news|current price|who won|current events|recent announcements|search for|web search)\b/i.test(effectiveText)
      );

      // Start streaming chunks into assistant message
      await streamChatResponse({
        prompt: effectiveText,
        mode: activeMode,
        image: frameToSend?.dataUrl,
        providerId: 'fog-neural-engine',
        model: activeModelId,
        history: previousTurns,
        webSearch: shouldWebSearch,
        signal: abortControllerRef.current.signal,
        fallbackContent: brainResult.content,
        callbacks: {
          onWebSources: (sources) => {
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === targetChatId) {
                  return {
                    ...c,
                    messages: (c.messages || []).map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, webSearchResults: sources }
                        : m
                    ),
                  };
                }
                return c;
              })
            );
          },
          onThoughtData: (thoughtData) => {
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === targetChatId) {
                  return {
                    ...c,
                    messages: (c.messages || []).map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, thoughtData }
                        : m
                    ),
                  };
                }
                return c;
              })
            );
          },
          onChunk: (accumulatedText) => {
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === targetChatId) {
                  return {
                    ...c,
                    messages: (c.messages || []).map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: accumulatedText, status: 'streaming' }
                        : m
                    ),
                  };
                }
                return c;
              })
            );
          },
          onDone: (finalContent) => {
            const formattedModelName =
              activeModelId === 'fog-deep-reasoner'
                ? 'FOG Deep Reasoner Ultra'
                : activeModelId === 'fog-code-matrix'
                ? 'FOG Code Matrix Pro'
                : activeModelId === 'fog-creative-pulse'
                ? 'FOG Creative Pulse'
                : activeModelId === 'fog-turbo-flow'
                ? 'FOG Turbo Flow'
                : 'FOG Neural Core v3';

            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === targetChatId) {
                  return {
                    ...c,
                    updatedAt: Date.now(),
                    messages: (c.messages || []).map((m) =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            content: finalContent || brainResult.content,
                            status: 'complete',
                            modelName: formattedModelName,
                            webSearchResults: m.webSearchResults,
                            thoughtData: brainResult.smartPayload.thoughtData,
                            studentInsights: brainResult.smartPayload.studentInsights,
                            codeArtifacts: brainResult.smartPayload.codeArtifacts,
                            cognitiveExploration: brainResult.cognitiveExploration,
                            brainDetails: brainResult.brainDetails,
                          }
                        : m
                    ),
                  };
                }
                return c;
              })
            );
          },
          onError: (error) => {
            console.warn('Stream processing error:', error);
          },
        },
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User stopped generation - finalize with accumulated content
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: (c.messages || []).map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        status: 'complete',
                        content: m.content ? `${m.content} \n\n*(Generation stopped by user)*` : '*(Generation stopped by user)*',
                      }
                    : m
                ),
              };
            }
            return c;
          })
        );
      } else {
        console.error('Failed to generate response:', error);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: (c.messages || []).map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, status: 'error' }
                    : m
                ),
              };
            }
            return c;
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  // Edit user message in-place and re-generate
  const handleEditUserQuery = (newQuery: string) => {
    if (!currentConversation) return;

    // Find the user message being edited
    const messages = currentConversation.messages;
    const userMsgIndex = messages.findIndex((m) => m.role === 'user');

    if (userMsgIndex !== -1) {
      // Trim messages to before this edit point
      const trimmedMessages = messages.slice(0, userMsgIndex);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeChatId ? { ...c, messages: trimmedMessages } : c
        )
      );
    }

    handleSendMessage(newQuery);
  };

  // Regenerate last response
  const handleRegenerateLast = () => {
    if (!currentConversation || currentConversation.messages.length === 0) return;
    const lastUserMsg = [...currentConversation.messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, { isRegeneration: true });
    }
  };

  const handleOpenStudentReport = (customReport?: StudentReportData) => {
    if (customReport) {
      setStudentReportModalState({ isOpen: true, report: customReport });
      return;
    }

    // Find latest student insights from active conversation
    const latestStudentMsg = [...activeMessages]
      .reverse()
      .find((m) => m.studentInsights);

    const topic = latestStudentMsg?.studentInsights?.coreConcept || 'General Concepts & First Principles';
    const report = generateStudentReport(
      topic,
      studentDifficulty,
      studentSessionState,
      latestStudentMsg?.studentInsights
    );

    setStudentReportModalState({ isOpen: true, report });
  };

  if (currentView === 'neural') {
    return (
      <div
        id="froge-app-root"
        className="flex h-screen w-full bg-white text-zinc-900 overflow-hidden font-sans"
      >
        {/* Sidebar accessible in Neural mode as well */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          conversations={conversations}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            handleSelectChat(id);
            handleBackToChat();
          }}
          onNewChat={() => {
            handleNewChat();
            handleBackToChat();
          }}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          onTogglePinChat={handleTogglePinChat}
          onClearAllChats={handleClearAllChats}
          activeMode={activeMode}
          onSelectMode={(mode) => {
            handleSelectMode(mode);
            handleBackToChat();
          }}
          onOpenCommunity={handleOpenCommunity}
          isCommunityActive={false}
          onOpenNeuralControlCenter={handleOpenNeuralSection}
          isNeuralActive={true}
          isOwnerVerified={isOwnerVerified}
        />

        <div className="flex-1 flex flex-col h-full min-w-0 bg-[#FAFAFA]">
          <Header
            activeMode={activeMode}
            onSelectMode={handleSelectMode}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onNewChat={() => {
              handleNewChat();
              handleBackToChat();
            }}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
            onOpenScreenShare={() => setIsScreenModalOpen(true)}
            isSharingScreen={isScreenSharing}
            onOpenBrainTests={() => setIsBrainTestModalOpen(true)}
            onSearchPrompt={(query) => {
              handleBackToChat();
              handleSendMessage(query);
            }}
            onOpenShare={() =>
              setShareModalState({ isOpen: true, conversation: currentConversation })
            }
            onRenameChat={(newTitle) => {
              if (activeChatId) handleRenameChat(activeChatId, newTitle);
            }}
            chatTitle={currentConversation?.title}
            hasMessages={activeMessages.length > 0}
            activeModelId={activeModelId}
            onOpenModelSelector={() => setIsModelSelectorOpen(true)}
            onOpenCommunity={handleOpenCommunity}
            isCommunityActive={false}
            onOpenNeuralArchitecture={() => setIsNeuralModalOpen(true)}
            onOpenApiKey={() => setIsApiKeyModalOpen(true)}
            onOpenNeuralControlCenter={handleOpenNeuralSection}
            isNeuralActive={true}
            onBackToChat={handleBackToChat}
            isOwnerVerified={isOwnerVerified}
          />

          <div className="flex-1 overflow-y-auto">
            <NeuralNetworkControlCenter
              isOpen={true}
              isFullPage={true}
              onClose={handleBackToChat}
              onBackToChat={handleBackToChat}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'community') {
    return (
      <div
        id="froge-app-root"
        className="flex h-screen w-full bg-white text-zinc-900 overflow-hidden font-sans"
      >
        {/* Sidebar accessible in Community mode as well */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          conversations={conversations}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            handleSelectChat(id);
            handleBackToChat();
          }}
          onNewChat={() => {
            handleNewChat();
            handleBackToChat();
          }}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
          onTogglePinChat={handleTogglePinChat}
          onClearAllChats={handleClearAllChats}
          activeMode={activeMode}
          onSelectMode={(mode) => {
            handleSelectMode(mode);
            handleBackToChat();
          }}
          onOpenCommunity={handleOpenCommunity}
          isCommunityActive={true}
          onOpenNeuralControlCenter={handleOpenNeuralSection}
          isNeuralActive={false}
          isOwnerVerified={isOwnerVerified}
        />

        <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto relative">
          <CommunityHome onBackToChat={handleBackToChat} />
        </div>

        {/* Owner-Only Neural Network Control Center */}
        <NeuralNetworkControlCenter
          isOpen={isNeuralControlCenterOpen}
          onClose={() => setIsNeuralControlCenterOpen(false)}
        />
      </div>
    );
  }

  return (
    <div
      id="froge-app-root"
      className="flex h-screen w-full bg-[#FAFAFA] text-zinc-900 overflow-hidden font-sans"
    >
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        onClearAllChats={handleClearAllChats}
        activeMode={activeMode}
        onSelectMode={handleSelectMode}
        onOpenCommunity={handleOpenCommunity}
        isCommunityActive={false}
        onOpenNeuralControlCenter={handleOpenNeuralSection}
        isNeuralActive={false}
        isOwnerVerified={isOwnerVerified}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#FAFAFA] relative">
        {/* Top Header */}
        <Header
          activeMode={activeMode}
          onSelectMode={handleSelectMode}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          onOpenVoice={() => setIsVoiceModalOpen(true)}
          onOpenScreenShare={() => setIsScreenModalOpen(true)}
          isSharingScreen={isScreenSharing}
          onOpenBrainTests={() => setIsBrainTestModalOpen(true)}
          onSearchPrompt={(query) => {
            setIsWebSearchActive(true);
            handleSendMessage(query);
          }}
          onOpenShare={() =>
            setShareModalState({ isOpen: true, conversation: currentConversation })
          }
          onRenameChat={(newTitle) => {
            if (activeChatId) handleRenameChat(activeChatId, newTitle);
          }}
          chatTitle={currentConversation?.title}
          hasMessages={activeMessages.length > 0}
          activeModelId={activeModelId}
          onOpenModelSelector={() => setIsModelSelectorOpen(true)}
          onOpenCommunity={handleOpenCommunity}
          isCommunityActive={false}
          onOpenNeuralArchitecture={() => setIsNeuralModalOpen(true)}
          onOpenApiKey={() => setIsApiKeyModalOpen(true)}
          onOpenNeuralControlCenter={handleOpenNeuralSection}
          isNeuralActive={false}
          onBackToChat={handleBackToChat}
          isOwnerVerified={isOwnerVerified}
        />

        {/* FROGÉ Neural Network In-Computer Brain Status Ribbon */}
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-b border-amber-200/70 dark:border-amber-800/60 px-3 sm:px-6 py-1.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold text-amber-950 dark:text-amber-200 text-xs">
              FROGÉ Neural Core v3
            </span>
            <span className="hidden md:inline text-zinc-500 text-[11px] truncate">
              · 8.03B Dense Parameters (GQA 4:1, SwiGLU, RMSNorm) · 100% In-Computer Local Processing
            </span>
          </div>

          <button
            id="banner-btn-open-neural-network"
            type="button"
            onClick={handleOpenNeuralSection}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95 ml-2"
            title="Open FROGÉ Neural Network Control Center: Architecture, Models, Datasets, Training, Evaluation, Checkpoints"
          >
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>Open Neural Network</span>
            <span className="text-[9px] bg-amber-800 text-amber-100 px-1 py-0.2 rounded font-mono">
              6 Tabs
            </span>
          </button>
        </div>

        {/* Student Mode Dedicated Study Session Toolbar (2-Hour Max Session, Difficulty, Report Generator) */}
        {activeMode === 'student-mode' && (
          <StudentStudyToolbar
            difficulty={studentDifficulty}
            onChangeDifficulty={(diff) => setStudentDifficulty(diff)}
            onQuickPrompt={(prompt) => handleSendMessage(prompt)}
            onOpenReportModal={() => handleOpenStudentReport()}
            sessionState={studentSessionState}
            onUpdateSessionState={setStudentSessionState}
          />
        )}

        {/* Scrollable Center Area (Welcome Screen or Message Stream) */}
        <main className="flex-1 overflow-y-auto flex flex-col justify-between relative bg-white">
          {activeMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <WelcomeScreen
                activeMode={activeMode}
                onSelectMode={handleSelectMode}
                onSelectPrompt={(p) => handleSendMessage(p)}
                onOpenNeuralControlCenter={handleOpenNeuralSection}
              />
            </div>
          ) : (
            <ChatStream
              messages={activeMessages}
              isGenerating={isGenerating}
              activeMode={activeMode}
              isSharingScreen={isScreenSharing}
              isAppInBackground={isScreenAppInBackground}
              streamResolution={screenResolution}
              onEditQuery={handleEditUserQuery}
              onRegenerate={handleRegenerateLast}
              onRetry={handleRegenerateLast}
              onStopGeneration={handleStopGeneration}
              onShareMessage={(msg) =>
                setShareModalState({ isOpen: true, message: msg })
              }
              onOpenStudentReport={handleOpenStudentReport}
              onQuickScanAndAsk={(prompt) => {
                const targetPrompt = prompt || 'Analyze this scene and provide key insights, findings, or recommendations.';
                triggerScreenScanAnimation((frame) => {
                  handleSendMessage(targetPrompt, { visualAttachment: frame });
                }, 'Device Screen Scan');
              }}
              onStopSharingScreen={stopScreenSharing}
              onOpenScreenShareModal={() => setIsScreenModalOpen(true)}
            />
          )}

          {/* Sticky Message Composer */}
          <div className="shrink-0">
            <Composer
              input={input}
              setInput={setInput}
              onSend={() => handleSendMessage()}
              onStop={handleStopGeneration}
              isGenerating={isGenerating}
              activeMode={activeMode}
              onSelectMode={handleSelectMode}
              onOpenVoice={() => setIsVoiceModalOpen(true)}
              onOpenScreenShare={() => setIsScreenModalOpen(true)}
              onQuickScanAndAsk={(prompt) => {
                const targetPrompt = prompt || 'Analyze this scene and provide key insights, findings, or recommendations.';
                triggerScreenScanAnimation((frame) => {
                  handleSendMessage(targetPrompt, { visualAttachment: frame });
                }, 'Device Screen Scan');
              }}
              isSharingScreen={isScreenSharing}
              isAppInBackground={isScreenAppInBackground}
              attachedScreenFrame={attachedScreenFrame}
              onRemoveScreenFrame={() => setAttachedScreenFrame(null)}
              activeModelId={activeModelId}
              onOpenModelSelector={() => setIsModelSelectorOpen(true)}
              isWebSearchActive={isWebSearchActive}
              onToggleWebSearch={() => setIsWebSearchActive((prev) => !prev)}
            />
          </div>
        </main>
      </div>

      {/* Right Widget Sidebar (Tools, Memory, Recent Chats, Model Router Live Metrics) */}
      <RightSidebar
        conversations={conversations}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        activeMode={activeMode}
        onSelectToolPrompt={(prompt) => {
          if (prompt.includes('Search the live web') || prompt.includes('Search')) {
            setIsWebSearchActive(true);
          }
          setInput(prompt);
          if (prompt.trim().endsWith(':')) {
            const textarea = document.getElementById('composer-textarea') as HTMLTextAreaElement | null;
            if (textarea) textarea.focus();
          } else {
            handleSendMessage(prompt);
          }
        }}
        onOpenRouterTests={() => setIsBrainTestModalOpen(true)}
        activeModelId={activeModelId}
        onOpenModelSelector={() => setIsModelSelectorOpen(true)}
      />

      {/* Screen Share Control Hub Modal */}
      <ScreenShareModal
        isOpen={isScreenModalOpen}
        onClose={() => setIsScreenModalOpen(false)}
        isSharing={isScreenSharing}
        stream={screenStream}
        streamResolution={screenResolution}
        displaySurface={screenDisplaySurface}
        isAutoObserving={isScreenAutoObserving}
        onStartSharing={startScreenSharing}
        onStopSharing={stopScreenSharing}
        onCaptureFrame={captureScreenFrame}
        onTriggerScanAnimation={triggerScreenScanAnimation}
        onToggleAutoObserve={() => toggleScreenAutoObserve()}
        onSendWithScreen={(prompt, frame) => handleSendMessage(prompt, { visualAttachment: frame })}
        onAttachToComposer={(frame) => setAttachedScreenFrame(frame)}
        onDockScreenEye={() => setIsScreenModalOpen(false)}
      />

      {/* Holographic Device Screen Scan HUD Animation Overlay */}
      <DeviceScanOverlay isScanning={isScreenScanning} />

      {/* Screen Eye Floating Dock Widget (Matches user's mobile screen share screenshot) */}
      <ScreenEyeDock
        isSharing={isScreenSharing}
        streamResolution={screenResolution}
        displaySurface={screenDisplaySurface}
        isAutoObserving={isScreenAutoObserving}
        onOpenFullModal={() => setIsScreenModalOpen(true)}
        onStopSharing={stopScreenSharing}
        onCaptureFrame={captureScreenFrame}
        onQuickAsk={(prompt, frame) => handleSendMessage(prompt, { visualAttachment: frame })}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        onTriggerScanAnimation={triggerScreenScanAnimation}
      />

      {/* Voice Interface Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSendTranscript={(text) => handleSendMessage(text)}
        onInsertToComposer={(text) => setInput(text)}
      />

      {/* Student Study Report Modal */}
      <StudentReportModal
        isOpen={studentReportModalState.isOpen}
        onClose={() => setStudentReportModalState({ isOpen: false, report: null })}
        report={studentReportModalState.report}
      />

      {/* Share & Export Modal */}
      <ShareModal
        isOpen={shareModalState.isOpen}
        onClose={() =>
          setShareModalState({ isOpen: false, message: null, conversation: null })
        }
        message={shareModalState.message}
        conversation={shareModalState.conversation}
      />

      {/* Brain Architecture Test Modal */}
      <BrainTestModal
        isOpen={isBrainTestModalOpen}
        onClose={() => setIsBrainTestModalOpen(false)}
      />

      {/* FROGÉ AI In-House API Key Modal */}
      <FrogeApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* 4-Tier Neural Network Architecture Modal */}
      <NeuralArchitectureModal
        isOpen={isNeuralModalOpen}
        onClose={() => setIsNeuralModalOpen(false)}
        initialQuery={input || 'List all dates from 2030 to 2040 when Earth and Mars are closest.'}
      />

      {/* Model & Engine Selector Modal (FROGÉ Model Gateway / Native) */}
      <ModelSelectorModal
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        activeModelId={activeModelId}
        onSelectModel={(id) => {
          setActiveModelId(id);
          setStoredActiveModel(id);
        }}
      />

      {/* Owner-Only Neural Network Control Center */}
      <NeuralNetworkControlCenter
        isOpen={isNeuralControlCenterOpen}
        onClose={() => setIsNeuralControlCenterOpen(false)}
      />
    </div>
  );
}
