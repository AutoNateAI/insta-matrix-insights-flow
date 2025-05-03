
import React, { createContext, useContext, useState } from 'react';
import { GeneratedMeme, MemeConfig, InstagramPost, EngagementData } from '../types';
import { toast } from 'sonner';

interface MemeContextType {
  memes: GeneratedMeme[];
  generatingMemes: string[];
  generateMeme: (config: MemeConfig, sourcePost?: InstagramPost, sourceComment?: EngagementData) => Promise<void>;
  deleteMeme: (id: string) => void;
  clearMemes: () => void;
}

const MemeContext = createContext<MemeContextType | null>(null);

// Mock function to simulate meme generation
const mockGenerateMeme = async (config: MemeConfig): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a placeholder image URL
  return `https://picsum.photos/800/600?random=${Math.random()}`;
};

export const MemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memes, setMemes] = useState<GeneratedMeme[]>([]);
  const [generatingMemes, setGeneratingMemes] = useState<string[]>([]);

  const generateMeme = async (
    config: MemeConfig,
    sourcePost?: InstagramPost,
    sourceComment?: EngagementData
  ) => {
    const memeId = `meme-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Add to generating list
    setGeneratingMemes(prev => [...prev, memeId]);
    
    try {
      // Mock API call to generate meme
      const imageUrl = await mockGenerateMeme(config);
      
      // Create new meme object
      const newMeme: GeneratedMeme = {
        id: memeId,
        imageUrl,
        config,
        timestamp: new Date().toISOString(),
        sourcePost,
        sourceComment
      };
      
      // Add to memes list
      setMemes(prev => [...prev, newMeme]);
      toast.success('Meme generated successfully');
    } catch (error) {
      toast.error('Failed to generate meme');
      console.error('Meme generation error:', error);
    } finally {
      // Remove from generating list
      setGeneratingMemes(prev => prev.filter(id => id !== memeId));
    }
  };

  const deleteMeme = (id: string) => {
    setMemes(prev => prev.filter(meme => meme.id !== id));
    toast.info('Meme deleted');
  };

  const clearMemes = () => {
    setMemes([]);
    toast.info('All memes cleared');
  };

  return (
    <MemeContext.Provider
      value={{
        memes,
        generatingMemes,
        generateMeme,
        deleteMeme,
        clearMemes
      }}
    >
      {children}
    </MemeContext.Provider>
  );
};

export const useMeme = () => {
  const context = useContext(MemeContext);
  if (!context) {
    throw new Error('useMeme must be used within a MemeProvider');
  }
  return context;
};
