
import { InstagramPost } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, ExternalLink } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface PostDetailModalProps {
  post: InstagramPost | null;
  isOpen: boolean;
  onClose: () => void;
}

const PostDetailModal = ({ post, isOpen, onClose }: PostDetailModalProps) => {
  const { addToCart, isInCart } = useCart();
  
  if (!post) return null;
  
  const handleAddToCart = () => {
    addToCart({
      id: post.id,
      type: 'post',
      data: post
    });
  };
  
  const isAlreadyInCart = isInCart(post.id, 'post');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="font-medium">@{post.ownerUsername}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(post.timestamp).toLocaleString()}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-4">
                <span className="text-sm">{post.likesCount} likes</span>
                <span className="text-sm">{post.commentsCount} comments</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Post ID: {post.shortCode}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Caption</h3>
            <p className="text-sm whitespace-pre-wrap">
              {post.caption || '(No caption)'}
            </p>
          </div>
          
          {post.hashtags.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Hashtags</h3>
              <div className="flex flex-wrap gap-1">
                {post.hashtags.map(tag => (
                  <span key={tag} className="bg-muted px-2 py-1 rounded-md text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {post.mentions.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Mentions</h3>
              <div className="flex flex-wrap gap-1">
                {post.mentions.map(mention => (
                  <span key={mention} className="text-primary text-xs">
                    @{mention}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {post.taggedUsers.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Tagged Users</h3>
              <div className="flex flex-wrap gap-2">
                {post.taggedUsers.map(user => (
                  <span key={user.id} className="text-sm">
                    @{user.username}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {post.latestComments.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Latest Comments</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {post.latestComments.map(comment => (
                  <div key={comment.id} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">@{comment.ownerUsername}</span>
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
          <div className="flex w-full gap-2">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              asChild
            >
              <a href={post.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open on Instagram
              </a>
            </Button>
            <Button
              className="flex-1 bg-instagram-primary hover:bg-instagram-primary/90"
              onClick={handleAddToCart}
              disabled={isAlreadyInCart}
            >
              {isAlreadyInCart ? (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  In Cart
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
