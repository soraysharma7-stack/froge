import React, { useState } from 'react';
import { X, Users, Sparkles, Loader2 } from 'lucide-react';
import { Community, UserProfile } from '../../community/types';
import { createCommunity } from '../../community/services/postService';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onCommunityCreated: (community: Community) => void;
}

const CATEGORIES = [
  'AI & Neural Models',
  'Autonomous Agents',
  'Code & Engineering',
  'Student & Education',
  'Creative & Multimodal',
  'General Discussion',
];

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCommunityCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Community name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Community description is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await createCommunity({
        name: name.trim().replace(/^c\//, ''),
        description: description.trim(),
        category,
        creatorId: currentUser.uid,
      });

      onCommunityCreated(created);
      onClose();
    } catch (err: any) {
      console.error('Failed to create community:', err);
      setError(err.message || 'Could not create community.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-sm sm:text-base text-zinc-900">
              Create New Community
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Community Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                c/
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="froge-neural-devs"
                className="w-full pl-8 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Lowercase letters, numbers, hyphens only.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the purpose of this community? Who should join?"
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-emerald-500 placeholder-zinc-400 leading-relaxed resize-y"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !description.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Create Community</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
