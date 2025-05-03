
import React, { createContext, useContext, useState } from 'react';
import { InstagramPost, TimingAnalysis, ContentAnalysis, EngagementData, HashtagAnalysis, NetworkData, NetworkNode, NetworkLink } from '../types';
import { toast } from 'sonner';

interface DataContextType {
  posts: InstagramPost[];
  isLoading: boolean;
  loadPosts: (jsonData: string) => void;
  clearData: () => void;
  hasData: boolean;
  timingAnalysis: TimingAnalysis | null;
  contentAnalysis: ContentAnalysis | null;
  engagementData: EngagementData[];
  hashtagAnalysis: HashtagAnalysis | null;
  networkData: NetworkData | null;
  exportReport: (filteredData?: EngagementData[]) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timingAnalysis, setTimingAnalysis] = useState<TimingAnalysis | null>(null);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [hashtagAnalysis, setHashtagAnalysis] = useState<HashtagAnalysis | null>(null);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);

  // Load posts from JSON and process data
  const loadPosts = (jsonData: string) => {
    setIsLoading(true);
    
    try {
      const parsedData: InstagramPost[] = JSON.parse(jsonData);
      
      if (!Array.isArray(parsedData)) {
        throw new Error('Data is not an array');
      }
      
      // Store posts
      setPosts(parsedData);
      
      // Process all the analytics data
      processTimingAnalysis(parsedData);
      processContentAnalysis(parsedData);
      processEngagementData(parsedData);
      processHashtagAnalysis(parsedData);
      processNetworkData(parsedData);
      
      toast.success(`Successfully loaded ${parsedData.length} posts`);
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      toast.error('Failed to parse data. Please check your JSON format.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process timing analysis
  const processTimingAnalysis = (posts: InstagramPost[]) => {
    // Initialize data structures
    const hourlyActivity: Record<string, number> = {};
    const dayActivity: Record<string, number> = {};
    
    // Populate with data
    posts.forEach(post => {
      const date = new Date(post.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Count hourly activity
      const hourKey = `${hour}`;
      hourlyActivity[hourKey] = (hourlyActivity[hourKey] || 0) + 1;
      
      // Count daily activity
      dayActivity[dayOfWeek] = (dayActivity[dayOfWeek] || 0) + 1;
      
      // Add comment activity
      post.latestComments.forEach(comment => {
        const commentDate = new Date(comment.timestamp);
        const commentHour = commentDate.getHours();
        const commentDay = commentDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        const commentHourKey = `${commentHour}`;
        hourlyActivity[commentHourKey] = (hourlyActivity[commentHourKey] || 0) + 1;
        
        dayActivity[commentDay] = (dayActivity[commentDay] || 0) + 1;
      });
    });
    
    // Sort days by activity
    const bestDaysToPost = Object.entries(dayActivity)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count);
    
    // Sort hours by activity
    const bestHoursToPost = Object.entries(hourlyActivity)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count);
      
    setTimingAnalysis({
      hourlyActivity,
      bestDaysToPost,
      bestHoursToPost
    });
  };

  // Process content analysis
  const processContentAnalysis = (posts: InstagramPost[]) => {
    const keywords: Record<string, number> = {};
    const keywordsOverTime: Record<string, Record<string, number>> = {};
    const postingFrequency: Record<string, number> = {};
    
    // Extract words from captions
    posts.forEach(post => {
      // Count posts per influencer
      postingFrequency[post.ownerUsername] = (postingFrequency[post.ownerUsername] || 0) + 1;
      
      // Skip if no caption
      if (!post.caption) return;
      
      // Get year-month for time tracking
      const date = new Date(post.timestamp);
      const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      // Process keywords
      const words = post.caption
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3);  // Only count words longer than 3 characters
      
      words.forEach(word => {
        // Global keywords count
        keywords[word] = (keywords[word] || 0) + 1;
        
        // Keywords over time
        if (!keywordsOverTime[yearMonth]) {
          keywordsOverTime[yearMonth] = {};
        }
        keywordsOverTime[yearMonth][word] = (keywordsOverTime[yearMonth][word] || 0) + 1;
      });
    });
    
    // Calculate percentage for each keyword
    const totalKeywordCount = Object.values(keywords).reduce((sum, count) => sum + count, 0);
    const keywordsPercentage: Record<string, number> = {};
    
    Object.entries(keywords).forEach(([word, count]) => {
      keywordsPercentage[word] = (count / totalKeywordCount) * 100;
    });
    
    setContentAnalysis({
      keywords,
      keywordsOverTime,
      keywordsPercentage,
      postingFrequency,
      totalPosts: posts.length
    });
  };

  // Process engagement data
  const processEngagementData = (posts: InstagramPost[]) => {
    const engagement: EngagementData[] = [];
    
    posts.forEach(post => {
      post.latestComments.forEach(comment => {
        engagement.push({
          id: comment.id,
          username: comment.ownerUsername,
          postCaption: post.caption,
          datetime: new Date(comment.timestamp).toLocaleString(),
          influencer: post.ownerUsername,
          commentText: comment.text,
          likesCount: comment.likesCount || 0,
          isInCart: false
        });
      });
    });
    
    // Sort by most recent first
    const sortedEngagement = engagement.sort((a, b) => {
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    });
    
    setEngagementData(sortedEngagement);
  };

  // Process hashtag analysis
  const processHashtagAnalysis = (posts: InstagramPost[]) => {
    const hashtags: Record<string, number> = {};
    const hashtagsOverTime: Record<string, Record<string, number>> = {};
    
    posts.forEach(post => {
      // Skip if no hashtags
      if (!post.hashtags || post.hashtags.length === 0) return;
      
      // Get year-month for time tracking
      const date = new Date(post.timestamp);
      const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      // Process hashtags
      post.hashtags.forEach(tag => {
        // Global hashtag count
        hashtags[tag] = (hashtags[tag] || 0) + 1;
        
        // Hashtags over time
        if (!hashtagsOverTime[yearMonth]) {
          hashtagsOverTime[yearMonth] = {};
        }
        hashtagsOverTime[yearMonth][tag] = (hashtagsOverTime[yearMonth][tag] || 0) + 1;
      });
    });
    
    // Calculate percentage for each hashtag
    const totalHashtagCount = Object.values(hashtags).reduce((sum, count) => sum + count, 0);
    const hashtagsPercentage: Record<string, number> = {};
    
    Object.entries(hashtags).forEach(([tag, count]) => {
      hashtagsPercentage[tag] = (count / totalHashtagCount) * 100;
    });
    
    setHashtagAnalysis({
      hashtags,
      hashtagsOverTime,
      hashtagsPercentage
    });
  };

  // Process network data
  const processNetworkData = (posts: InstagramPost[]) => {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];
    
    // Map to track unique nodes
    const nodeMap = new Map<string, boolean>();
    
    posts.forEach(post => {
      // Add influencer node if doesn't exist
      const influencerId = `influencer-${post.ownerUsername}`;
      if (!nodeMap.has(influencerId)) {
        nodes.push({
          id: influencerId,
          label: post.ownerUsername,
          type: 'influencer'
        });
        nodeMap.set(influencerId, true);
      }
      
      // Add post node
      const postId = `post-${post.id}`;
      nodes.push({
        id: postId,
        label: post.shortCode,
        type: 'post'
      });
      
      // Link influencer to post
      links.push({
        source: influencerId,
        target: postId,
        value: 1
      });
      
      // Process comments
      post.latestComments.forEach(comment => {
        // Add commenter node if doesn't exist
        const commenterId = `commenter-${comment.ownerUsername}`;
        if (!nodeMap.has(commenterId)) {
          nodes.push({
            id: commenterId,
            label: comment.ownerUsername,
            type: 'commenter'
          });
          nodeMap.set(commenterId, true);
        }
        
        // Link commenter to post
        links.push({
          source: commenterId,
          target: postId,
          value: 1
        });
      });
    });
    
    setNetworkData({ nodes, links });
  };

  const exportReport = (filteredData?: EngagementData[]) => {
    const dataToExport = {
      timing: timingAnalysis,
      content: contentAnalysis,
      engagement: filteredData || engagementData,
      hashtags: hashtagAnalysis,
      network: networkData,
      exportedAt: new Date().toISOString()
    };
    
    // Create a JSON blob and trigger download
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };

  const clearData = () => {
    setPosts([]);
    setTimingAnalysis(null);
    setContentAnalysis(null);
    setEngagementData([]);
    setHashtagAnalysis(null);
    setNetworkData(null);
    toast.info('All data cleared');
  };

  return (
    <DataContext.Provider
      value={{
        posts,
        isLoading,
        loadPosts,
        clearData,
        hasData: posts.length > 0,
        timingAnalysis,
        contentAnalysis,
        engagementData,
        hashtagAnalysis,
        networkData,
        exportReport
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
