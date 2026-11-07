import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Compass,
  Sparkles,
  MessageCircle,
  HelpCircle,
  Rocket,
  Search,
  Bookmark,
  RefreshCw,
  Loader2,
  AlertCircle,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { Community, Post, PostCategory, UserProfile } from '../../community/types';
import {
  getCommunities,
  getPosts,
} from '../../community/services/postService';
import { getCurrentUser, saveCurrentUser } from '../../community/services/authService';
import { CommunityHeader } from './CommunityHeader';
import { PostCard } from './PostCard';
import { CommunityCard } from './CommunityCard';
import { CreatePostModal } from './CreatePostModal';
import { CreateCommunityModal } from './CreateCommunityModal';
import { UserProfileModal } from './UserProfileModal';

interface CommunityHomeProps {
  onBackToChat: () => void;
  initialRoutePath?: string;
}

export const CommunityHome: React.FC<CommunityHomeProps> = ({
  onBackToChat,
  initialRoutePath = '/community',
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
  const [activeCommunityName, setActiveCommunityName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [profileModalState, setProfileModalState] = useState<{
    isOpen: boolean;
    userId: string;
  }>({
    isOpen: false,
    userId: currentUser.uid,
  });

  // Handle URL route parsing on mount & history sync
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      if (path.startsWith('/community/profile/')) {
        const uid = path.replace('/community/profile/', '').trim();
        if (uid) {
          setProfileModalState({ isOpen: true, userId: uid });
        }
      } else if (path.startsWith('/community/post/')) {
        // Post route - search query or view specific post
        const pId = path.replace('/community/post/', '').trim();
        if (pId) {
          setCurrentTab('feed');
        }
      } else if (path.startsWith('/community/discover')) {
        setCurrentTab('discover');
      } else if (path.startsWith('/community/') && path !== '/community') {
        const commId = path.replace('/community/', '').trim();
        if (commId) {
          setActiveCommunityId(commId);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, []);

  // Update browser URL on navigation (without reload)
  const updateUrlRoute = (newPath: string) => {
    try {
      if (window.location.pathname !== newPath) {
        window.history.pushState(null, '', newPath);
      }
    } catch {}
  };

  // Initial data loading
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setError(null);
    setLoadingPosts(true);
    setLoadingCommunities(true);

    try {
      const [fetchedPosts, fetchedCommunities] = await Promise.all([
        getPosts(),
        getCommunities(),
      ]);

      setPosts(fetchedPosts);
      setCommunities(fetchedCommunities);
    } catch (err: any) {
      console.error('Failed to load community data:', err);
      setError('Unable to reach Community Firestore. Please check connection and try again.');
    } finally {
      setLoadingPosts(false);
      setLoadingCommunities(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
  };

  // Switch community filter
  const handleSelectCommunity = (commId: string, commName?: string) => {
    setActiveCommunityId(commId);
    setActiveCommunityName(commName || commId);
    setCurrentTab('feed');
    updateUrlRoute(`/community/${commId}`);
  };

  const handleClearCommunity = () => {
    setActiveCommunityId(null);
    setActiveCommunityName(null);
    updateUrlRoute('/community');
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'discover') {
      updateUrlRoute('/community/discover');
    } else {
      updateUrlRoute('/community');
    }
  };

  // Filter posts based on tab, community filter, and search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Community filter
      if (activeCommunityId && post.communityId !== activeCommunityId) {
        return false;
      }

      // Tab filter
      if (currentTab === 'discussions' && post.category !== 'discussion') {
        return false;
      }
      if (currentTab === 'questions' && post.category !== 'question') {
        return false;
      }
      if (currentTab === 'projects' && post.category !== 'project') {
        return false;
      }
      if (currentTab === 'saved') {
        if (!post.savedBy?.includes(currentUser.uid)) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = post.title?.toLowerCase().includes(q);
        const matchesContent = post.content?.toLowerCase().includes(q);
        const matchesAuthor = post.authorName?.toLowerCase().includes(q);
        const matchesTags = post.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesAuthor && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [posts, activeCommunityId, currentTab, searchQuery, currentUser.uid]);

  // Filter communities based on search query in Discover tab
  const filteredCommunities = useMemo(() => {
    if (!searchQuery.trim()) return communities;
    const q = searchQuery.toLowerCase().trim();
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
    );
  }, [communities, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-zinc-900 flex flex-col font-sans select-none antialiased">
      {/* Top Header */}
      <CommunityHeader
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenCreateCommunity={() => setIsCreateCommunityOpen(true)}
        onOpenProfile={() =>
          setProfileModalState({ isOpen: true, userId: currentUser.uid })
        }
        onBackToChat={() => {
          updateUrlRoute('/');
          onBackToChat();
        }}
        currentUser={currentUser}
        activeCommunityName={activeCommunityName || undefined}
        onClearActiveCommunity={handleClearCommunity}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Feed / Content Area (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Subheader / Status Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-900">
                {currentTab === 'discover'
                  ? 'Discover Communities'
                  : currentTab === 'projects'
                  ? 'Project Showcase'
                  : currentTab === 'questions'
                  ? 'Community Questions'
                  : currentTab === 'discussions'
                  ? 'Discussions'
                  : currentTab === 'saved'
                  ? 'Your Saved Posts'
                  : activeCommunityName
                  ? `c/${activeCommunityName} Feed`
                  : 'Latest Activity & Feed'}
              </h1>

              {currentTab !== 'discover' && !loadingPosts && (
                <span className="text-xs text-zinc-500 font-semibold bg-zinc-100 px-2 py-0.5 rounded-full">
                  {filteredPosts.length}
                </span>
              )}
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="Refresh feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={handleManualRefresh}
                className="px-2.5 py-1 bg-white border border-red-300 text-red-700 font-semibold rounded-lg hover:bg-red-100/50 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* DISCOVER COMMUNITIES TAB */}
          {currentTab === 'discover' ? (
            <div>
              {loadingCommunities ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Loading communities from Firestore...</span>
                </div>
              ) : filteredCommunities.length === 0 ? (
                /* Proper Empty State as instructed by user prompt */
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-12 text-center shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-zinc-900 text-base mb-1">
                    No communities yet.
                  </h3>
                  <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-4 leading-relaxed">
                    Create the first community to start collaborating and sharing knowledge with fellow FROGÉ builders.
                  </p>
                  <button
                    onClick={() => setIsCreateCommunityOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create the First Community</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredCommunities.map((comm) => (
                    <CommunityCard
                      key={comm.id}
                      community={comm}
                      currentUser={currentUser}
                      onSelectCommunity={handleSelectCommunity}
                      onMembershipChanged={(commId, isJoined, count) => {
                        setCommunities((prev) =>
                          prev.map((c) =>
                            c.id === commId
                              ? {
                                  ...c,
                                  memberCount: count,
                                  members: isJoined
                                    ? [...(c.members || []), currentUser.uid]
                                    : (c.members || []).filter((id) => id !== currentUser.uid),
                                }
                              : c
                          )
                        );
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* POSTS / QUESTIONS / DISCUSSIONS / PROJECTS FEED */
            <div>
              {loadingPosts ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span>Loading posts from Firestore...</span>
                </div>
              ) : filteredPosts.length === 0 ? (
                /* Proper Empty State */
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-12 text-center shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    {currentTab === 'projects' ? (
                      <Rocket className="w-6 h-6 text-emerald-600" />
                    ) : currentTab === 'questions' ? (
                      <HelpCircle className="w-6 h-6 text-amber-600" />
                    ) : currentTab === 'saved' ? (
                      <Bookmark className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <MessageCircle className="w-6 h-6 text-zinc-500" />
                    )}
                  </div>

                  <h3 className="font-bold text-zinc-900 text-base mb-1">
                    {currentTab === 'saved'
                      ? 'No saved posts yet.'
                      : currentTab === 'projects'
                      ? 'No project showcases yet.'
                      : currentTab === 'questions'
                      ? 'No questions asked yet.'
                      : activeCommunityName
                      ? `No posts in c/${activeCommunityName} yet.`
                      : 'No posts yet.'}
                  </h3>

                  <p className="text-zinc-500 text-xs max-w-sm mx-auto mb-4 leading-relaxed">
                    {currentTab === 'saved'
                      ? 'Click the bookmark icon on any post or showcase to save it here for later reference.'
                      : currentTab === 'projects'
                      ? 'Showcase your AI tools, prototypes, or applications built with FROGÉ.'
                      : currentTab === 'questions'
                      ? 'Be the first to post a technical question and receive answers from the community.'
                      : 'Be the first to initiate a discussion, ask a technical question, or showcase your project.'}
                  </p>

                  {currentTab !== 'saved' && (
                    <button
                      onClick={() => setIsCreatePostOpen(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create the First Post</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onPostUpdated={(updated) => {
                        setPosts((prev) =>
                          prev.map((p) => (p.id === updated.id ? updated : p))
                        );
                      }}
                      onPostDeleted={(postId) => {
                        setPosts((prev) => prev.filter((p) => p.id !== postId));
                      }}
                      onSelectCommunity={(commId, commName) => {
                        handleSelectCommunity(commId, commName);
                      }}
                      onSelectAuthor={(authorId) => {
                        updateUrlRoute(`/community/profile/${authorId}`);
                        setProfileModalState({ isOpen: true, userId: authorId });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Community Sidebar & Information (4 cols on lg) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Welcome Card & FROGÉ Network Info */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="frog">🐸</span>
              <div>
                <h3 className="font-bold text-sm text-zinc-900">
                  FROGÉ AI Community
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Open developer & researcher ecosystem
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Connect with fellow developers, discuss neural routing architectures, showcase AI applications, and get answers to your questions.
            </p>

            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>{communities.length} {communities.length === 1 ? 'Community' : 'Communities'}</span>
              <span>•</span>
              <span>{posts.length} {posts.length === 1 ? 'Post' : 'Posts'}</span>
            </div>
          </div>

          {/* Quick Communities Widget */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                <span>Communities</span>
              </h3>
              <button
                onClick={() => setCurrentTab('discover')}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                Browse all
              </button>
            </div>

            {communities.length === 0 ? (
              <div className="text-center py-4 text-xs text-zinc-400 space-y-2">
                <p className="italic">No communities created yet.</p>
                <button
                  onClick={() => setIsCreateCommunityOpen(true)}
                  className="px-3 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200"
                >
                  + Create Community
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {communities.slice(0, 5).map((comm) => (
                  <button
                    key={comm.id}
                    onClick={() => handleSelectCommunity(comm.id, comm.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left ${
                      activeCommunityId === comm.id
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80'
                        : 'hover:bg-zinc-50 text-zinc-800'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold block truncate">c/{comm.name}</span>
                      <span className="text-[10px] text-zinc-400 block truncate">
                        {comm.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded shrink-0">
                      {comm.memberCount || 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FROGÉ AI Powered Assistance Highlights */}
          <div className="bg-gradient-to-br from-emerald-50/70 via-white to-zinc-50 border border-emerald-200/70 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>FROGÉ In-Brain Assistance</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Use FROGÉ AI directly inside the Community Hub to:
            </p>
            <ul className="text-[11px] text-zinc-600 space-y-1 list-disc pl-4">
              <li>Formulate precise technical questions</li>
              <li>Summarize long discussion threads</li>
              <li>Improve project showcase descriptions</li>
              <li>Explain complex community code snippets</li>
            </ul>
          </div>

          {/* Back to Chat Button (Sidebar) */}
          <button
            onClick={() => {
              updateUrlRoute('/');
              onBackToChat();
            }}
            className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-98"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to FROGÉ AI Chat</span>
          </button>
        </aside>
      </div>

      {/* MODALS */}
      {/* 1. Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        currentUser={currentUser}
        communities={communities}
        initialCommunityId={activeCommunityId || undefined}
        onPostCreated={(newPost) => {
          setPosts([newPost, ...posts]);
        }}
      />

      {/* 2. Create Community Modal */}
      <CreateCommunityModal
        isOpen={isCreateCommunityOpen}
        onClose={() => setIsCreateCommunityOpen(false)}
        currentUser={currentUser}
        onCommunityCreated={(newComm) => {
          setCommunities([newComm, ...communities]);
          handleSelectCommunity(newComm.id, newComm.name);
        }}
      />

      {/* 3. User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalState.isOpen}
        onClose={() => {
          setProfileModalState({ isOpen: false, userId: currentUser.uid });
          updateUrlRoute(activeCommunityId ? `/community/${activeCommunityId}` : '/community');
        }}
        targetUserId={profileModalState.userId}
        currentUser={currentUser}
        communities={communities}
        onCurrentUserUpdated={(updated) => {
          setCurrentUser(updated);
        }}
      />
    </div>
  );
};
