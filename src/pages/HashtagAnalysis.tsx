
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import ExportButton from '@/components/ExportButton';

const HashtagAnalysis = () => {
  const { hashtagAnalysis, posts, hasData, isLoading } = useData();
  
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  
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
  const handleHashtagClick = (data: any) => {
    setSelectedHashtag(selectedHashtag === data.hashtag ? null : data.hashtag);
  };
  
  // Handle pie segment click in distribution chart
  const handlePieClick = (data: any, index: number) => {
    const hashtag = hashtagData[index]?.hashtag;
    if (hashtag) {
      setSelectedHashtag(selectedHashtag === hashtag ? null : hashtag);
    }
  };
  
  // Reset selections
  const handleResetFilters = () => {
    setSelectedHashtag(null);
  };
  
  // Check if we have hashtag data to display
  const hasHashtagData = hashtagData.length > 0;
  
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
  
  if (!hasHashtagData) {
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
              <ExportButton 
                variant="outline" 
                size="sm" 
                filteredData={filteredPosts}
                dataType="posts"
                filename={`posts-hashtag-${selectedHashtag}.json`}
              />
            </div>
          </div>
          {filteredPosts.length > 0 ? (
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Caption</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>{new Date(post.timestamp).toLocaleString()}</TableCell>
                      <TableCell>@{post.ownerUsername}</TableCell>
                      <TableCell className="max-w-[250px] truncate">
                        {post.caption || "(No caption)"}
                      </TableCell>
                      <TableCell>{post.likesCount}</TableCell>
                      <TableCell>{post.commentsCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
          <Card className="dashboard-card">
            <div className="p-4 pb-0 flex justify-between items-center">
              <div>
                <h2 className="card-title">Top Hashtags</h2>
                <p className="text-sm text-muted-foreground">
                  Most frequently used hashtags across all posts.
                  <span className="font-medium ml-1">Click on a bar to see posts with that hashtag.</span>
                </p>
              </div>
              <ExportButton 
                variant="outline" 
                size="sm" 
                filteredData={hashtagData}
                dataType="hashtags"
                filename="hashtag-analysis-data.json"
              />
            </div>
            <div className="h-[300px] p-4">
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
                    onClick={handleHashtagClick}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <Card className="dashboard-card">
          <div className="p-4 pb-0 flex justify-between items-center">
            <div>
              <h2 className="card-title">Hashtag Distribution</h2>
              <p className="text-sm text-muted-foreground">
                Percentage breakdown of most common hashtags.
                <span className="font-medium ml-1">Click on a segment to see posts with that hashtag.</span>
              </p>
            </div>
          </div>
          <div className="h-[300px] p-4">
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
        </Card>
        
        <Card className="dashboard-card">
          <div className="p-4 pb-0 flex justify-between items-center">
            <h2 className="card-title">Hashtag Cloud</h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Visual representation of hashtag frequency. Click on any hashtag to see related posts.
            </p>
            <div className="flex flex-wrap gap-2 justify-center p-4">
              {hashtagData.slice(0, 30).map((item) => (
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
                  onClick={() => setSelectedHashtag(selectedHashtag === item.hashtag ? null : item.hashtag)}
                >
                  #{item.hashtag}
                </span>
              ))}
            </div>
          </div>
        </Card>
        
        <Card className="dashboard-card">
          <div className="p-4 pb-0 flex justify-between items-center">
            <h2 className="card-title">Top Hashtag Stats</h2>
            <ExportButton 
              variant="outline" 
              size="sm" 
              filteredData={hashtagData.slice(0, 15)}
              dataType="hashtags"
              filename="top-hashtags-stats.json"
            />
          </div>
          <div className="p-4">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hashtag</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hashtagData.slice(0, 10).map((item) => (
                    <TableRow 
                      key={item.hashtag} 
                      className={`cursor-pointer ${selectedHashtag === item.hashtag ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedHashtag(selectedHashtag === item.hashtag ? null : item.hashtag)}
                    >
                      <TableCell>#{item.hashtag}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                      <TableCell className="text-right">
                        {hashtagAnalysis?.hashtagsPercentage[item.hashtag].toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {selectedHashtag === item.hashtag ? 'Selected' : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HashtagAnalysis;
