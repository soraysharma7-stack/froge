import { UserProfile } from '../types';
import { db, auth } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const USER_STORAGE_KEY = 'froge_community_user';

export const AVATAR_COLORS = [
  '#10b981', // emerald
  '#059669', // dark emerald
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#06b6d4', // cyan
];

export const getDefaultUserProfile = (): UserProfile => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  return {
    uid: `user_${Date.now()}_${randomSuffix}`,
    username: `frog_dev_${randomSuffix}`,
    displayName: `FROGÉ Builder #${randomSuffix}`,
    bio: 'Exploring and building with FROGÉ AI.',
    skills: ['FROGÉ AI', 'TypeScript', 'Prompt Engineering'],
    joinedCommunities: [],
    avatarColor: randomColor,
    createdAt: new Date().toISOString(),
  };
};

export const getCurrentUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load user profile from localStorage:', e);
  }
  const defaultUser = getDefaultUserProfile();
  saveCurrentUser(defaultUser);
  return defaultUser;
};

export const saveCurrentUser = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save user profile to localStorage:', e);
  }

  // Also sync to Firestore asynchronously
  syncProfileToFirestore(profile);
};

export const syncProfileToFirestore = async (profile: UserProfile): Promise<void> => {
  try {
    if (!profile.uid) return;
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(
      userRef,
      {
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio || '',
        skills: profile.skills || [],
        joinedCommunities: profile.joinedCommunities || [],
        avatarColor: profile.avatarColor || '#10b981',
        createdAt: profile.createdAt || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    // Non-blocking sync error
    console.debug('Firestore user sync notice:', error);
  }
};
