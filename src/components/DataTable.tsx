
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ShoppingCart, ExternalLink, SortAsc, SortDesc } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useCart } from '@/contexts/CartContext';
import ExportButton from './ExportButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

interface DataTableProps {
  data: any[];
  columns: {
    key: string;
    header: string;
    cell?: (item: any) => React.ReactNode;
    isSortable?: boolean;
  }[];
  title?: string;
  dataType: 'posts' | 'comments' | 'hashtags' | 'timing' | 'network';
  showSearch?: boolean;
  showExport?: boolean;
  allowAddToCart?: boolean;
  itemType?: 'post' | 'comment';
  emptyMessage?: string;
  className?: string;
}

const DataTable = ({
  data,
  columns,
  title,
  dataType,
  showSearch = true,
  showExport = true,
  allowAddToCart = true,
  itemType = 'post',
  emptyMessage = 'No data available',
  className
}: DataTableProps) => {
  const { addToCart, isInCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 10;
  
  // Filter function
  const filterData = (item: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return Object.keys(item).some(key => {
      const value = item[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }
      if (Array.isArray(value)) {
        return value.some(v => 
          typeof v === 'string' && v.toLowerCase().includes(searchLower)
        );
      }
      return false;
    });
  };
  
  // Sort function
  const sortData = (a: any, b: any) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle dates
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    // Handle date strings
    if (
      typeof aValue === 'string' && 
      typeof bValue === 'string' && 
      !isNaN(Date.parse(aValue)) && 
      !isNaN(Date.parse(bValue))
    ) {
      return sortDirection === 'asc' 
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime();
    }
    
    return 0;
  };
  
  // Apply filtering and sorting
  const processedData = data
    .filter(filterData)
    .sort(sortData);
  
  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const currentData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle column sort toggle
  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };
  
  // Add an item to the cart
  const handleAddToCart = (item: any) => {
    if (!allowAddToCart) return;
    
    addToCart({
      id: item.id,
      type: itemType,
      data: item
    });
  };
  
  // View item details
  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
  };
  
  const filename = `${dataType}-${new Date().toISOString().split('T')[0]}.json`;
  
  return (
    <div className={`w-full ${className}`}>
      {/* Header with search and export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 mb-4">
        {title && <h3 className="text-lg font-medium">{title}</h3>}
        
        <div className="flex flex-1 justify-end items-center space-x-2">
          {showSearch && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8"
              />
            </div>
          )}
          
          {showExport && (
            <ExportButton
              variant="outline"
              size="sm"
              filteredData={processedData}
              dataType={dataType}
              filename={filename}
            />
          )}
        </div>
      </div>
      
      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={column.isSortable ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={column.isSortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.isSortable && sortField === column.key && (
                      sortDirection === 'asc' 
                        ? <SortAsc className="h-3 w-3" />
                        : <SortDesc className="h-3 w-3" />
                    )}
                  </div>
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-10 text-muted-foreground">
                  {searchTerm ? 'No results match your search' : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item, i) => (
                <TableRow key={item.id || i}>
                  {columns.map((column) => (
                    <TableCell key={`${item.id || i}-${column.key}`}>
                      {column.cell ? column.cell(item) : item[column.key]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      
                      {allowAddToCart && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          disabled={isInCart(item.id, itemType)}
                        >
                          {isInCart(item.id, itemType) ? (
                            <ShoppingCart className="h-3 w-3 mr-1" />
                          ) : (
                            <Plus className="h-3 w-3 mr-1" />
                          )}
                          {isInCart(item.id, itemType) ? 'In Cart' : 'Add'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length}
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
      
      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Details</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {Object.entries(selectedItem).map(([key, value]) => {
                // Skip internal or complex fields
                if (
                  key === 'id' ||
                  typeof value === 'object' ||
                  typeof value === 'function' ||
                  value === null ||
                  value === undefined
                ) {
                  return null;
                }
                
                return (
                  <div key={key} className="grid grid-cols-[1fr_2fr] gap-4">
                    <div className="font-medium capitalize">{key}</div>
                    <div>{String(value)}</div>
                  </div>
                );
              })}
              
              {/* Special handling for arrays */}
              {Object.entries(selectedItem).map(([key, value]) => {
                if (!Array.isArray(value) || value.length === 0) {
                  return null;
                }
                
                return (
                  <div key={key} className="grid grid-cols-[1fr_2fr] gap-4">
                    <div className="font-medium capitalize">{key}</div>
                    <div className="flex flex-wrap gap-1">
                      {value.map((item, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          {String(item)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </Button>
              
              {allowAddToCart && (
                <Button
                  onClick={() => {
                    handleAddToCart(selectedItem);
                    setSelectedItem(null);
                  }}
                  disabled={isInCart(selectedItem.id, itemType)}
                >
                  {isInCart(selectedItem.id, itemType) ? 'Already in Cart' : 'Add to Cart'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default DataTable;
