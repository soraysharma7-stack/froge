import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Loader2, User } from 'lucide-react';
import { Comment, UserProfile } from '../../community/types';
import { getComments, addComment, deleteComment } from '../../community/services/postService';

interface CommentSectionProps {
  postId: string;
  currentUser: UserProfile;
  onCommentCountChange?: (count: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  currentUser,
  onCommentCountChange,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getComments(postId);
      setComments(data);
      if (onCommentCountChange) {
        onCommentCountChange(data.length);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError('Could not load comments.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const created = await addComment(postId, {
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.username || 'Community Member',
        content: newCommentText.trim(),
      });
      const updated = [...comments, created];
      setComments(updated);
      setNewCommentText('');
      if (onCommentCountChange) {
        onCommentCountChange(updated.length);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to post reply.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(postId, commentId);
      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      if (onCommentCountChange) {
        onCommentCountChange(updated.length);
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
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

  return (
    <div className="mt-3 pt-3 border-t border-zinc-100 space-y-3">
      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-4 text-xs text-zinc-400 gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-zinc-400 py-1 italic">
          No comments yet. Share your thoughts or answer first!
        </p>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {comments.map((comment) => {
            const isAuthor = comment.authorId === currentUser.uid;
            return (
              <div
                key={comment.id}
                className="bg-zinc-50/80 rounded-lg p-2.5 text-xs text-zinc-800 space-y-1 border border-zinc-100 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                      {(comment.authorName || 'U')[0].toUpperCase()}
                    </div>
                    <span>{comment.authorName}</span>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      • {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>

                  {isAuthor && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-600 transition-opacity p-0.5 rounded"
                      title="Delete reply"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-zinc-700 whitespace-pre-wrap leading-relaxed pl-5.5">
                  {comment.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* New Comment Input */}
      <form onSubmit={handleAddComment} className="flex gap-2 items-center">
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Write a constructive reply..."
          className="flex-1 px-3 py-1.5 text-xs text-zinc-800 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-emerald-500 placeholder-zinc-400"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={!newCommentText.trim() || submitting}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
        >
          {submitting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
          <span>Reply</span>
        </button>
      </form>
    </div>
  );
};
