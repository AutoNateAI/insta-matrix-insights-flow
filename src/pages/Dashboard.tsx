
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, Link as LinkIcon, MessageSquare, Upload, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InstagramPost } from '@/types';

const Dashboard = () => {
  const { posts, hasData } = useData();
  const [metrics, setMetrics] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    averageCommentsPerPost: 0,
    averageLikesPerPost: 0,
    uniqueInfluencers: 0
  });

  // Calculate metrics whenever posts change
  useEffect(() => {
    if (!posts.length) return;
    
    const totalPosts = posts.length;
    const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);
    const totalLikes = posts.reduce((sum, post) => sum + post.likesCount, 0);
    const averageCommentsPerPost = totalComments / totalPosts;
    const averageLikesPerPost = totalLikes / totalPosts;
    
    // Get unique influencers
    const influencers = new Set(posts.map(post => post.ownerUsername));
    const uniqueInfluencers = influencers.size;
    
    setMetrics({
      totalPosts,
      totalComments,
      totalLikes,
      averageCommentsPerPost,
      averageLikesPerPost,
      uniqueInfluencers
    });
  }, [posts]);

  // Get latest posts (5)
  const latestPosts: InstagramPost[] = hasData 
    ? [...posts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5) 
    : [];

  return (
    <DashboardLayout title="Dashboard Overview">
      {hasData ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/10 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Total Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold">{metrics.totalPosts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {metrics.uniqueInfluencers} unique influencers
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/10 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Total Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold">{metrics.totalComments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {metrics.averageCommentsPerPost.toFixed(1)} per post
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/10 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Total Likes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold">{metrics.totalLikes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {metrics.averageLikesPerPost.toFixed(1)} per post
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link to="/timing">
              <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="bg-primary/10 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Timing Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Discover optimal posting times based on comment activity
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/content">
              <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="bg-primary/10 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Content Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Analyze post keywords and track content trends over time
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/engagement">
              <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="bg-primary/10 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Track top commenters and analyze engagement metrics
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>
                The 5 most recent posts from the dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestPosts.map(post => (
                  <div key={post.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0">
                    <div className="flex justify-between">
                      <div className="font-medium">@{post.ownerUsername}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm">
                      {post.caption || '(No caption)'}
                    </p>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div>{post.commentsCount} comments</div>
                      <div>{post.likesCount} likes</div>
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary">
                        <LinkIcon className="h-3 w-3" /> View post
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center space-y-4 max-w-lg mx-auto py-12">
          <div className="h-24 w-24 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">No Data Available</h2>
          <p className="text-muted-foreground">
            Upload your Instagram data JSON file to start analyzing insights.
          </p>
          <Button asChild className="bg-instagram-primary hover:bg-instagram-primary/90">
            <Link to="/upload">Upload Data</Link>
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
