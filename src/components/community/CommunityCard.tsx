import React, { useState } from 'react';
import { Users, Check, Plus, MessageSquare } from 'lucide-react';
import { Community, UserProfile } from '../../community/types';
import { joinCommunity } from '../../community/services/postService';

interface CommunityCardProps {
  community: Community;
  currentUser: UserProfile;
  onSelectCommunity: (communityId: string, communityName: string) => void;
  onMembershipChanged?: (communityId: string, isJoined: boolean, count: number) => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  currentUser,
  onSelectCommunity,
  onMembershipChanged,
}) => {
  const isInitiallyJoined =
    community.members?.includes(currentUser.uid) ||
    currentUser.joinedCommunities?.includes(community.id) ||
    false;

  const [isJoined, setIsJoined] = useState(isInitiallyJoined);
  const [memberCount, setMemberCount] = useState(community.memberCount || 1);
  const [loading, setLoading] = useState(false);

  const handleToggleJoin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    // Optimistic toggle
    const nextJoined = !isJoined;
    const nextCount = nextJoined ? memberCount + 1 : Math.max(0, memberCount - 1);
    setIsJoined(nextJoined);
    setMemberCount(nextCount);
    setLoading(true);

    try {
      const res = await joinCommunity(community.id, currentUser.uid);
      setIsJoined(res.isJoined);
      setMemberCount(res.memberCount);
      if (onMembershipChanged) {
        onMembershipChanged(community.id, res.isJoined, res.memberCount);
      }
    } catch (err) {
      console.error('Failed to toggle community membership:', err);
      // Revert on error
      setIsJoined(isJoined);
      setMemberCount(memberCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => onSelectCommunity(community.id, community.name)}
      className="bg-white border border-zinc-200/80 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-2xs">
              {community.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors text-sm sm:text-base">
                c/{community.name}
              </h3>
              <span className="text-[11px] font-semibold text-zinc-500">
                {community.category || 'General'}
              </span>
            </div>
          </div>

          {/* Join / Leave Button */}
          <button
            onClick={handleToggleJoin}
            disabled={loading}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 shrink-0 ${
              isJoined
                ? 'bg-zinc-100 hover:bg-red-50 text-zinc-700 hover:text-red-700 border-zinc-200 hover:border-red-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-2xs'
            }`}
          >
            {isJoined ? (
              <>
                <Check className="w-3 h-3 text-emerald-600 group-hover:text-red-600" />
                <span>Joined</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Join</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-zinc-600 line-clamp-3 mb-3 leading-relaxed">
          {community.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1 font-medium">
          <Users className="w-3.5 h-3.5 text-zinc-400" />
          <span>
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>

        <span className="text-emerald-700 font-semibold group-hover:underline">
          View Discussions →
        </span>
      </div>
    </div>
  );
};
