
export interface InstagramPost {
  inputUrl: string;
  id: string;
  type: string;
  shortCode: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  url: string;
  commentsCount: number;
  firstComment: string;
  latestComments: InstagramComment[];
  likesCount: number;
  timestamp: string;
  childPosts: any[];
  ownerFullName: string;
  ownerUsername: string;
  ownerId: string;
  isSponsored: boolean;
  taggedUsers: TaggedUser[];
}

export interface InstagramComment {
  id: string;
  text: string;
  ownerUsername: string;
  timestamp: string;
  repliesCount: number;
  replies: InstagramComment[];
  likesCount: number;
  owner: {
    id: string;
    is_verified: boolean;
    username: string;
  };
}

export interface TaggedUser {
  full_name: string;
  id: string;
  is_verified: boolean;
  username: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface TimingAnalysis {
  hourlyActivity: Record<string, number>;
  bestDaysToPost: { day: string; count: number }[];
  bestHoursToPost: { hour: string; count: number }[];
}

export interface ContentAnalysis {
  keywords: Record<string, number>;
  keywordsOverTime: Record<string, Record<string, number>>;
  keywordsPercentage: Record<string, number>;
  postingFrequency: Record<string, number>;
  totalPosts: number;
}

export interface EngagementData {
  username: string;
  postCaption: string;
  datetime: string;
  influencer: string;
  commentText: string;
  likesCount?: number;
  id: string;
  isInCart?: boolean;
}

export interface HashtagAnalysis {
  hashtags: Record<string, number>;
  hashtagsOverTime: Record<string, Record<string, number>>;
  hashtagsPercentage: Record<string, number>;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'influencer' | 'post' | 'commenter';
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface CartItem {
  id: string;
  type: 'post' | 'comment';
  data: InstagramPost | EngagementData;
}

export interface MemeConfig {
  about: string;
  captionStyle: string;
  customization: string;
}

export interface GeneratedMeme {
  id: string;
  imageUrl: string;
  config: MemeConfig;
  timestamp: string;
  sourcePost?: InstagramPost;
  sourceComment?: EngagementData;
}
