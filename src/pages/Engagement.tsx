
import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Loader, Download, Search, Filter, Clock, Users, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { EngagementData } from '@/types';
import { useCart } from '@/contexts/CartContext';
import ExportButton from '@/components/ExportButton';

const Engagement = () => {
  const { engagementData, hasData, isLoading, exportReport } = useData();
  const { addToCart, isInCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filteredData, setFilteredData] = useState<EngagementData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [minLikes, setMinLikes] = useState(0);
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  const pageSize = 10;
  
  // Derive unique influencers from data
  const influencers = engagementData 
    ? Array.from(new Set(engagementData.map(item => item.influencer)))
    : [];
  
  // Apply filters and sorting
  useEffect(() => {
    if (!engagementData) return;
    
    let results = [...engagementData];
    
    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      results = results.filter(
        item => item.commentText.toLowerCase().includes(lowerCaseSearchTerm) ||
               item.username.toLowerCase().includes(lowerCaseSearchTerm) ||
               item.influencer.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    
    // Apply likes filter
    if (minLikes > 0) {
      results = results.filter(item => item.likesCount >= minLikes);
    }
    
    // Apply influencer filter
    if (selectedInfluencer !== 'all') {
      results = results.filter(item => item.influencer === selectedInfluencer);
    }
    
    // Apply date filter
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      results = results.filter(item => {
        const itemDate = new Date(item.datetime);
        return format(itemDate, 'yyyy-MM-dd') === selectedDateStr;
      });
    }
    
    // Apply sorting
    if (sortField) {
      results.sort((a, b) => {
        let aValue: any = a[sortField as keyof EngagementData];
        let bValue: any = b[sortField as keyof EngagementData];
        
        // Special case for date strings
        if (sortField === 'datetime') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredData(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [engagementData, searchTerm, sortField, sortDirection, minLikes, selectedInfluencer, selectedDate]);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const currentData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Toggle sort when column header is clicked
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending for new sort field
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setMinLikes(0);
    setSelectedInfluencer('all');
    setSelectedDate(undefined);
    setSortField(null);
    setSortDirection('desc');
  };
  
  // Export filtered data
  const handleExportFiltered = () => {
    exportReport(filteredData);
  };
  
  // If no data uploaded yet
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
  
  // Loading state
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
      <Card className="dashboard-card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search comments, users or influencers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters {showFilters ? '↑' : '↓'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportFiltered}
              disabled={filteredData.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Filtered Data
            </Button>
            
            {(searchTerm || minLikes > 0 || selectedInfluencer !== 'all' || selectedDate) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearFilters}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        
        {/* Advanced filters */}
        {showFilters && (
          <div className="bg-slate-50 p-4 rounded-md mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="likes-filter" className="mb-2 block">Minimum Likes</Label>
              <Slider 
                id="likes-filter"
                min={0} 
                max={100} 
                step={1} 
                value={[minLikes]} 
                onValueChange={(values) => setMinLikes(values[0])} 
                className="mb-1" 
              />
              <div className="text-right text-sm text-muted-foreground">{minLikes}+ likes</div>
            </div>
            
            <div>
              <Label htmlFor="influencer-filter" className="mb-2 block">Influencer</Label>
              <Select 
                value={selectedInfluencer} 
                onValueChange={setSelectedInfluencer}
              >
                <SelectTrigger id="influencer-filter">
                  <SelectValue placeholder="All Influencers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Influencers</SelectItem>
                  {influencers.map(influencer => (
                    <SelectItem key={influencer} value={influencer}>
                      @{influencer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="mb-2 block">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
        
        {/* Results summary */}
        <div className="text-sm text-muted-foreground mb-4 flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Found {filteredData.length} comments
          {searchTerm && <span className="ml-2">matching "{searchTerm}"</span>}
        </div>
        
        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('username')}
                >
                  Username
                  {sortField === 'username' && (
                    <span className="ml-2">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead>Comment</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('datetime')}
                >
                  Date & Time
                  {sortField === 'datetime' && (
                    <span className="ml-2">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('likesCount')}
                >
                  Likes
                  {sortField === 'likesCount' && (
                    <span className="ml-2">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('influencer')}
                >
                  On Post By
                  {sortField === 'influencer' && (
                    <span className="ml-2">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No engagement data matches your filters.
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">@{item.username}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.commentText}</TableCell>
                    <TableCell>{item.datetime}</TableCell>
                    <TableCell>{item.likesCount}</TableCell>
                    <TableCell>@{item.influencer}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addToCart({
                          id: item.id,
                          type: 'comment',
                          data: item
                        })}
                        disabled={isInCart(item.id, 'comment')}
                      >
                        {isInCart(item.id, 'comment') ? 'In cart' : 'Add to cart'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default Engagement;
