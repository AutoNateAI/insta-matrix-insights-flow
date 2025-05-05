
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useCart } from '@/contexts/CartContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InstagramPost, EngagementData } from '@/types';
import { ShoppingCart, X, Download, DownloadCloud, PlusCircle, Trash2 } from 'lucide-react';
import { useMeme } from '@/contexts/MemeContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import ExportButton from '@/components/ExportButton';

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { generateMeme } = useMeme();
  const navigate = useNavigate();
  
  const postsInCart = cartItems.filter((item) => item.type === 'post');
  const commentsInCart = cartItems.filter((item) => item.type === 'comment');
  
  const handleCreateMeme = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Add items to create a meme.');
      return;
    }
    
    navigate('/meme-creation');
  };
  
  // Format post data for export
  const formatPostsForExport = () => {
    return postsInCart.map(item => {
      const post = item.data as InstagramPost;
      return {
        id: post.id,
        username: post.ownerUsername,
        caption: post.caption,
        likes: post.likesCount,
        comments: post.commentsCount,
        timestamp: post.timestamp,
        hashtags: post.hashtags,
        mentions: post.mentions
      };
    });
  };
  
  // Format comment data for export
  const formatCommentsForExport = () => {
    return commentsInCart.map(item => {
      const comment = item.data as EngagementData;
      return {
        id: comment.id,
        username: comment.username,
        commentText: comment.commentText,
        influencer: comment.influencer,
        likes: comment.likesCount,
        timestamp: comment.datetime
      };
    });
  };

  return (
    <DashboardLayout title="Cart">
      <Card className="dashboard-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Your Cart ({cartItems.length} items)</h2>
          </div>
          
          <div className="flex gap-2">
            <ExportButton 
              variant="outline"
              filteredData={cartItems}
              dataType="all"
              filename={`cart-export-${new Date().toISOString().split('T')[0]}.json`}
            />
            
            <Button 
              variant="outline" 
              onClick={handleCreateMeme}
              disabled={cartItems.length === 0}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Meme
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your cart?')) {
                  clearCart();
                }
              }}
              disabled={cartItems.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add posts or comments to your cart to analyze them later.
            </p>
            <Button asChild>
              <a href="/content-analysis">Browse Content</a>
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="posts">
            <TabsList className="mb-4">
              <TabsTrigger value="posts">
                Posts ({postsInCart.length})
              </TabsTrigger>
              <TabsTrigger value="comments">
                Comments ({commentsInCart.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Caption</TableHead>
                      <TableHead className="w-[120px]">Likes</TableHead>
                      <TableHead className="w-[120px]">Comments</TableHead>
                      <TableHead className="w-[180px]">Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postsInCart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No posts in your cart
                        </TableCell>
                      </TableRow>
                    ) : (
                      postsInCart.map((item) => {
                        const post = item.data as InstagramPost;
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              @{post.ownerUsername}
                            </TableCell>
                            <TableCell className="max-w-[250px] truncate">
                              {post.caption || "(No caption)"}
                            </TableCell>
                            <TableCell>{post.likesCount}</TableCell>
                            <TableCell>{post.commentsCount}</TableCell>
                            <TableCell>
                              {new Date(post.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id, 'post')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const dataToExport = {
                                      exportedAt: new Date().toISOString(),
                                      dataType: 'post',
                                      data: post
                                    };
                                    
                                    // Create a download link
                                    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `post-${post.id}.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                    
                                    toast.success('Post exported successfully');
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {postsInCart.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <ExportButton 
                    variant="outline"
                    size="sm"
                    filteredData={formatPostsForExport()}
                    dataType="posts"
                    filename={`cart-posts-export-${new Date().toISOString().split('T')[0]}.json`}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="comments">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Influencer</TableHead>
                      <TableHead className="w-[120px]">Likes</TableHead>
                      <TableHead className="w-[180px]">Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commentsInCart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No comments in your cart
                        </TableCell>
                      </TableRow>
                    ) : (
                      commentsInCart.map((item) => {
                        const comment = item.data as EngagementData;
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              @{comment.username}
                            </TableCell>
                            <TableCell className="max-w-[250px] truncate">
                              {comment.commentText}
                            </TableCell>
                            <TableCell>
                              @{comment.influencer}
                            </TableCell>
                            <TableCell>{comment.likesCount}</TableCell>
                            <TableCell>
                              {comment.datetime}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id, 'comment')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const dataToExport = {
                                      exportedAt: new Date().toISOString(),
                                      dataType: 'comment',
                                      data: comment
                                    };
                                    
                                    // Create a download link
                                    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `comment-${comment.id}.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                    
                                    toast.success('Comment exported successfully');
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {commentsInCart.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <ExportButton 
                    variant="outline"
                    size="sm"
                    filteredData={formatCommentsForExport()}
                    dataType="comments"
                    filename={`cart-comments-export-${new Date().toISOString().split('T')[0]}.json`}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default CartPage;
