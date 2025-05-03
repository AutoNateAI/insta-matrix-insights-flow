
import { useState } from 'react';
import { InstagramPost } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ShoppingCart, ExternalLink } from 'lucide-react';
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
  DialogFooter
} from '@/components/ui/dialog';

interface PostsTableProps {
  posts: InstagramPost[];
}

const PostsTable = ({ posts }: PostsTableProps) => {
  const { addToCart, isInCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  
  const itemsPerPage = 10;
  
  // Filter posts by search term
  const filteredPosts = posts.filter(post => 
    post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.ownerUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.hashtags.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const currentPageData = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div>
      <div className="flex items-center space-x-2 mb-6">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by caption, username, or hashtags..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1"
        />
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No results match your search criteria.
        </div>
      ) : (
        <>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Caption</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageData.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/30">
                    <TableCell>@{post.ownerUsername}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {post.caption || "(No caption)"}
                    </TableCell>
                    <TableCell>{post.commentsCount}</TableCell>
                    <TableCell>{post.likesCount}</TableCell>
                    <TableCell>{new Date(post.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setSelectedPost(post)}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => addToCart({
                            id: post.id,
                            type: 'post',
                            data: post
                          })}
                          disabled={isInCart(post.id, 'post')}
                        >
                          {isInCart(post.id, 'post') ? (
                            <ShoppingCart className="h-3 w-3" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          {isInCart(post.id, 'post') ? 'In Cart' : 'Add to Cart'}
                        </Button>
                      </div>
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
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        {selectedPost && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Post Details</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Username:</div>
                <div>@{selectedPost.ownerUsername}</div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Caption:</div>
                <div>{selectedPost.caption || "(No caption)"}</div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Hashtags:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedPost.hashtags.length > 0 ? (
                    selectedPost.hashtags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No hashtags</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Mentions:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedPost.mentions.length > 0 ? (
                    selectedPost.mentions.map((mention, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        @{mention}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No mentions</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Stats:</div>
                <div className="flex gap-4">
                  <span>❤️ {selectedPost.likesCount} likes</span>
                  <span>💬 {selectedPost.commentsCount} comments</span>
                </div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Date:</div>
                <div>{new Date(selectedPost.timestamp).toLocaleString()}</div>
              </div>
              
              {selectedPost.latestComments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Latest Comments:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedPost.latestComments.map((comment) => (
                      <div key={comment.id} className="border p-2 rounded-md">
                        <div className="flex justify-between">
                          <span className="font-medium">@{comment.ownerUsername}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedPost(null)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  addToCart({
                    id: selectedPost.id,
                    type: 'post',
                    data: selectedPost
                  });
                  setSelectedPost(null);
                }}
                disabled={isInCart(selectedPost.id, 'post')}
              >
                {isInCart(selectedPost.id, 'post') ? 'Already in Cart' : 'Add to Cart'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default PostsTable;
