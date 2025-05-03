
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { useMeme } from '@/contexts/MemeContext';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Download, Image, Loader, ZoomIn, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { InstagramPost, EngagementData, MemeConfig } from '@/types';

const MemeCreation = () => {
  const { posts, engagementData, hasData } = useData();
  const { memes, generatingMemes, generateMeme, deleteMeme } = useMeme();
  
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [selectedComment, setSelectedComment] = useState<EngagementData | null>(null);
  const [memeConfig, setMemeConfig] = useState<MemeConfig>({
    about: '',
    captionStyle: 'funny',
    customization: ''
  });
  const [fullscreenMeme, setFullscreenMeme] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter posts and comments based on search term
  const filteredPosts = posts.filter(post => 
    post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.ownerUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredComments = engagementData.filter(comment => 
    comment.commentText.toLowerCase().includes(searchTerm.toLowerCase()) || 
    comment.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.influencer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleMemeGeneration = () => {
    if (!memeConfig.about) {
      return;
    }
    
    generateMeme(memeConfig, selectedPost, selectedComment);
  };

  if (!hasData) {
    return (
      <DashboardLayout title="Meme Creation">
        <div className="text-center space-y-4 max-w-lg mx-auto py-12">
          <div className="h-24 w-24 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Image className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">No Data Available</h2>
          <p className="text-muted-foreground">
            Please upload your Instagram data first to create memes.
          </p>
          <Button asChild className="bg-instagram-primary hover:bg-instagram-primary/90">
            <a href="/upload">Upload Data</a>
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout title="Meme Creation">
      <div className="space-y-6">
        <Tabs defaultValue="create">
          <TabsList className="mb-4">
            <TabsTrigger value="create">Create Meme</TabsTrigger>
            <TabsTrigger value="gallery">Meme Gallery {memes.length > 0 && `(${memes.length})`}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Meme Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="about">What should the meme be about?</Label>
                    <Textarea 
                      id="about"
                      placeholder="Describe what you want the meme to be about..."
                      value={memeConfig.about}
                      onChange={(e) => setMemeConfig({...memeConfig, about: e.target.value})}
                      className="h-32"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="captionStyle">Caption Style</Label>
                    <select 
                      id="captionStyle"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={memeConfig.captionStyle}
                      onChange={(e) => setMemeConfig({...memeConfig, captionStyle: e.target.value})}
                    >
                      <option value="funny">Funny</option>
                      <option value="sarcastic">Sarcastic</option>
                      <option value="motivational">Motivational</option>
                      <option value="dramatic">Dramatic</option>
                      <option value="minimalist">Minimalist</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="customization">Additional Customization</Label>
                    <Input 
                      id="customization"
                      placeholder="Any specific elements or style requests..."
                      value={memeConfig.customization}
                      onChange={(e) => setMemeConfig({...memeConfig, customization: e.target.value})}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleMemeGeneration}
                    className="w-full bg-instagram-primary hover:bg-instagram-primary/90"
                    disabled={!memeConfig.about}
                  >
                    Generate Meme
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Source Content (Optional)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select a post or comment to use as inspiration
                    </p>
                    
                    <div>
                      <Input 
                        placeholder="Search posts and comments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                      />
                      
                      <Tabs defaultValue="posts">
                        <TabsList className="w-full">
                          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
                          <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="posts" className="max-h-64 overflow-y-auto mt-2">
                          <div className="space-y-2">
                            {filteredPosts.map(post => (
                              <div 
                                key={post.id}
                                className={`p-2 rounded-lg cursor-pointer ${selectedPost?.id === post.id ? 'bg-primary/20 border border-primary/50' : 'hover:bg-muted'}`}
                                onClick={() => {
                                  setSelectedPost(post);
                                  setSelectedComment(null);
                                }}
                              >
                                <div className="font-medium">@{post.ownerUsername}</div>
                                <div className="text-sm truncate">{post.caption || '(No caption)'}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(post.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="comments" className="max-h-64 overflow-y-auto mt-2">
                          <div className="space-y-2">
                            {filteredComments.map(comment => (
                              <div 
                                key={comment.id}
                                className={`p-2 rounded-lg cursor-pointer ${selectedComment?.id === comment.id ? 'bg-primary/20 border border-primary/50' : 'hover:bg-muted'}`}
                                onClick={() => {
                                  setSelectedComment(comment);
                                  setSelectedPost(null);
                                }}
                              >
                                <div className="font-medium">@{comment.username}</div>
                                <div className="text-sm truncate">{comment.commentText}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {comment.datetime}
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                  
                  {(selectedPost || selectedComment) && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm font-medium">Selected Source:</div>
                      {selectedPost && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Post by </span>
                          @{selectedPost.ownerUsername}
                        </div>
                      )}
                      {selectedComment && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Comment by </span>
                          @{selectedComment.username}
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setSelectedPost(null);
                          setSelectedComment(null);
                        }}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Currently Generating Memes */}
            {generatingMemes.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">
                  Generating Memes ({generatingMemes.length})
                </h2>
                <div className="space-y-4">
                  {generatingMemes.map(id => (
                    <div key={id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <div className="animate-spin">
                        <Loader className="h-4 w-4" />
                      </div>
                      <div className="flex-grow">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">Processing...</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            {/* Recently Generated Memes */}
            {memes.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">
                  Recently Generated ({memes.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {memes.slice(0, 8).map(meme => (
                    <div key={meme.id} className="border rounded-lg overflow-hidden">
                      <img 
                        src={meme.imageUrl} 
                        alt="Generated meme" 
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-3 bg-muted/10">
                        <p className="text-sm truncate">{meme.config.about}</p>
                        <div className="flex mt-2 space-x-2 justify-between">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setFullscreenMeme(meme.imageUrl)}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = meme.imageUrl;
                              link.download = `meme-${meme.id}.jpg`;
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="gallery">
            <Card>
              <div className="p-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl font-bold">All Generated Memes</h2>
                {memes.length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Create a zip file with all memes
                      console.log("Downloading all memes");
                    }}
                    className="whitespace-nowrap"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                )}
              </div>
              
              {memes.length === 0 ? (
                <div className="py-12 text-center">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No memes generated yet</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Switch to the Create tab to generate your first meme.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                  {memes.map(meme => (
                    <div key={meme.id} className="border rounded-lg overflow-hidden">
                      <img 
                        src={meme.imageUrl} 
                        alt="Generated meme" 
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-3">
                        <p className="text-sm truncate font-medium">{meme.config.about}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(meme.timestamp).toLocaleString()}
                        </p>
                        <div className="flex mt-2 space-x-2 justify-between">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogTitle>Edit Meme</DialogTitle>
                              <div className="space-y-4 mt-4">
                                <div>
                                  <Label htmlFor="edit-about">What should the meme be about?</Label>
                                  <Textarea 
                                    id="edit-about"
                                    defaultValue={meme.config.about}
                                    className="h-32"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-style">Caption Style</Label>
                                  <select 
                                    id="edit-style"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    defaultValue={meme.config.captionStyle}
                                  >
                                    <option value="funny">Funny</option>
                                    <option value="sarcastic">Sarcastic</option>
                                    <option value="motivational">Motivational</option>
                                    <option value="dramatic">Dramatic</option>
                                    <option value="minimalist">Minimalist</option>
                                  </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button className="bg-instagram-primary">Regenerate</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFullscreenMeme(meme.imageUrl)}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = meme.imageUrl;
                              link.download = `meme-${meme.id}.jpg`;
                              link.click();
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Fullscreen Image Modal */}
      {fullscreenMeme && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenMeme(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img 
              src={fullscreenMeme} 
              alt="Fullscreen meme" 
              className="max-w-full max-h-[90vh] object-contain" 
            />
            <div className="mt-4 flex justify-center space-x-4">
              <Button 
                variant="outline" 
                className="bg-white/10 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  const link = document.createElement('a');
                  link.href = fullscreenMeme;
                  link.download = `meme-${Date.now()}.jpg`;
                  link.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 text-white"
                onClick={() => setFullscreenMeme(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MemeCreation;
