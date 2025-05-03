
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ContentAnalysis = () => {
  const { contentAnalysis, hasData, isLoading } = useData();
  
  const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C', '#D6BCFA', '#8B5CF6', '#33C3F0', '#1EAEDB'];
  
  // Format keyword data for chart
  const keywordData = contentAnalysis
    ? Object.entries(contentAnalysis.keywords)
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
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Card className="dashboard-card">
            <h2 className="card-title">Top Keywords</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Most frequently used words across all captions
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
        
        <Card className="dashboard-card">
          <h2 className="card-title">Keyword Distribution</h2>
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
        
        <Card className="dashboard-card">
          <h2 className="card-title">Posting Frequency</h2>
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
        
        <Card className="dashboard-card">
          <h2 className="card-title">Keyword Cloud</h2>
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
