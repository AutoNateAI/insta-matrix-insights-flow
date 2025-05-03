
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader, Filter, Download } from 'lucide-react';
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

const TimingAnalysis = () => {
  const { timingAnalysis, hasData, isLoading, posts } = useData();
  
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  
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

  // Filter posts based on selection
  useEffect(() => {
    if (!posts || (!selectedHour && !selectedDay)) {
      setFilteredPosts([]);
      return;
    }

    const filtered = posts.filter(post => {
      const postDate = new Date(post.timestamp);
      
      if (selectedHour && selectedDay) {
        // Filter by both hour and day
        return (
          postDate.getHours() === parseInt(selectedHour) &&
          postDate.toLocaleDateString('en-US', { weekday: 'long' }) === selectedDay
        );
      } else if (selectedHour) {
        // Filter by hour only
        return postDate.getHours() === parseInt(selectedHour);
      } else if (selectedDay) {
        // Filter by day only
        return postDate.toLocaleDateString('en-US', { weekday: 'long' }) === selectedDay;
      }
      
      return false;
    });
    
    setFilteredPosts(filtered);
  }, [selectedHour, selectedDay, posts]);
  
  // Handle bar click in hourly chart
  const handleHourClick = (data: any) => {
    const hour = data.hour.split(':')[0];
    setSelectedHour(selectedHour === hour ? null : hour);
    setSelectedDay(null); // Clear day selection when hour is selected
  };
  
  // Handle pie segment click in day chart
  const handleDayClick = (data: any, index: number) => {
    const day = bestDaysData[index]?.day;
    if (day) {
      setSelectedDay(selectedDay === day ? null : day);
      setSelectedHour(null); // Clear hour selection when day is selected
    }
  };
  
  // Reset selections
  const handleResetFilters = () => {
    setSelectedHour(null);
    setSelectedDay(null);
  };
  
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
      {/* Filtered Results Table */}
      {(selectedHour || selectedDay) && (
        <Card className="dashboard-card mb-6">
          <div className="p-4 pb-0 flex justify-between items-center">
            <h2 className="card-title">
              {selectedHour && `Posts at ${selectedHour}:00`}
              {selectedDay && `Posts on ${selectedDay}`}
              {selectedHour && selectedDay && ` (${selectedHour}:00 on ${selectedDay})`}
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
                filename={`posts-timing-${selectedHour || 'all'}-${selectedDay || 'all'}.json`}
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
              No posts found for the selected time filter.
            </div>
          )}
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Card className="dashboard-card">
            <div className="p-4 pb-0 flex justify-between items-center">
              <div>
                <h2 className="card-title">24-Hour Activity Pattern</h2>
                <p className="text-sm text-muted-foreground">
                  Comment activity patterns throughout the day (all times in 24-hour format).
                  <span className="font-medium ml-1">Click on a bar to see posts for that hour.</span>
                </p>
              </div>
              <ExportButton 
                variant="outline" 
                size="sm" 
                filteredData={hourlyActivityData}
                dataType="timing"
                filename="hourly-activity-data.json"
              />
            </div>
            <div className="h-[300px] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value} interactions`, 'Activity']}
                    labelFormatter={(label) => `Hour: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#9b87f5" 
                    name="Activity" 
                    radius={[4, 4, 0, 0]} 
                    onClick={handleHourClick}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <Card className="dashboard-card">
          <div className="p-4 pb-0 flex justify-between items-center">
            <div>
              <h2 className="card-title">Best Days to Post</h2>
              <p className="text-sm text-muted-foreground">
                Days with the highest engagement levels.
                <span className="font-medium ml-1">Click on a segment to see posts for that day.</span>
              </p>
            </div>
            <ExportButton 
              variant="outline" 
              size="sm" 
              filteredData={bestDaysData}
              dataType="timing"
              filename="best-days-data.json"
            />
          </div>
          <div className="h-[300px] p-4">
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
                  onClick={handleDayClick}
                  cursor="pointer"
                >
                  {bestDaysData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke={selectedDay === entry.day ? '#000' : undefined}
                      strokeWidth={selectedDay === entry.day ? 2 : undefined}
                    />
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
          <div className="p-4 pb-0 flex justify-between items-center">
            <h2 className="card-title">Best Hours to Post</h2>
            <ExportButton 
              variant="outline" 
              size="sm" 
              filteredData={timingAnalysis?.bestHoursToPost || []}
              dataType="timing"
              filename="best-hours-data.json"
            />
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Top hours for maximum engagement (24-hour format)
            </p>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hour (24h)</TableHead>
                    <TableHead className="text-right">Interactions</TableHead>
                    <TableHead className="text-right">Ranking</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timingAnalysis?.bestHoursToPost.slice(0, 10).map((hour, index) => (
                    <TableRow 
                      key={hour.hour} 
                      className={`cursor-pointer ${selectedHour === hour.hour ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedHour(selectedHour === hour.hour ? null : hour.hour)}
                    >
                      <TableCell>{hour.hour}:00</TableCell>
                      <TableCell className="text-right">{hour.count.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${index < 3 ? "text-instagram-primary" : ""}`}>
                          #{index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {selectedHour === hour.hour ? 'Selected' : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="dashboard-card mt-6">
        <h2 className="card-title p-4 pb-0">Recommendations</h2>
        <div className="grid gap-4 md:grid-cols-2 p-4">
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
