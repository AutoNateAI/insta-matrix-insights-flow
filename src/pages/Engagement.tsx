
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Engagement = () => {
  const { engagementData, hasData, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter and sort data
  const filteredData = searchTerm
    ? engagementData.filter(item => 
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.influencer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.commentText.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : engagementData;
  
  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPageData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  if (!hasData) {
    return (
      <DashboardLayout title="Engagement Analysis">
        <div className="text-center space-y-4 max-w-lg mx-auto py-12">
          <h2 className="text-2xl font-bold">No Data Available</h2>
          <p className="text-muted-foreground">
            Please upload your Instagram data first to view engagement analysis.
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
      <DashboardLayout title="Engagement Analysis">
        <div className="text-center py-12">
          <Loader className="animate-spin h-8 w-8 mx-auto text-primary" />
          <p className="mt-4">Processing data...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Engagement Analysis">
      <Card className="dashboard-card">
        <h2 className="card-title">Engagement Tracking</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Comprehensive list of commenters and their interactions
        </p>
        
        <div className="flex items-center space-x-2 mb-6">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, influencer, or comment text..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on new search
            }}
            className="flex-1"
          />
        </div>
        
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No results match your search criteria.
          </div>
        ) : (
          <>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">Commenter</th>
                    <th className="py-3 px-4 text-left font-medium">Comment</th>
                    <th className="py-3 px-4 text-left font-medium">Post Caption</th>
                    <th className="py-3 px-4 text-left font-medium">Influencer</th>
                    <th className="py-3 px-4 text-left font-medium">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.map((item, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4">@{item.username}</td>
                      <td className="py-3 px-4">{item.commentText}</td>
                      <td className="py-3 px-4 max-w-[200px] truncate">{item.postCaption}</td>
                      <td className="py-3 px-4">@{item.influencer}</td>
                      <td className="py-3 px-4">{item.datetime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
      
      <Card className="dashboard-card mt-6">
        <h2 className="card-title">Engagement Summary</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-medium mb-2">Top Commenters</h3>
            <div className="space-y-2">
              {Array.from(
                filteredData.reduce((acc, item) => {
                  acc.set(item.username, (acc.get(item.username) || 0) + 1);
                  return acc;
                }, new Map())
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([username, count], index) => (
                  <div key={username} className="flex justify-between items-center">
                    <span>@{username}</span>
                    <span className="font-medium">{count} comments</span>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Most Commented Posts</h3>
            <div className="space-y-2">
              {Array.from(
                filteredData.reduce((acc, item) => {
                  const key = `${item.influencer}: ${item.postCaption.substring(0, 30)}${item.postCaption.length > 30 ? '...' : ''}`;
                  acc.set(key, (acc.get(key) || 0) + 1);
                  return acc;
                }, new Map())
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([post, count], index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="truncate max-w-[250px]">{post}</span>
                    <span className="font-medium">{count} comments</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Engagement;
