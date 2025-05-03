
import { useState } from 'react';
import { InstagramPost } from '@/types';
import { useCart } from '@/contexts/CartContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ShoppingCart, Filter, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import PostDetailModal from './PostDetailModal';

interface PostsTableProps {
  posts: InstagramPost[];
  title?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  className?: string;
}

const PostsTable: React.FC<PostsTableProps> = ({
  posts,
  title = "Posts",
  showSearch = true,
  showFilters = true,
  className = ""
}) => {
  const { addToCart, isInCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'date' | 'likes' | 'comments'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const itemsPerPage = 10;

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => 
      post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.ownerUsername.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      
      if (sortField === 'likes') {
        return sortDirection === 'asc' 
          ? a.likesCount - b.likesCount 
          : b.likesCount - a.likesCount;
      }
      
      if (sortField === 'comments') {
        return sortDirection === 'asc'
          ? a.commentsCount - b.commentsCount
          : b.commentsCount - a.commentsCount;
      }
      
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'date' | 'likes' | 'comments') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const openPostDetail = (post: InstagramPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleAddToCart = (post: InstagramPost) => {
    addToCart({
      id: post.id,
      type: 'post',
      data: post
    });
  };

  return (
    <div className={className}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      
      {showSearch && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts by caption or username..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1"
            />
          </div>
        </div>
      )}
      
      {showFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Sort by:</span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => toggleSort('date')}
            >
              Date
              {sortField === 'date' && (
                sortDirection === 'asc' 
                  ? <ArrowUp className="ml-1 h-3 w-3" />
                  : <ArrowDown className="ml-1 h-3 w-3" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => toggleSort('likes')}
            >
              Likes
              {sortField === 'likes' && (
                sortDirection === 'asc'
                  ? <ArrowUp className="ml-1 h-3 w-3" />
                  : <ArrowDown className="ml-1 h-3 w-3" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => toggleSort('comments')}
            >
              Comments
              {sortField === 'comments' && (
                sortDirection === 'asc'
                  ? <ArrowUp className="ml-1 h-3 w-3" />
                  : <ArrowDown className="ml-1 h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      )}
      
      {currentPosts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No posts match your search criteria.
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Caption</TableHead>
                  <TableHead className="text-center">Likes</TableHead>
                  <TableHead className="text-center">Comments</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPosts.map(post => (
                  <TableRow key={post.id}>
                    <TableCell>@{post.ownerUsername}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {post.caption || '(No caption)'}
                    </TableCell>
                    <TableCell className="text-center">{post.likesCount}</TableCell>
                    <TableCell className="text-center">{post.commentsCount}</TableCell>
                    <TableCell>{new Date(post.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openPostDetail(post)}
                        >
                          <span className="sr-only">View details</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleAddToCart(post)}
                          disabled={isInCart(post.id, 'post')}
                        >
                          <span className="sr-only">
                            {isInCart(post.id, 'post') ? 'In cart' : 'Add to cart'}
                          </span>
                          {isInCart(post.id, 'post') ? (
                            <ShoppingCart className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredPosts.length)} of {filteredPosts.length} posts
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
      
      {/* Post Detail Modal */}
      <PostDetailModal 
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PostsTable;
