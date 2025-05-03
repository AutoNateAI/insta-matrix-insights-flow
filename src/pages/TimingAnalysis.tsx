
import { useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TimingAnalysis = () => {
  const { timingAnalysis, hasData, isLoading } = useData();
  
  const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C', '#D6BCFA', '#8B5CF6'];
  
  // Format hourly data for chart
  const hourlyActivityData = timingAnalysis 
    ? Object.entries(timingAnalysis.hourlyActivity).map(([hour, count]) => ({
        hour: `${hour}:00`,
        count
      })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
    : [];
  
  // Format best days data for chart
  const bestDaysData = timingAnalysis?.bestDaysToPost || [];
  
  if (!hasData) {
    return (
      <DashboardLayout title="Timing Analysis">
        <div className="text-center space-y-4 max-w-lg mx-auto py-12">
          <h2 className="text-2xl font-bold">No Data Available</h2>
          <p className="text-muted-foreground">
            Please upload your Instagram data first to view timing analysis.
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
      <DashboardLayout title="Timing Analysis">
        <div className="text-center py-12">
          <Loader className="animate-spin h-8 w-8 mx-auto text-primary" />
          <p className="mt-4">Processing data...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Timing Analysis">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Card className="dashboard-card">
            <h2 className="card-title">24-Hour Activity Pattern</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Comment activity patterns throughout the day (all times in 24-hour format)
            </p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value} interactions`, 'Activity']}
                    labelFormatter={(label) => `Hour: ${label}`}
                  />
                  <Bar dataKey="count" fill="#9b87f5" name="Activity" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <Card className="dashboard-card">
          <h2 className="card-title">Best Days to Post</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Days with the highest engagement levels
          </p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bestDaysData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="day"
                  label={({ day, count, percent }) => `${day}: ${(percent * 100).toFixed(0)}%`}
                >
                  {bestDaysData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} interactions`, 'Count']}
                  labelFormatter={(index: any) => bestDaysData[index].day}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="dashboard-card">
          <h2 className="card-title">Best Hours to Post</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Top hours for maximum engagement (24-hour format)
          </p>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Hour (24h)</th>
                  <th className="py-2 text-right font-medium">Interactions</th>
                  <th className="py-2 text-right font-medium">Ranking</th>
                </tr>
              </thead>
              <tbody>
                {timingAnalysis?.bestHoursToPost.slice(0, 10).map((hour, index) => (
                  <tr key={hour.hour} className="border-b last:border-0">
                    <td className="py-2 text-left">{hour.hour}:00</td>
                    <td className="py-2 text-right">{hour.count.toLocaleString()}</td>
                    <td className="py-2 text-right">
                      <span className={`font-medium ${index < 3 ? "text-instagram-primary" : ""}`}>
                        #{index + 1}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      <Card className="dashboard-card mt-6">
        <h2 className="card-title">Recommendations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">Best Days to Post</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {timingAnalysis?.bestDaysToPost.slice(0, 3).map((day) => (
                <li key={day.day}>
                  <span className="font-medium">{day.day}</span>: {day.count} interactions
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Best Hours to Post</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {timingAnalysis?.bestHoursToPost.slice(0, 3).map((hour) => (
                <li key={hour.hour}>
                  <span className="font-medium">{hour.hour}:00</span>: {hour.count} interactions
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-2 pt-4 border-t">
            <h3 className="font-medium mb-2">Key Insights</h3>
            <p className="text-sm">
              Based on the analyzed data, we recommend posting during peak hours to maximize engagement.
              The most active time period is 
              <span className="font-medium"> {timingAnalysis?.bestHoursToPost[0]?.hour}:00 </span>
              on 
              <span className="font-medium"> {timingAnalysis?.bestDaysToPost[0]?.day}</span>, 
              which shows significantly higher interaction rates compared to other times.
            </p>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default TimingAnalysis;
