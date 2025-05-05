
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PostsTable from '@/components/PostsTable';
import ChartWithTable from '@/components/ChartWithTable';
import DataTable from '@/components/DataTable';
import { ScrollArea } from '@/components/ui/scroll-area';
import ExportButton from '@/components/ExportButton';
import { InstagramPost } from '@/types';

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
  const [keywordBarsData, setKeywordBarsData] = useState<InstagramPost[]>([]);
  const [keywordPieData, setKeywordPieData] = useState<InstagramPost[]>([]);
  const [frequencyData, setFrequencyData] = useState<InstagramPost[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  
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
  
  // Handle keyword bar click
  const handleKeywordBarsClick = (data: any) => {
    const keyword = data.keyword;
    
    // Filter posts by the selected keyword
    if (!posts) return;
    
    const filtered = posts.filter(post => 
      post.caption?.toLowerCase().includes(keyword.toLowerCase())
    );
    
    setKeywordBarsData(filtered);
    console.log(`Keyword bars clicked: ${keyword}, found ${filtered.length} posts`);
  };
  
  // Handle pie segment click
  const handleKeywordPieClick = (data: any, index: number) => {
    const keyword = keywordData[index]?.keyword;
    if (!keyword || !posts) return;
    
    const filtered = posts.filter(post => 
      post.caption?.toLowerCase().includes(keyword.toLowerCase())
    );
    
    setKeywordPieData(filtered);
    console.log(`Keyword pie clicked: ${keyword}, found ${filtered.length} posts`);
  };
  
  // Handle frequency chart click
  const handleFrequencyClick = (data: any) => {
    const username = data.username;
    if (!username || !posts) return;
    
    const filtered = posts.filter(post => 
      post.ownerUsername === username
    );
    
    setFrequencyData(filtered);
    console.log(`Frequency clicked: ${username}, found ${filtered.length} posts`);
  };
  
  // Handle keyword cloud click
  const handleKeywordCloudClick = (keyword: string) => {
    if (selectedKeyword === keyword) {
      setSelectedKeyword(null);
    } else {
      setSelectedKeyword(keyword);
    }
  };
  
  // Find posts containing a selected keyword from the cloud
  useEffect(() => {
    if (!selectedKeyword || !posts) {
      return;
    }
  }, [selectedKeyword, posts]);
  
  // Define table columns for keywords
  const keywordPostColumns = [
    {
      key: 'ownerUsername',
      header: 'Username',
      cell: (post: InstagramPost) => `@${post.ownerUsername}`,
      isSortable: true
    },
    {
      key: 'caption',
      header: 'Caption',
      cell: (post: InstagramPost) => {
        const caption = post.caption || "(No caption)";
        const keyword = selectedKeyword || "";
        
        if (keyword && caption.toLowerCase().includes(keyword.toLowerCase())) {
          // Highlight the keyword in the caption
          const parts = caption.split(new RegExp(`(${keyword})`, 'gi'));
          return (
            <div>
              {parts.map((part, i) => 
                part.toLowerCase() === keyword.toLowerCase() 
                  ? <span key={i} className="bg-yellow-200 font-medium">{part}</span> 
                  : part
              )}
            </div>
          );
        }
        return caption;
      },
      isSortable: false
    },
    {
      key: 'likesCount',
      header: 'Likes',
      cell: (post: InstagramPost) => post.likesCount,
      isSortable: true
    },
    {
      key: 'commentsCount',
      header: 'Comments',
      cell: (post: InstagramPost) => post.commentsCount,
      isSortable: true
    },
    {
      key: 'timestamp',
      header: 'Date',
      cell: (post: InstagramPost) => new Date(post.timestamp).toLocaleDateString(),
      isSortable: true
    }
  ];
  
  // Columns for frequency table
  const frequencyColumns = [
    {
      key: 'ownerUsername',
      header: 'Username',
      cell: (post: InstagramPost) => `@${post.ownerUsername}`,
      isSortable: true
    },
    {
      key: 'caption',
      header: 'Caption',
      cell: (post: InstagramPost) => post.caption || "(No caption)",
      isSortable: false
    },
    {
      key: 'likesCount',
      header: 'Likes',
      cell: (post: InstagramPost) => post.likesCount,
      isSortable: true
    },
    {
      key: 'commentsCount',
      header: 'Comments',
      cell: (post: InstagramPost) => post.commentsCount,
      isSortable: true
    }
  ];
  
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
      {/* Main Posts Table - Always visible at the top */}
      <Card className="dashboard-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Posts</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Browse all posts with details and add to cart
        </p>
        <PostsTable posts={posts} />
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Keywords Chart with its own table */}
        <div className="md:col-span-2">
          <ChartWithTable
            title="Top Keywords"
            subtitle="Most frequently used words across all captions (common words filtered out)"
            dataType="posts"
            initialData={posts}
            filteredData={keywordBarsData}
            tableColumns={keywordPostColumns}
            exportFilename="top-keywords-posts.json"
            chartComponent={
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={keywordData} layout="vertical" onClick={(data) => console.log('Bar chart clicked', data)}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="keyword" width={100} />
                    <Tooltip 
                      formatter={(value: any) => [`${value} occurrences`, 'Frequency']}
                      labelFormatter={(keyword) => `Keyword: ${keyword}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#9b87f5" 
                      name="Occurrences" 
                      radius={[0, 4, 4, 0]} 
                      cursor="pointer"
                      onClick={handleKeywordBarsClick}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
            onChartClick={handleKeywordBarsClick}
            showDataOnLoad={false}
          />
        </div>
        
        {/* Keyword Distribution Chart with its own table */}
        <ChartWithTable
          title="Keyword Distribution"
          subtitle="Percentage breakdown of most common keywords"
          dataType="posts"
          initialData={posts}
          filteredData={keywordPieData}
          tableColumns={keywordPostColumns}
          exportFilename="keyword-distribution-posts.json"
          chartComponent={
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart onClick={(data) => console.log('Pie chart container clicked', data)}>
                  <Pie
                    data={keywordData.slice(0, 8)} // Top 8 keywords for pie chart
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="keyword"
                    label={({ keyword, percent }) => `${keyword}: ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                    onClick={handleKeywordPieClick}
                    cursor="pointer"
                  >
                    {keywordData.slice(0, 8).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke={keywordPieData.length > 0 && keywordData[index]?.keyword === keywordPieData[0]?.caption?.match(/\b\w+\b/g)?.find(word => word.toLowerCase() === keywordData[index]?.keyword.toLowerCase()) ? '#000' : undefined}
                        strokeWidth={keywordPieData.length > 0 && keywordData[index]?.keyword === keywordPieData[0]?.caption?.match(/\b\w+\b/g)?.find(word => word.toLowerCase() === keywordData[index]?.keyword.toLowerCase()) ? 2 : undefined}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} occurrences`, 'Count']}
                    labelFormatter={(index: any) => keywordData[index]?.keyword || ''}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          }
          onChartClick={handleKeywordPieClick}
          showDataOnLoad={false}
        />
        
        {/* Posting Frequency Chart with its own table */}
        <ChartWithTable
          title="Posting Frequency"
          subtitle="Number of posts per influencer"
          dataType="posts"
          initialData={posts}
          filteredData={frequencyData}
          tableColumns={frequencyColumns}
          exportFilename="posting-frequency-data.json"
          chartComponent={
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={postingFrequencyData} onClick={(data) => console.log('Frequency chart clicked', data)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="username" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value} posts`, 'Count']}
                    labelFormatter={(username) => `@${username}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#7E69AB" 
                    name="Posts" 
                    radius={[4, 4, 0, 0]}
                    onClick={handleFrequencyClick}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
          onChartClick={handleFrequencyClick}
          showDataOnLoad={false}
        />
        
        {/* Keyword Cloud Card with integrated table */}
        <Card className="dashboard-card p-6">
          <h2 className="text-xl font-bold mb-2">Keyword Cloud</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Visual representation of keyword frequency
          </p>
          <div className="flex flex-wrap gap-2 justify-center p-4">
            {keywordData.map((item, index) => {
              const isSelected = selectedKeyword === item.keyword;
              return (
                <span
                  key={item.keyword}
                  className="inline-block px-3 py-1 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? 
                      `${COLORS[index % COLORS.length]}40` : 
                      `${COLORS[index % COLORS.length]}20`,
                    color: COLORS[index % COLORS.length],
                    fontSize: `${Math.max(0.8, Math.min(2, (item.count / keywordData[0].count) * 2))}rem`,
                    border: isSelected ? '1px solid' : 'none'
                  }}
                  onClick={() => handleKeywordCloudClick(item.keyword)}
                >
                  {item.keyword}
                </span>
              );
            })}
          </div>
          
          {/* Table for selected keyword in cloud */}
          {selectedKeyword && (
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Posts containing "{selectedKeyword}"</h3>
                <ExportButton
                  variant="outline"
                  size="sm"
                  filteredData={posts.filter(post => 
                    post.caption?.toLowerCase().includes(selectedKeyword.toLowerCase())
                  )}
                  dataType="posts"
                  filename={`keyword-cloud-${selectedKeyword}-posts.json`}
                />
              </div>
              <ScrollArea className="h-[400px]">
                <DataTable
                  data={posts.filter(post => 
                    post.caption?.toLowerCase().includes(selectedKeyword.toLowerCase())
                  )}
                  columns={keywordPostColumns}
                  dataType="posts"
                  showExport={false}
                  allowAddToCart={true}
                />
              </ScrollArea>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ContentAnalysis;
