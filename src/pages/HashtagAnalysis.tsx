
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const HashtagAnalysis = () => {
  const { hashtagAnalysis, hasData, isLoading } = useData();
  
  const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C', '#D6BCFA', '#8B5CF6', '#33C3F0', '#1EAEDB'];
  
  // Format hashtag data for chart
  const hashtagData = hashtagAnalysis
    ? Object.entries(hashtagAnalysis.hashtags)
        .map(([hashtag, count]) => ({ hashtag, count }))
        .sort((a, b) => b.count - a.count)
    : [];
  
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
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Card className="dashboard-card">
            <h2 className="card-title">Top Hashtags</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Most frequently used hashtags across all posts
            </p>
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
                  <Bar dataKey="count" fill="#9b87f5" name="Occurrences" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <Card className="dashboard-card">
          <h2 className="card-title">Hashtag Distribution</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Percentage breakdown of most common hashtags
          </p>
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
                >
                  {hashtagData.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          <h2 className="card-title">Hashtag Cloud</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Visual representation of hashtag frequency
          </p>
          <div className="flex flex-wrap gap-2 justify-center p-4">
            {hashtagData.slice(0, 30).map((item, index) => (
              <span
                key={item.hashtag}
                className="inline-block px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${COLORS[index % COLORS.length]}20`,
                  color: COLORS[index % COLORS.length],
                  fontSize: `${Math.max(0.8, Math.min(2, (item.count / hashtagData[0].count) * 2))}rem`
                }}
              >
                #{item.hashtag}
              </span>
            ))}
          </div>
        </Card>
        
        <Card className="dashboard-card">
          <h2 className="card-title">Top Hashtag Stats</h2>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Hashtag</th>
                  <th className="py-2 text-right font-medium">Count</th>
                  <th className="py-2 text-right font-medium">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {hashtagData.slice(0, 10).map((item) => (
                  <tr key={item.hashtag} className="border-b last:border-0">
                    <td className="py-2 text-left">#{item.hashtag}</td>
                    <td className="py-2 text-right">{item.count}</td>
                    <td className="py-2 text-right">
                      {hashtagAnalysis?.hashtagsPercentage[item.hashtag].toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HashtagAnalysis;
