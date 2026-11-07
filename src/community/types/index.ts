export type PostCategory = 'discussion' | 'question' | 'project';

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  bio: string;
  skills: string[];
  joinedCommunities?: string[];
  avatarColor?: string;
  createdAt?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  memberCount: number;
  members?: string[];
  createdAt: string;
}

export interface Post {
  id: string;
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
  likes?: string[]; // user IDs who liked
  likesCount?: number;
  savedBy?: string[]; // user IDs who saved/bookmarked
  commentsCount?: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  parentCommentId?: string;
}

