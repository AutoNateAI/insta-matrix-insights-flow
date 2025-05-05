
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ChartWithTable from '@/components/ChartWithTable';
import { InstagramPost } from '@/types';

const HashtagAnalysis = () => {
  const { hashtagAnalysis, posts, hasData, isLoading } = useData();
  
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [barFilteredData, setBarFilteredData] = useState<any[]>([]);
  const [pieFilteredData, setPieFilteredData] = useState<any[]>([]);
  const [cloudFilteredData, setCloudFilteredData] = useState<any[]>([]);
  const [statsFilteredData, setStatsFilteredData] = useState<any[]>([]);
  
  const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C', '#D6BCFA', '#8B5CF6', '#33C3F0', '#1EAEDB'];
  
  // Format hashtag data for chart
  const hashtagData = hashtagAnalysis
    ? Object.entries(hashtagAnalysis.hashtags)
        .map(([hashtag, count]) => ({ hashtag, count }))
        .sort((a, b) => b.count - a.count)
    : [];
  
  // Filter posts based on selected hashtag
  useEffect(() => {
    if (!posts || !selectedHashtag) {
      setFilteredPosts([]);
      return;
    }

    const filtered = posts.filter(post => 
      post.hashtags && post.hashtags.includes(selectedHashtag)
    );
    
    setFilteredPosts(filtered);
  }, [selectedHashtag, posts]);
  
  // Handle bar click in hashtag chart
  const handleHashtagBarClick = (data: any) => {
    const hashtag = data.hashtag;
    if (!hashtag || !posts) return;
    
    if (selectedHashtag === hashtag) {
      setSelectedHashtag(null);
      setBarFilteredData([]);
    } else {
      setSelectedHashtag(hashtag);
      
      const filtered = posts.filter(post => 
        post.hashtags && post.hashtags.includes(hashtag)
      );
      
      setBarFilteredData(filtered);
    }
  };
  
  // Handle pie segment click in distribution chart
  const handlePieClick = (data: any, index: number) => {
    const hashtag = hashtagData[index]?.hashtag;
    if (!hashtag || !posts) return;
    
    if (selectedHashtag === hashtag) {
      setSelectedHashtag(null);
      setPieFilteredData([]);
    } else {
      setSelectedHashtag(hashtag);
      
      const filtered = posts.filter(post => 
        post.hashtags && post.hashtags.includes(hashtag)
      );
      
      setPieFilteredData(filtered);
    }
  };
  
  // Handle cloud click
  const handleCloudClick = (hashtag: string) => {
    if (!hashtag || !posts) return;
    
    if (selectedHashtag === hashtag) {
      setSelectedHashtag(null);
      setCloudFilteredData([]);
    } else {
      setSelectedHashtag(hashtag);
      
      const filtered = posts.filter(post => 
        post.hashtags && post.hashtags.includes(hashtag)
      );
      
      setCloudFilteredData(filtered);
    }
  };
  
  // Handle stats table click
  const handleStatsClick = (hashtag: string) => {
    if (!hashtag || !posts) return;
    
    if (selectedHashtag === hashtag) {
      setSelectedHashtag(null);
      setStatsFilteredData([]);
    } else {
      setSelectedHashtag(hashtag);
      
      const filtered = posts.filter(post => 
        post.hashtags && post.hashtags.includes(hashtag)
      );
      
      setStatsFilteredData(filtered);
    }
  };
  
  // Reset selections
  const handleResetFilters = () => {
    setSelectedHashtag(null);
    setBarFilteredData([]);
    setPieFilteredData([]);
    setCloudFilteredData([]);
    setStatsFilteredData([]);
  };

  // Define table columns for hashtag posts
  const hashtagPostColumns = [
    {
      key: 'timestamp',
      header: 'Date',
      cell: (post: InstagramPost) => new Date(post.timestamp).toLocaleString(),
      isSortable: true
    },
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
        if (selectedHashtag && caption.includes(`#${selectedHashtag}`)) {
          const parts = caption.split(new RegExp(`(#${selectedHashtag})`, 'g'));
          return (
            <div>
              {parts.map((part, i) => 
                part === `#${selectedHashtag}`
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
    }
  ];
  
  if (!hasData) {
    return (
      <DashboardLayout title="Hashtag Analysis">
        <div className="text-center space-y-4 max-w-lg mx-auto py-12">
          <h2 className="text-2xl font-bold">No Data Available</h2>
          <p className="text-muted-foreground">
            Please upload your Instagram data first to view hashtag analysis.
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
      <DashboardLayout title="Hashtag Analysis">
        <div className="text-center py-12">
          <Loader className="animate-spin h-8 w-8 mx-auto text-primary" />
          <p className="mt-4">Processing data...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!hashtagData.length) {
    return (
      <DashboardLayout title="Hashtag Analysis">
        <Card className="dashboard-card text-center py-8">
          <h2 className="text-xl font-medium mb-4">No Hashtags Found</h2>
          <p className="text-muted-foreground">
            The uploaded data doesn't contain any hashtags to analyze.
          </p>
        </Card>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Hashtag Analysis">
      {/* Filtered Results Table */}
      {selectedHashtag && (
        <Card className="dashboard-card mb-6">
          <div className="p-4 pb-0 flex justify-between items-center">
            <h2 className="card-title">
              Posts with #{selectedHashtag}
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetFilters}
              >
                <Filter className="h-4 w-4 mr-1" />
                Clear Filter
              </Button>
            </div>
          </div>
          {filteredPosts.length > 0 ? (
            <div className="p-4">
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Timestamp</th>
                      <th className="text-left p-2">Username</th>
                      <th className="text-left p-2">Caption</th>
                      <th className="text-left p-2">Likes</th>
                      <th className="text-left p-2">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="border-b">
                        <td className="p-2">{new Date(post.timestamp).toLocaleString()}</td>
                        <td className="p-2">@{post.ownerUsername}</td>
                        <td className="p-2 max-w-[250px] truncate">
                          {post.caption || "(No caption)"}
                        </td>
                        <td className="p-2">{post.likesCount}</td>
                        <td className="p-2">{post.commentsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No posts found with the selected hashtag.
            </div>
          )}
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <ChartWithTable
            title="Top Hashtags"
            subtitle="Most frequently used hashtags across all posts. Click on a bar to see posts with that hashtag."
            dataType="posts"
            initialData={posts}
            filteredData={barFilteredData}
            tableColumns={hashtagPostColumns}
            exportFilename="top-hashtags-posts.json"
            chartComponent={
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hashtagData.slice(0, 15)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="hashtag" width={100} />
                    <Tooltip 
                      formatter={(value: any) => [`${value} occurrences`, 'Frequency']}
                      labelFormatter={(hashtag) => `#${hashtag}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#9b87f5" 
                      name="Occurrences" 
                      radius={[0, 4, 4, 0]} 
                      cursor="pointer"
                      onClick={handleHashtagBarClick}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
            onChartClick={handleHashtagBarClick}
          />
        </div>
        
        <ChartWithTable
          title="Hashtag Distribution"
          subtitle="Percentage breakdown of most common hashtags. Click on a segment to see posts with that hashtag."
          dataType="posts"
          initialData={posts}
          filteredData={pieFilteredData}
          tableColumns={hashtagPostColumns}
          exportFilename="hashtag-distribution-posts.json"
          chartComponent={
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hashtagData.slice(0, 8)} // Top 8 hashtags for pie chart
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="hashtag"
                    label={({ hashtag, percent }) => `#${hashtag}: ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                    onClick={handlePieClick}
                    cursor="pointer"
                  >
                    {hashtagData.slice(0, 8).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        stroke={selectedHashtag === entry.hashtag ? '#000' : undefined}
                        strokeWidth={selectedHashtag === entry.hashtag ? 2 : undefined}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} occurrences`, 'Count']}
                    labelFormatter={(index: any) => `#${hashtagData[index]?.hashtag || ''}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          }
          onChartClick={handlePieClick}
        />
        
        <ChartWithTable
          title="Hashtag Cloud"
          subtitle="Visual representation of hashtag frequency. Click on any hashtag to see related posts."
          dataType="posts"
          initialData={posts}
          filteredData={cloudFilteredData}
          tableColumns={hashtagPostColumns}
          exportFilename="hashtag-cloud-posts.json"
          chartComponent={
            <div className="flex flex-wrap gap-2 justify-center p-4">
              {hashtagData.slice(0, 30).map((item, index) => (
                <span
                  key={item.hashtag}
                  className="inline-block px-3 py-1 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: selectedHashtag === item.hashtag 
                      ? `${COLORS[hashtagData.findIndex(d => d.hashtag === item.hashtag) % COLORS.length]}40` 
                      : `${COLORS[hashtagData.findIndex(d => d.hashtag === item.hashtag) % COLORS.length]}20`,
                    color: COLORS[hashtagData.findIndex(d => d.hashtag === item.hashtag) % COLORS.length],
                    fontSize: `${Math.max(0.8, Math.min(2, (item.count / hashtagData[0].count) * 2))}rem`,
                    border: selectedHashtag === item.hashtag ? '1px solid' : 'none'
                  }}
                  onClick={() => handleCloudClick(item.hashtag)}
                >
                  #{item.hashtag}
                </span>
              ))}
            </div>
          }
          onChartClick={(data) => {
            if (data && data.hashtag) {
              handleCloudClick(data.hashtag);
            }
          }}
        />
        
        <ChartWithTable
          title="Top Hashtag Stats"
          subtitle="Statistics for the most frequently used hashtags"
          dataType="hashtags"
          initialData={hashtagData.slice(0, 10)}
          filteredData={statsFilteredData}
          tableColumns={hashtagPostColumns}
          exportFilename="top-hashtags-stats.json"
          chartComponent={
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Hashtag</th>
                    <th className="text-right p-2">Count</th>
                    <th className="text-right p-2">Percentage</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {hashtagData.slice(0, 10).map((item) => (
                    <tr 
                      key={item.hashtag} 
                      className={`cursor-pointer border-b ${selectedHashtag === item.hashtag ? 'bg-muted' : ''}`}
                      onClick={() => handleStatsClick(item.hashtag)}
                    >
                      <td className="p-2">#{item.hashtag}</td>
                      <td className="text-right p-2">{item.count}</td>
                      <td className="text-right p-2">
                        {hashtagAnalysis?.hashtagsPercentage[item.hashtag].toFixed(1)}%
                      </td>
                      <td className="p-2">
                        {selectedHashtag === item.hashtag ? 'Selected' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          onChartClick={(data) => {
            if (data && data.hashtag) {
              handleStatsClick(data.hashtag);
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default HashtagAnalysis;
