
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, ImagePlus, Loader, X, Info } from 'lucide-react';
import { useMeme } from '@/contexts/MemeContext';
import { useCart } from '@/contexts/CartContext';
import { MemeConfig, InstagramPost, EngagementData, CartItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const MemeCreation = () => {
  const { memes, generateMeme, deleteMeme, generatingMemes } = useMeme();
  const { cartItems } = useCart();
  
  const [config, setConfig] = useState<MemeConfig>({
    topText: '',
    bottomText: '',
    fontSize: 24,
    fontColor: '#ffffff',
    backgroundColor: '#000000',
    prompt: '',
    style: 'realistic',
    ratio: '1:1',
    textPosition: 'bottom'
  });
  
  const [selectedCartItems, setSelectedCartItems] = useState<CartItem[]>([]);
  
  // Update prompt when selected items change
  useEffect(() => {
    if (selectedCartItems.length > 0) {
      // Extract text from selected items to build a better prompt
      const extractedText = selectedCartItems.map(item => {
        if (item.type === 'post') {
          const post = item.data as InstagramPost;
          return post.caption || '';
        } else {
          const comment = item.data as EngagementData;
          return comment.commentText || '';
        }
      }).join(' ');
      
      // Update prompt with extracted text, but don't override user's input if already set
      setConfig(prev => ({
        ...prev,
        prompt: prev.prompt || `Create a meme about: ${extractedText.substring(0, 100)}...`
      }));
    }
  }, [selectedCartItems]);

  const handleGenerate = async () => {
    // Find source materials from selected items
    const sourcePost = selectedCartItems.find(item => item.type === 'post')?.data as InstagramPost | undefined;
    const sourceComment = selectedCartItems.find(item => item.type === 'comment')?.data as EngagementData | undefined;
    
    await generateMeme(config, sourcePost, sourceComment);
  };

  const postItems = cartItems.filter(item => item.type === 'post');
  const commentItems = cartItems.filter(item => item.type === 'comment');
  
  const toggleItemSelection = (item: CartItem) => {
    if (selectedCartItems.some(i => i.id === item.id && i.type === item.type)) {
      setSelectedCartItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
    } else {
      setSelectedCartItems(prev => [...prev, item]);
    }
  };
  
  const isItemSelected = (item: CartItem) => {
    return selectedCartItems.some(i => i.id === item.id && i.type === item.type);
  };
  
  return (
    <DashboardLayout title="Meme Creation">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Generate a Meme</h2>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Info className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-medium text-lg mb-2">Your Cart is Empty</h3>
              <p className="text-muted-foreground mb-4">
                Add posts or comments to your cart first to use them as meme inspiration.
              </p>
              <Button variant="outline" asChild>
                <a href="/content-analysis">Browse Content</a>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Label htmlFor="prompt" className="mb-2 block">Prompt</Label>
                <Textarea 
                  id="prompt" 
                  placeholder="Describe your meme here..."
                  value={config.prompt}
                  onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="style" className="mb-2 block">Style</Label>
                  <Select
                    value={config.style}
                    onValueChange={(style: string) => 
                      setConfig(prev => ({ ...prev, style }))
                    }
                  >
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ratio" className="mb-2 block">Aspect Ratio</Label>
                  <Select
                    value={config.ratio}
                    onValueChange={(ratio: string) => 
                      setConfig(prev => ({ ...prev, ratio }))
                    }
                  >
                    <SelectTrigger id="ratio">
                      <SelectValue placeholder="Select ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="4:5">Portrait (4:5)</SelectItem>
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mb-6">
                <Label htmlFor="text-position" className="mb-2 block">Text Position</Label>
                <Select
                  value={config.textPosition}
                  onValueChange={(textPosition: string) => 
                    setConfig(prev => ({ ...prev, textPosition }))
                  }
                >
                  <SelectTrigger id="text-position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="none">No Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">Selected Items from Cart</h3>
                <Tabs defaultValue="posts">
                  <TabsList className="mb-2">
                    <TabsTrigger value="posts">Posts ({postItems.length})</TabsTrigger>
                    <TabsTrigger value="comments">Comments ({commentItems.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="posts">
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-2">
                        {postItems.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">No posts in cart</p>
                        ) : (
                          postItems.map((item) => {
                            const post = item.data as InstagramPost;
                            return (
                              <div 
                                key={item.id}
                                className={`p-2 border rounded-md flex items-start gap-2 cursor-pointer ${
                                  isItemSelected(item) ? 'bg-primary/10 border-primary' : ''
                                }`}
                                onClick={() => toggleItemSelection(item)}
                              >
                                <Checkbox 
                                  checked={isItemSelected(item)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">@{post.ownerUsername}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {post.caption || "(No caption)"}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="comments">
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-2">
                        {commentItems.length === 0 ? (
                          <p className="text-muted-foreground text-center py-4">No comments in cart</p>
                        ) : (
                          commentItems.map((item) => {
                            const comment = item.data as EngagementData;
                            return (
                              <div 
                                key={item.id}
                                className={`p-2 border rounded-md flex items-start gap-2 cursor-pointer ${
                                  isItemSelected(item) ? 'bg-primary/10 border-primary' : ''
                                }`}
                                onClick={() => toggleItemSelection(item)}
                              >
                                <Checkbox 
                                  checked={isItemSelected(item)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">@{comment.username}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {comment.commentText}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleGenerate}
                disabled={!config.prompt || generatingMemes.length > 0 || selectedCartItems.length === 0}
              >
                {generatingMemes.length > 0 ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Generate Meme
                  </>
                )}
              </Button>
            </>
          )}
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Generated Memes</h2>
            {memes.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => window.confirm('Delete all memes?') && deleteMeme(memes[0].id)}
              >
                Clear All
              </Button>
            )}
          </div>
          
          {generatingMemes.length > 0 && (
            <div className="border border-dashed p-4 rounded-lg mb-4 flex flex-col items-center justify-center">
              <Loader className="animate-spin h-8 w-8 mb-2" />
              <p>Generating your meme...</p>
            </div>
          )}
          
          <div className="grid gap-4">
            {memes.length === 0 && generatingMemes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No memes generated yet. Create your first meme!
              </div>
            ) : (
              memes.map((meme) => (
                <div key={meme.id} className="border rounded-lg overflow-hidden">
                  <img 
                    src={meme.imageUrl} 
                    alt="Generated meme" 
                    className="w-full h-auto"
                  />
                  <div className="p-3 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {new Date(meme.timestamp).toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = meme.imageUrl;
                          link.download = `meme-${meme.id}.jpg`;
                          link.click();
                        }}
                      >
                        Download
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteMeme(meme.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-sm font-medium">Prompt:</p>
                    <p className="text-sm text-muted-foreground">{meme.config.prompt}</p>
                    
                    {/* Display source materials if available */}
                    {(meme.sourcePost || meme.sourceComment) && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm font-medium">Based on:</p>
                        {meme.sourcePost && (
                          <p className="text-xs text-muted-foreground">
                            Post from @{meme.sourcePost.ownerUsername}
                          </p>
                        )}
                        {meme.sourceComment && (
                          <p className="text-xs text-muted-foreground">
                            Comment by @{meme.sourceComment.username}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemeCreation;
