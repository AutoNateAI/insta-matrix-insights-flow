
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PostsTable from '@/components/PostsTable';

// Common words to filter out from keyword analysis
const COMMON_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when',
  'up', 'at', 'from', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
  'from', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  's', 't', 'can', 'will', 'just', 'don', 'don\'t', 'should', 'now', 'i',
  'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
  'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she',
  'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'that\'ll', 'am', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did',
  'doing', 'would', 'should', 'could', 'ought', 'i\'m', 'you\'re', 'he\'s',
  'she\'s', 'it\'s', 'we\'re', 'they\'re', 'i\'ve', 'you\'ve', 'we\'ve',
  'they\'ve', 'i\'d', 'you\'d', 'he\'d', 'she\'d', 'we\'d', 'they\'d',
  'i\'ll', 'you\'ll', 'he\'ll', 'she\'ll', 'we\'ll', 'they\'ll', 'isn\'t',
  'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t', 'haven\'t', 'hadn\'t',
  'doesn\'t', 'don\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'shan\'t',
  'shouldn\'t', 'can\'t', 'cannot', 'couldn\'t', 'mustn\'t', 'let\'s',
  'that\'s', 'who\'s', 'what\'s', 'here\'s', 'there\'s', 'when\'s',
  'where\'s', 'why\'s', 'how\'s', 'like', 'post', 'comment', 'photo',
  'instagram', 'follow', 'follower', 'following'
]);

const ContentAnalysis = () => {
  const { contentAnalysis, hasData, isLoading, posts } = useData();
  
  const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C', '#D6BCFA', '#8B5CF6', '#33C3F0', '#1EAEDB'];
  
  // Filter and format keyword data for chart
  const keywordData = contentAnalysis
    ? Object.entries(contentAnalysis.keywords)
        .filter(([keyword]) => !COMMON_WORDS.has(keyword.toLowerCase()))
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15) // Top 15 keywords
    : [];
  
  // Format posting frequency data
  const postingFrequencyData = contentAnalysis
    ? Object.entries(contentAnalysis.postingFrequency)
        .map(([username, count]) => ({ username, count }))
        .sort((a, b) => b.count - a.count)
    : [];
  
  if (!hasData) {
    return (
      <DashboardLayout title="Content Analysis">
        <div className="text-center space-y-4 max-w-lg mx-auto py-12">
          <h2 className="text-2xl font-bold">No Data Available</h2>
          <p className="text-muted-foreground">
            Please upload your Instagram data first to view content analysis.
          </p>
          <Button asChild className="bg-instagram-primary hover:bg-instagram-primary/90">
            <Link to="/upload">Upload Data</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  if (isLoading) {
    return (
      <DashboardLayout title="Content Analysis">
        <div className="text-center py-12">
          <Loader className="animate-spin h-8 w-8 mx-auto text-primary" />
          <p className="mt-4">Processing data...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Content Analysis">
      {/* Posts Table - Moved to top */}
      <Card className="dashboard-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Posts</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Browse all posts with details and add to cart
        </p>
        <PostsTable posts={posts} />
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Card className="dashboard-card p-6">
            <h2 className="text-xl font-bold mb-2">Top Keywords</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Most frequently used words across all captions (common words filtered out)
            </p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={keywordData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="keyword" width={100} />
                  <Tooltip 
                    formatter={(value: any) => [`${value} occurrences`, 'Frequency']}
                    labelFormatter={(keyword) => `Keyword: ${keyword}`}
                  />
                  <Bar dataKey="count" fill="#9b87f5" name="Occurrences" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <Card className="dashboard-card p-6">
          <h2 className="text-xl font-bold mb-2">Keyword Distribution</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Percentage breakdown of most common keywords
          </p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={keywordData.slice(0, 8)} // Top 8 keywords for pie chart
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="keyword"
                  label={({ keyword, percent }) => `${keyword}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {keywordData.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} occurrences`, 'Count']}
                  labelFormatter={(index: any) => keywordData[index]?.keyword || ''}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="dashboard-card p-6">
          <h2 className="text-xl font-bold mb-2">Posting Frequency</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Number of posts per influencer
          </p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={postingFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="username" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${value} posts`, 'Count']}
                  labelFormatter={(username) => `@${username}`}
                />
                <Bar dataKey="count" fill="#7E69AB" name="Posts" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="dashboard-card p-6">
          <h2 className="text-xl font-bold mb-2">Keyword Cloud</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Visual representation of keyword frequency
          </p>
          <div className="flex flex-wrap gap-2 justify-center p-4">
            {keywordData.map((item, index) => (
              <span
                key={item.keyword}
                className="inline-block px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${COLORS[index % COLORS.length]}20`,
                  color: COLORS[index % COLORS.length],
                  fontSize: `${Math.max(0.8, Math.min(2, (item.count / keywordData[0].count) * 2))}rem`
                }}
              >
                {item.keyword}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ContentAnalysis;
