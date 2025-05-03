
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { useCart } from '@/contexts/CartContext';
import { Card } from '@/components/ui/card';
import { 
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  Loader,
  Search,
  ShoppingCart,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';

const Engagement = () => {
  const { engagementData, hasData, isLoading, exportReport } = useData();
  const { addToCart, isInCart } = useCart();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof typeof sortOptions>('dateDesc');
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [exportFiltered, setExportFiltered] = useState(true);
  const [activeFilters, setActiveFilters] = useState(0);
  
  const itemsPerPage = 10;
  
  // Sort options
  const sortOptions = {
    dateDesc: { label: 'Date (Newest first)', field: 'datetime', direction: 'desc' },
    dateAsc: { label: 'Date (Oldest first)', field: 'datetime', direction: 'asc' },
    likesDesc: { label: 'Likes (High to Low)', field: 'likesCount', direction: 'desc' },
    likesAsc: { label: 'Likes (Low to High)', field: 'likesCount', direction: 'asc' },
    usernameAsc: { label: 'Username (A-Z)', field: 'username', direction: 'asc' },
    usernameDesc: { label: 'Username (Z-A)', field: 'username', direction: 'desc' },
    influencerAsc: { label: 'Influencer (A-Z)', field: 'influencer', direction: 'asc' },
    influencerDesc: { label: 'Influencer (Z-A)', field: 'influencer', direction: 'desc' },
  };
  
  // Get unique influencers for filter
  const uniqueInfluencers = [...new Set(engagementData.map(item => item.influencer))];
  
  // Filter and sort data
  const filteredData = engagementData.filter(item => {
    // Text search
    const matchesSearch = searchTerm
      ? item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.influencer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.commentText.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    // Influencer filter
    const matchesInfluencer = selectedInfluencers.length > 0
      ? selectedInfluencers.includes(item.influencer)
      : true;
    
    return matchesSearch && matchesInfluencer;
  }).sort((a, b) => {
    const sortConfig = sortOptions[sortField];
    const field = sortConfig.field as keyof typeof a;
    const direction = sortConfig.direction;
    
    if (field === 'datetime') {
      return direction === 'asc'
        ? new Date(a[field]).getTime() - new Date(b[field]).getTime()
        : new Date(b[field]).getTime() - new Date(a[field]).getTime();
    }
    
    if (typeof a[field] === 'number' && typeof b[field] === 'number') {
      return direction === 'asc'
        ? (a[field] as number) - (b[field] as number)
        : (b[field] as number) - (a[field] as number);
    }
    
    const aVal = String(a[field]).toLowerCase();
    const bVal = String(b[field]).toLowerCase();
    
    return direction === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentPageData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Reset to first page when filters change
  const updateSearchAndResetPage = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };
  
  // Update filter count
  const updateFilters = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedInfluencers.length > 0) count++;
    if (sortField !== 'dateDesc') count++;
    setActiveFilters(count);
  };
  
  // Handle influencer filter toggling
  const toggleInfluencer = (influencer: string) => {
    setSelectedInfluencers(prev => {
      const isSelected = prev.includes(influencer);
      const newSelection = isSelected
        ? prev.filter(i => i !== influencer)
        : [...prev, influencer];
      
      setCurrentPage(1);
      return newSelection;
    });
  };
  
  // Handle export
  const handleExport = () => {
    if (exportFiltered) {
      exportReport(filteredData);
    } else {
      exportReport();
    }
  };
  
  // Update the count of active filters when relevant state changes
  useState(() => {
    updateFilters();
  });
  
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
      <Card className="dashboard-card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="card-title">Engagement Tracking</h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export Full Report
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilters > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {activeFilters}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter Options</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Influencer Filter</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {uniqueInfluencers.map(influencer => (
                        <div key={influencer} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`inf-${influencer}`}
                            checked={selectedInfluencers.includes(influencer)}
                            onChange={() => toggleInfluencer(influencer)}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`inf-${influencer}`} className="text-sm cursor-pointer">
                            @{influencer}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <select
                      value={sortField}
                      onChange={(e) => {
                        setSortField(e.target.value as keyof typeof sortOptions);
                        setCurrentPage(1);
                      }}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      {Object.entries(sortOptions).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="export-filtered"
                      checked={exportFiltered}
                      onChange={(e) => setExportFiltered(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="export-filtered" className="text-sm">
                      Only include filtered results in exports
                    </label>
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Close
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setSelectedInfluencers([]);
                      setSortField('dateDesc');
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                  >
                    Reset All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-6">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, influencer, or comment text..."
            value={searchTerm}
            onChange={(e) => updateSearchAndResetPage(e.target.value)}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commenter</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Post Caption</TableHead>
                    <TableHead>Influencer</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageData.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell>@{item.username}</TableCell>
                      <TableCell>{item.commentText}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.postCaption || "(No caption)"}
                      </TableCell>
                      <TableCell>@{item.influencer}</TableCell>
                      <TableCell>{item.datetime}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => addToCart({
                            id: item.id,
                            type: 'comment',
                            data: item
                          })}
                          disabled={isInCart(item.id, 'comment')}
                        >
                          {isInCart(item.id, 'comment') ? (
                            <ShoppingCart className="h-3 w-3" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          {isInCart(item.id, 'comment') ? 'In Cart' : 'Add to Cart'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
      
      <Card className="dashboard-card">
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
                  const key = `${item.influencer}: ${item.postCaption?.substring(0, 30)}${item.postCaption?.length > 30 ? '...' : '' || "(No caption)"}`;
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
