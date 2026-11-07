import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Rocket,
  HelpCircle,
  MessageCircle,
  Loader2,
  Tag,
  Link as LinkIcon,
  Github,
} from 'lucide-react';
import { Community, Post, PostCategory, UserProfile } from '../../community/types';
import { createPost, frogeAiCommunityAssist } from '../../community/services/postService';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  communities: Community[];
  initialCommunityId?: string;
  onPostCreated: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  communities,
  initialCommunityId,
  onPostCreated,
}) => {
  const [category, setCategory] = useState<PostCategory>('discussion');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(
    initialCommunityId || (communities[0]?.id || '')
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [projectDemoUrl, setProjectDemoUrl] = useState('');
  const [projectRepoUrl, setProjectRepoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiAssisting, setIsAiAssisting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAiAssist = async () => {
    if (!title.trim() && !content.trim()) {
      setError('Please type an initial title or draft content first for FROGÉ AI to refine.');
      return;
    }
    setError(null);
    setIsAiAssisting(true);

    try {
      const task =
        category === 'question'
          ? 'help_formulate_question'
          : category === 'project'
          ? 'improve_project_description'
          : 'help_write_post';

      const combinedText = `Title: ${title}\nContent: ${content}`;
      const improved = await frogeAiCommunityAssist(task, combinedText);
      setContent(improved);
    } catch (err) {
      console.warn('AI assist notice:', err);
    } finally {
      setIsAiAssisting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Post title is required.');
      return;
    }
    if (!content.trim()) {
      setError('Post content is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const targetCommunity = communities.find((c) => c.id === selectedCommunityId);
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const newPost = await createPost({
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.username,
        authorUsername: currentUser.username,
        title: title.trim(),
        content: content.trim(),
        communityId: selectedCommunityId || '',
        communityName: targetCommunity?.name || 'General',
        category,
        tags: parsedTags,
        projectDemoUrl: category === 'project' ? projectDemoUrl.trim() : undefined,
        projectRepoUrl: category === 'project' ? projectRepoUrl.trim() : undefined,
      });

      onPostCreated(newPost);
      onClose();
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.message || 'Failed to publish post. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-zinc-900">
              Create Community Post
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
              FROGÉ Network
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {/* Category Tabs */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1.5">
              Select Post Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('discussion')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  category === 'discussion'
                    ? 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-500/20 shadow-2xs'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Discussion</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('question')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  category === 'question'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/20 shadow-2xs'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Question</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('project')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  category === 'project'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                <span>Project Showcase</span>
              </button>
            </div>
          </div>

          {/* Community Selection */}
          {communities.length > 0 && (
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">
                Post to Community
              </label>
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    c/{c.name} — ({c.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'question'
                  ? 'e.g., How to optimize FROGÉ Multi-Model routing latency in production?'
                  : category === 'project'
                  ? 'e.g., Built an Autonomous Research Agent powered by FROGÉ Brain'
                  : 'e.g., Insights from integrating FROGÉ Screen Eye with local tools'
              }
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 placeholder-zinc-400 font-medium"
              required
            />
          </div>

          {/* Project Specific URLs (Demo & GitHub) */}
          {category === 'project' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl">
              <div>
                <label className="flex items-center gap-1 font-semibold text-emerald-900 mb-1">
                  <LinkIcon className="w-3 h-3 text-emerald-600" />
                  <span>Live Demo URL</span>
                </label>
                <input
                  type="url"
                  value={projectDemoUrl}
                  onChange={(e) => setProjectDemoUrl(e.target.value)}
                  placeholder="https://my-app.example.com"
                  className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 font-semibold text-emerald-900 mb-1">
                  <Github className="w-3 h-3 text-emerald-600" />
                  <span>GitHub Repository</span>
                </label>
                <input
                  type="url"
                  value={projectRepoUrl}
                  onChange={(e) => setProjectRepoUrl(e.target.value)}
                  placeholder="https://github.com/user/project"
                  className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="flex items-center justify-between font-semibold text-zinc-700 mb-1">
              <span>Tags (comma-separated)</span>
              <span className="text-[10px] text-zinc-400 font-normal">e.g. ai, routing, typescript</span>
            </label>
            <div className="relative">
              <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="ai-tools, prompt-engineering, agents"
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Content with AI Assistant Toolbar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-700">
                Post Content & Details <span className="text-red-500">*</span>
              </label>

              {/* FROGÉ AI Assistant Button */}
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={isAiAssisting}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-md transition-colors"
                title="Use FROGÉ AI to refine, structure, or improve this draft"
              >
                {isAiAssisting ? (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                ) : (
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                )}
                <span>
                  {category === 'question'
                    ? 'AI Formulate Question'
                    : category === 'project'
                    ? 'AI Enhance Description'
                    : 'AI Polish Draft'}
                </span>
              </button>
            </div>

            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                category === 'question'
                  ? 'Describe what you are trying to accomplish, the error or challenge encountered, and what steps you have already tried...'
                  : category === 'project'
                  ? 'Introduce your project: What does it do? What technologies did you use? What problems does it solve?'
                  : 'Share your ideas, architecture walkthrough, or learnings with the community...'
              }
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans placeholder-zinc-400 resize-y"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Publish Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
