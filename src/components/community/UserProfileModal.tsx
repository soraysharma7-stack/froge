import React, { useState, useEffect } from 'react';
import { X, User, Edit2, Check, Award, Tag, BookOpen, Users, Loader2 } from 'lucide-react';
import { UserProfile, Community } from '../../community/types';
import { getUserProfile, saveUserProfile } from '../../community/services/postService';
import { saveCurrentUser, AVATAR_COLORS } from '../../community/services/authService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  currentUser: UserProfile;
  communities: Community[];
  onCurrentUserUpdated: (profile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  currentUser,
  communities,
  onCurrentUserUpdated,
}) => {
  const isSelf = targetUserId === currentUser.uid;
  const [profile, setProfile] = useState<UserProfile>(isSelf ? currentUser : currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [skillsInput, setSkillsInput] = useState((profile.skills || []).join(', '));
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor || '#10b981');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (isSelf) {
      setProfile(currentUser);
      setDisplayName(currentUser.displayName || '');
      setBio(currentUser.bio || '');
      setSkillsInput((currentUser.skills || []).join(', '));
      setAvatarColor(currentUser.avatarColor || '#10b981');
    } else {
      setLoading(true);
      getUserProfile(targetUserId)
        .then((fetched) => {
          if (fetched) {
            setProfile(fetched);
          } else {
            setProfile({
              uid: targetUserId,
              username: `member_${targetUserId.slice(-4)}`,
              displayName: `Community Member`,
              bio: 'Active builder in FROGÉ Network.',
              skills: ['FROGÉ AI'],
              joinedCommunities: [],
              avatarColor: '#10b981',
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, targetUserId, currentUser, isSelf]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelf) return;

    setSaving(true);
    setMessage(null);

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: UserProfile = {
      ...currentUser,
      displayName: displayName.trim() || currentUser.username,
      bio: bio.trim(),
      skills: parsedSkills,
      avatarColor,
    };

    try {
      await saveUserProfile(updated);
      saveCurrentUser(updated);
      onCurrentUserUpdated(updated);
      setProfile(updated);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setMessage('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const joinedList = communities.filter((c) =>
    (profile.joinedCommunities || []).includes(c.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-sm sm:text-base text-zinc-900">
              {isSelf ? 'Your Community Profile' : `@${profile.username}'s Profile`}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Loading user profile...</span>
          </div>
        ) : (
          <div className="p-5 space-y-4 text-xs">
            {message && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {message}
              </div>
            )}

            {/* Profile Avatar Card */}
            <div className="flex items-center justify-between bg-zinc-50 border border-zinc-100 rounded-xl p-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 rounded-full text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0 ring-4 ring-white"
                  style={{ backgroundColor: isEditing ? avatarColor : profile.avatarColor || '#10b981' }}
                >
                  {(profile.displayName || profile.username || 'F')[0].toUpperCase()}
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900">
                    {profile.displayName || profile.username}
                  </h3>
                  <p className="text-zinc-500 font-mono text-[11px]">
                    @{profile.username}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                    FROGÉ Community Member
                  </span>
                </div>
              </div>

              {isSelf && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {/* Edit Mode vs View Mode */}
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Bio & Background
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community what you are researching, coding, or building..."
                    className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Skills & Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. FROGÉ Brain, Deep Thinking, Python, Multi-Agent"
                    className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Avatar Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    {AVATAR_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setAvatarColor(col)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          avatarColor === col ? 'ring-2 ring-zinc-900 ring-offset-2 scale-110' : ''
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3.5">
                {/* Bio */}
                <div>
                  <h4 className="font-bold text-zinc-800 text-[11px] uppercase tracking-wider mb-1">
                    About
                  </h4>
                  <p className="text-zinc-700 leading-relaxed bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-100">
                    {profile.bio || 'No bio provided yet.'}
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-bold text-zinc-800 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-600" />
                    <span>Skills & Specialties</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium text-[11px]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-zinc-400 italic">No skills listed yet.</span>
                    )}
                  </div>
                </div>

                {/* Joined Communities */}
                <div>
                  <h4 className="font-bold text-zinc-800 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3 text-zinc-500" />
                    <span>Joined Communities ({joinedList.length})</span>
                  </h4>
                  {joinedList.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {joinedList.map((comm) => (
                        <div
                          key={comm.id}
                          className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 text-xs font-semibold text-zinc-800 truncate"
                        >
                          c/{comm.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-400 italic">Has not joined any communities yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
