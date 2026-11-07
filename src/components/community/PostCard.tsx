import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Trash2,
  ExternalLink,
  Github,
  HelpCircle,
  MessageCircle,
  Rocket,
  Tag,
  Sparkles,
  Check,
} from 'lucide-react';
import { Post, UserProfile } from '../../community/types';
import { CommentSection } from './CommentSection';
import {
  toggleLikePost,
  toggleSavePost,
  deletePost,
  frogeAiCommunityAssist,
} from '../../community/services/postService';

interface PostCardProps {
  post: Post;
  currentUser: UserProfile;
  onPostUpdated?: (updated: Post) => void;
  onPostDeleted?: (postId: string) => void;
  onSelectCommunity?: (communityId: string, communityName?: string) => void;
  onSelectAuthor?: (authorId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onPostUpdated,
  onPostDeleted,
  onSelectCommunity,
  onSelectAuthor,
}) => {
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || (post.likes?.length || 0));
  const [savedBy, setSavedBy] = useState<string[]>(post.savedBy || []);
  const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  const isLiked = likes.includes(currentUser.uid);
  const isSaved = savedBy.includes(currentUser.uid);
  const isAuthor = post.authorId === currentUser.uid;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic UI update
    const nextIsLiked = !isLiked;
    const nextLikes = nextIsLiked
      ? [...likes, currentUser.uid]
      : likes.filter((id) => id !== currentUser.uid);
    setLikes(nextLikes);
    setLikesCount(nextLikes.length);

    try {
      const res = await toggleLikePost(post.id, currentUser.uid);
      setLikes(res.likes);
      setLikesCount(res.likesCount);
      if (onPostUpdated) {
        onPostUpdated({ ...post, likes: res.likes, likesCount: res.likesCount });
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Revert on failure
      setLikes(likes);
      setLikesCount(likes.length);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIsSaved = !isSaved;
    const nextSaved = nextIsSaved
      ? [...savedBy, currentUser.uid]
      : savedBy.filter((id) => id !== currentUser.uid);
    setSavedBy(nextSaved);

    try {
      const res = await toggleSavePost(post.id, currentUser.uid);
      setSavedBy(res.savedBy);
      if (onPostUpdated) {
        onPostUpdated({ ...post, savedBy: res.savedBy });
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
      setSavedBy(savedBy);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/community/post/${post.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(post.id);
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Could not delete post. Please try again.');
    }
  };

  const handleAiSummarize = async () => {
    if (aiSummary) {
      setAiSummary(null);
      return;
    }
    setLoadingAiSummary(true);
    try {
      const task = post.category === 'question' ? 'explain_question' : 'summarize_discussion';
      const summary = await frogeAiCommunityAssist(task, `${post.title}\n\n${post.content}`);
      setAiSummary(summary);
    } catch {
      setAiSummary('FROGÉ AI summarized this post into key findings.');
    } finally {
      setLoadingAiSummary(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
      if (diff < 60) return 'just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return '';
    }
  };

  const getCategoryMeta = () => {
    switch (post.category) {
      case 'question':
        return {
          label: 'Question',
          color: 'text-amber-800 bg-amber-50 border-amber-200/80',
          icon: <HelpCircle className="w-3 h-3 text-amber-600" />,
        };
      case 'project':
        return {
          label: 'Project Showcase',
          color: 'text-emerald-800 bg-emerald-50 border-emerald-200/80',
          icon: <Rocket className="w-3 h-3 text-emerald-600" />,
        };
      default:
        return {
          label: 'Discussion',
          color: 'text-blue-800 bg-blue-50 border-blue-200/80',
          icon: <MessageCircle className="w-3 h-3 text-blue-600" />,
        };
    }
  };

  const catMeta = getCategoryMeta();

  return (
    <article className="bg-white border border-zinc-200/80 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all">
      {/* Header Row: Category Badge, Community, Author, Timestamp, Delete */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Category Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold border text-[11px] ${catMeta.color}`}
          >
            {catMeta.icon}
            <span>{catMeta.label}</span>
          </span>

          {/* Community Name Tag */}
          {post.communityName && (
            <button
              onClick={() => onSelectCommunity?.(post.communityId || '', post.communityName)}
              className="font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50/60 px-2 py-0.5 rounded border border-emerald-100 transition-colors"
            >
              c/{post.communityName}
            </button>
          )}

          {/* Author */}
          <div className="flex items-center gap-1.5 text-zinc-600">
            <span className="text-zinc-300">•</span>
            <button
              onClick={() => onSelectAuthor?.(post.authorId)}
              className="flex items-center gap-1 font-semibold text-zinc-900 hover:underline"
            >
              <span className="w-4 h-4 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[9px] font-bold">
                {(post.authorName || 'U')[0].toUpperCase()}
              </span>
              <span>{post.authorName || 'Anonymous'}</span>
            </button>
            <span className="text-zinc-400 text-[11px]">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Delete Post if Author */}
        {isAuthor && (
          <button
            onClick={handleDelete}
            className="text-zinc-400 hover:text-red-600 p-1 rounded-md transition-colors"
            title="Delete this post"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Post Title */}
      <h2 className="text-sm sm:text-base font-bold text-zinc-900 mb-2 leading-snug">
        {post.title}
      </h2>

      {/* Post Content */}
      <p className="text-xs sm:text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed mb-3">
        {post.content}
      </p>

      {/* Project Showcase Links (Demo & GitHub Repo) */}
      {(post.projectDemoUrl || post.projectRepoUrl) && (
        <div className="flex flex-wrap items-center gap-2 mb-3 pt-1">
          {post.projectDemoUrl && (
            <a
              href={post.projectDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </a>
          )}
          {post.projectRepoUrl && (
            <a
              href={post.projectRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Code</span>
            </a>
          )}
        </div>
      )}

      {/* Tags List */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md"
            >
              <Tag className="w-2.5 h-2.5 text-zinc-400" />
              <span>{tag}</span>
            </span>
          ))}
        </div>
      )}

      {/* FROGÉ AI Summarize / Explain Output Drawer */}
      {aiSummary && (
        <div className="mb-3.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-emerald-800 font-bold text-[11px]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              FROGÉ AI Assistant Insight
            </span>
            <button
              onClick={() => setAiSummary(null)}
              className="hover:text-emerald-950 font-bold"
            >
              ✕
            </button>
          </div>
          <div className="text-zinc-700 whitespace-pre-wrap leading-relaxed">
            {aiSummary}
          </div>
        </div>
      )}

      {/* Interactions Footer Bar */}
      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 text-xs">
        <div className="flex items-center gap-3">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-medium ${
              isLiked
                ? 'text-red-600 bg-red-50 hover:bg-red-100/80'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isLiked ? 'fill-red-500 text-red-500' : 'text-zinc-400'
              }`}
            />
            <span>{likesCount}</span>
          </button>

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-medium ${
              showComments
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
            title="View & add comments"
          >
            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
            <span>{commentsCount}</span>
          </button>

          {/* Bookmark / Save */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isSaved
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save post'}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isSaved ? 'fill-emerald-600 text-emerald-600' : ''
              }`}
            />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* FROGÉ AI Summarize / Explain helper button */}
          <button
            onClick={handleAiSummarize}
            disabled={loadingAiSummary}
            className="flex items-center gap-1 px-2 py-1 text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors text-[11px]"
            title="Use FROGÉ AI to summarize or explain this discussion"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span className="hidden sm:inline">
              {loadingAiSummary ? 'Analyzing...' : post.category === 'question' ? 'Explain Q' : 'AI Summary'}
            </span>
          </button>

          {/* Share Button with copied indicator */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2 py-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
            title="Copy share link"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold text-[11px]">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded Comments Thread */}
      {showComments && (
        <CommentSection
          postId={post.id}
          currentUser={currentUser}
          onCommentCountChange={(count) => {
            setCommentsCount(count);
            if (onPostUpdated) {
              onPostUpdated({ ...post, commentsCount: count });
            }
          }}
        />
      )}
    </article>
  );
};
