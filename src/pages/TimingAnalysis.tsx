
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ChartWithTable from '@/components/ChartWithTable';
import { InstagramPost } from '@/types';

const TimingAnalysis = () => {
  const { timingAnalysis, hasData, isLoading, posts } = useData();
  
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [hourlyFilteredData, setHourlyFilteredData] = useState<any[]>([]);
  const [daysFilteredData, setDaysFilteredData] = useState<any[]>([]);
  const [hoursTableData, setHoursTableData] = useState<any[]>([]);
  
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
    
    if (selectedHour === hour) {
      setSelectedHour(null);
      setHourlyFilteredData([]);
    } else {
      setSelectedHour(hour);
      setSelectedDay(null); // Clear day selection when hour is selected
      
      if (!posts) return;
      
      const filtered = posts.filter(post => {
        const postDate = new Date(post.timestamp);
        return postDate.getHours() === parseInt(hour);
      });
      
      setHourlyFilteredData(filtered);
    }
  };
  
  // Handle pie segment click in day chart
  const handleDayClick = (data: any, index: number) => {
    const day = bestDaysData[index]?.day;
    if (!day || !posts) return;
    
    if (selectedDay === day) {
      setSelectedDay(null);
      setDaysFilteredData([]);
    } else {
      setSelectedDay(day);
      setSelectedHour(null); // Clear hour selection when day is selected
      
      const filtered = posts.filter(post => {
        const postDate = new Date(post.timestamp);
        return postDate.toLocaleDateString('en-US', { weekday: 'long' }) === day;
      });
      
      setDaysFilteredData(filtered);
    }
  };

  // Handle hours table click
  const handleHoursTableClick = (hour: string) => {
    if (!hour || !posts) return;
    
    if (selectedHour === hour) {
      setSelectedHour(null);
      setHoursTableData([]);
    } else {
      setSelectedHour(hour);
      setSelectedDay(null); // Clear day selection
      
      const filtered = posts.filter(post => {
        const postDate = new Date(post.timestamp);
        return postDate.getHours() === parseInt(hour);
      });
      
      setHoursTableData(filtered);
    }
  };
  
  // Reset selections
  const handleResetFilters = () => {
    setSelectedHour(null);
    setSelectedDay(null);
    setHourlyFilteredData([]);
    setDaysFilteredData([]);
    setHoursTableData([]);
  };

  // Define table columns for timing posts
  const postColumns = [
    {
      key: 'timestamp',
      header: 'Time',
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
            </div>
          </div>
          {filteredPosts.length > 0 ? (
            <div className="p-4 overflow-auto">
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
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No posts found for the selected time filter.
            </div>
          )}
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <ChartWithTable
            title="24-Hour Activity Pattern"
            subtitle="Comment activity patterns throughout the day (all times in 24-hour format). Click on a bar to see posts for that hour."
            dataType="posts"
            initialData={posts}
            filteredData={hourlyFilteredData}
            tableColumns={postColumns}
            exportFilename="hourly-activity-posts.json"
            chartComponent={
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
            }
            onChartClick={handleHourClick}
          />
        </div>
        
        <ChartWithTable
          title="Best Days to Post"
          subtitle="Days with the highest engagement levels. Click on a segment to see posts for that day."
          dataType="posts"
          initialData={posts}
          filteredData={daysFilteredData}
          tableColumns={postColumns}
          exportFilename="best-days-posts.json"
          chartComponent={
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
          }
          onChartClick={handleDayClick}
        />
        
        <ChartWithTable
          title="Best Hours to Post"
          subtitle="Top hours for maximum engagement (24-hour format). Click on a row to see posts for that hour."
          dataType="posts"
          initialData={posts}
          filteredData={hoursTableData}
          tableColumns={postColumns}
          exportFilename="best-hours-posts.json"
          chartComponent={
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Hour (24h)</th>
                    <th className="text-right p-2">Interactions</th>
                    <th className="text-right p-2">Ranking</th>
                    <th className="text-right p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {timingAnalysis?.bestHoursToPost.slice(0, 10).map((hour, index) => (
                    <tr 
                      key={hour.hour} 
                      className={`cursor-pointer border-b ${selectedHour === hour.hour ? 'bg-muted' : ''}`}
                      onClick={() => handleHoursTableClick(hour.hour)}
                    >
                      <td className="p-2">{hour.hour}:00</td>
                      <td className="text-right p-2">{hour.count.toLocaleString()}</td>
                      <td className="text-right p-2">
                        <span className={`font-medium ${index < 3 ? "text-instagram-primary" : ""}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="text-right p-2">
                        {selectedHour === hour.hour ? 'Selected' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          onChartClick={(data) => {
            if (data && data.hour) {
              handleHoursTableClick(data.hour);
            }
          }}
        />
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
