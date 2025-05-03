
import DashboardLayout from '@/components/DashboardLayout';
import { useCart } from '@/contexts/CartContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { InstagramPost, EngagementData } from '@/types';

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  
  const postItems = cartItems.filter(item => item.type === 'post');
  const commentItems = cartItems.filter(item => item.type === 'comment');

  return (
    <DashboardLayout title="Shopping Cart">
      <div className="space-y-6">
        {cartItems.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground">
              Add posts and comments to your cart from the various analytics pages.
            </p>
          </Card>
        ) : (
          <>
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={clearCart}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </Button>
            </div>
            
            {/* Posts Table */}
            {postItems.length > 0 && (
              <Card className="overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="font-semibold">Posts ({postItems.length})</h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Influencer</TableHead>
                      <TableHead>Caption</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postItems.map(item => {
                      const post = item.data as InstagramPost;
                      return (
                        <TableRow key={item.id}>
                          <TableCell>@{post.ownerUsername}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {post.caption || "(No caption)"}
                          </TableCell>
                          <TableCell>{post.likesCount}</TableCell>
                          <TableCell>{post.commentsCount}</TableCell>
                          <TableCell>
                            {new Date(post.timestamp).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id, item.type)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
            
            {/* Comments Table */}
            {commentItems.length > 0 && (
              <Card className="overflow-hidden">
                <div className="p-4 border-b">
                  <h2 className="font-semibold">Comments ({commentItems.length})</h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Post Caption</TableHead>
                      <TableHead>Influencer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commentItems.map(item => {
                      const comment = item.data as EngagementData;
                      return (
                        <TableRow key={item.id}>
                          <TableCell>@{comment.username}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {comment.commentText}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {comment.postCaption || "(No caption)"}
                          </TableCell>
                          <TableCell>@{comment.influencer}</TableCell>
                          <TableCell>{comment.datetime}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id, item.type)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CartPage;
