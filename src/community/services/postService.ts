import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Post, Comment, Community, UserProfile, PostCategory } from '../types';

const POSTS_COLLECTION = 'posts';
const COMMUNITIES_COLLECTION = 'communities';
const USERS_COLLECTION = 'users';

// ==========================================
// 1. POSTS SERVICE
// ==========================================
export const createPost = async (params: {
  authorId: string;
  authorName?: string;
  authorUsername?: string;
  title: string;
  content: string;
  communityId?: string;
  communityName?: string;
  category: PostCategory;
  tags?: string[];
  projectDemoUrl?: string;
  projectRepoUrl?: string;
}): Promise<Post> => {
  const postData = {
    authorId: params.authorId,
    authorName: params.authorName || 'Anonymous',
    authorUsername: params.authorUsername || 'anon',
    title: params.title.trim(),
    content: params.content.trim(),
    communityId: params.communityId || '',
    communityName: params.communityName || '',
    category: params.category || 'discussion',
    tags: params.tags || [],
    projectDemoUrl: params.projectDemoUrl || '',
    projectRepoUrl: params.projectRepoUrl || '',
    likes: [],
    likesCount: 0,
    savedBy: [],
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData);
  return {
    id: docRef.id,
    ...postData,
  };
};

export const getPosts = async (options?: {
  communityId?: string;
  category?: PostCategory | 'all';
  searchQuery?: string;
}): Promise<Post[]> => {
  try {
    let querySnapshot;
    try {
      const q = query(collection(db, POSTS_COLLECTION), orderBy('createdAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch {
      // Fallback without server-side ordering
      querySnapshot = await getDocs(collection(db, POSTS_COLLECTION));
    }

    let posts = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Post[];

    // Ensure sorted newest first
    posts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    if (options?.communityId) {
      posts = posts.filter((p) => p.communityId === options.communityId);
    }

    if (options?.category && options.category !== 'all') {
      posts = posts.filter((p) => p.category === options.category);
    }

    if (options?.searchQuery && options.searchQuery.trim()) {
      const term = options.searchQuery.toLowerCase().trim();
      posts = posts.filter(
        (p) =>
          p.title?.toLowerCase().includes(term) ||
          p.content?.toLowerCase().includes(term) ||
          p.tags?.some((t) => t.toLowerCase().includes(term))
      );
    }

    return posts;
  } catch (error) {
    console.error('Failed to get posts:', error);
    return [];
  }
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const docSnap = await getDoc(doc(db, POSTS_COLLECTION, postId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Post;
  } catch (error) {
    console.error('Failed to get post by id:', error);
    return null;
  }
};

export const toggleLikePost = async (
  postId: string,
  userId: string
): Promise<{ likes: string[]; likesCount: number }> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) throw new Error('Post not found');

  const currentLikes: string[] = snap.data().likes || [];
  let updatedLikes: string[] = [];

  if (currentLikes.includes(userId)) {
    updatedLikes = currentLikes.filter((id) => id !== userId);
  } else {
    updatedLikes = [...currentLikes, userId];
  }

  await updateDoc(postRef, {
    likes: updatedLikes,
    likesCount: updatedLikes.length,
  });

  return { likes: updatedLikes, likesCount: updatedLikes.length };
};

export const toggleSavePost = async (
  postId: string,
  userId: string
): Promise<{ savedBy: string[]; isSaved: boolean }> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) throw new Error('Post not found');

  const currentSaved: string[] = snap.data().savedBy || [];
  let updatedSaved: string[] = [];
  let isSaved = false;

  if (currentSaved.includes(userId)) {
    updatedSaved = currentSaved.filter((id) => id !== userId);
    isSaved = false;
  } else {
    updatedSaved = [...currentSaved, userId];
    isSaved = true;
  }

  await updateDoc(postRef, {
    savedBy: updatedSaved,
  });

  return { savedBy: updatedSaved, isSaved };
};

export const deletePost = async (postId: string): Promise<void> => {
  await deleteDoc(doc(db, POSTS_COLLECTION, postId));
};

// ==========================================
// 2. COMMENTS SERVICE
// ==========================================
export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, POSTS_COLLECTION, postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Comment[];
  } catch (error) {
    console.error('Failed to get comments:', error);
    return [];
  }
};

export const addComment = async (
  postId: string,
  comment: { authorId: string; authorName: string; content: string; parentCommentId?: string }
): Promise<Comment> => {
  const commentsRef = collection(db, POSTS_COLLECTION, postId, 'comments');
  const commentData = {
    postId,
    authorId: comment.authorId,
    authorName: comment.authorName || 'Community Member',
    content: comment.content.trim(),
    parentCommentId: comment.parentCommentId || '',
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(commentsRef, commentData);

  // Update comments count on post
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = postSnap.data().commentsCount || 0;
      await updateDoc(postRef, {
        commentsCount: currentCount + 1,
      });
    }
  } catch {}

  return {
    id: docRef.id,
    ...commentData,
  };
};

// ==========================================
// 3. COMMUNITIES DIRECTORY SERVICE
// ==========================================
export const getCommunities = async (): Promise<Community[]> => {
  try {
    const q = query(collection(db, COMMUNITIES_COLLECTION));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Community[];
  } catch (error) {
    console.error('Failed to get communities:', error);
    return [];
  }
};

export const createCommunity = async (params: {
  id?: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  creatorId: string;
}): Promise<Community> => {
  const commId =
    params.id ||
    params.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') ||
    `comm_${Date.now()}`;

  const commData = {
    name: params.name.trim(),
    description: params.description.trim(),
    category: params.category || 'General',
    icon: params.icon || 'Users',
    memberCount: 1,
    members: [params.creatorId],
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, COMMUNITIES_COLLECTION, commId), commData);
  return {
    id: commId,
    ...commData,
  };
};

export const joinCommunity = async (
  communityId: string,
  userId: string
): Promise<{ members: string[]; memberCount: number; isJoined: boolean }> => {
  const commRef = doc(db, COMMUNITIES_COLLECTION, communityId);
  const snap = await getDoc(commRef);
  if (!snap.exists()) throw new Error('Community not found');

  const members: string[] = snap.data().members || [];
  let updatedMembers: string[] = [];
  let isJoined = false;

  if (members.includes(userId)) {
    updatedMembers = members.filter((id) => id !== userId);
    isJoined = false;
  } else {
    updatedMembers = [...members, userId];
    isJoined = true;
  }

  await updateDoc(commRef, {
    members: updatedMembers,
    memberCount: updatedMembers.length,
  });

  // Also update user's joinedCommunities list
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userJoined: string[] = userSnap.data().joinedCommunities || [];
      const updatedUserJoined = isJoined
        ? Array.from(new Set([...userJoined, communityId]))
        : userJoined.filter((id) => id !== communityId);
      await updateDoc(userRef, { joinedCommunities: updatedUserJoined });
    }
  } catch {}

  return {
    members: updatedMembers,
    memberCount: updatedMembers.length,
    isJoined,
  };
};

// ==========================================
// 4. USER PROFILES SERVICE
// ==========================================
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const snap = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!snap.exists()) return null;
    return { uid: snap.id, ...snap.data() } as UserProfile;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  await setDoc(
    doc(db, USERS_COLLECTION, profile.uid),
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
};

export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, POSTS_COLLECTION, postId, 'comments', commentId));
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = postSnap.data().commentsCount || 0;
      await updateDoc(postRef, {
        commentsCount: Math.max(0, currentCount - 1),
      });
    }
  } catch (error) {
    console.error('Failed to delete comment:', error);
    throw error;
  }
};

// ==========================================
// 5. FROGÉ AI ASSISTANCE FOR COMMUNITY
// Kept strictly separate from community data layer
// ==========================================
export type CommunityAiTask =
  | 'help_write_post'
  | 'summarize_discussion'
  | 'explain_question'
  | 'improve_project_description'
  | 'help_formulate_question';

export const frogeAiCommunityAssist = async (
  task: CommunityAiTask,
  contextText: string,
  extraPrompt?: string
): Promise<string> => {
  try {
    let systemInstruction = '';
    switch (task) {
      case 'help_write_post':
        systemInstruction =
          'You are FROGÉ AI Assistant. Help the developer write an engaging, articulate, well-structured community post. Maintain a helpful and technical tone.';
        break;
      case 'summarize_discussion':
        systemInstruction =
          'You are FROGÉ AI Assistant. Provide a concise, bulleted executive summary of this community discussion highlighting key points, solutions, and consensus.';
        break;
      case 'explain_question':
        systemInstruction =
          'You are FROGÉ AI Assistant. Explain this technical community question clearly, outlining the underlying concepts and potential debugging avenues.';
        break;
      case 'improve_project_description':
        systemInstruction =
          'You are FROGÉ AI Assistant. Elevate this project showcase description with clear architecture highlights, tech stack breakdown, and key features.';
        break;
      case 'help_formulate_question':
        systemInstruction =
          'You are FROGÉ AI Assistant. Help formulate this raw inquiry into a clear, reproducible, well-formatted technical question for the community.';
        break;
    }

    const res = await fetch('/api/brain/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${systemInstruction}\n\nContext:\n${contextText}\n\nAdditional Guidance:\n${extraPrompt || 'Provide an actionable, polished draft.'}`,
        mode: 'simple-chat',
        conversationHistory: [],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return (
        data.response ||
        data.answer ||
        data.content ||
        'FROGÉ AI generated assistance is ready.'
      );
    }
  } catch (err) {
    console.warn('AI assist fallback triggered:', err);
  }

  // Graceful fallback if backend endpoint is unavailable
  if (task === 'help_formulate_question') {
    return `### Context & Problem Statement\n${contextText}\n\n### Expected Behavior\nWhat should happen vs what actually occurred.\n\n### Steps to Reproduce\n1. Initial setup\n2. Trigger condition\n\n### Environment\n- FROGÉ Version / Runtime`;
  }
  if (task === 'improve_project_description') {
    return `## 🚀 Overview\n${contextText}\n\n### ✨ Key Features\n- Modular architecture & high performance\n- Clean developer experience\n\n### 🛠️ Tech Stack\nReact, TypeScript, Tailwind CSS, Firebase`;
  }
  return `### FROGÉ AI Recommendation\n${contextText}\n\n*Tip: Be specific about the outcomes and code snippets to get faster answers from fellow builders.*`;
};


