
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { Loader, Upload, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const FileUploader: React.FC = () => {
  const { loadPosts, isLoading, hasData, clearData } = useData();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      const text = await file.text();
      loadPosts(text);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');
    }
  };

  const handleClearData = () => {
    clearData();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-title">
        <Upload className="card-icon" />
        Upload Instagram Data
      </div>
      
      <div className="mb-4 text-sm text-muted-foreground">
        Upload a JSON file containing Instagram post data to analyze
      </div>
      
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
        
        <div className="mb-4 flex justify-center">
          <Upload className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {file ? file.name : 'Drag and drop or click to select a JSON file'}
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            Select File
          </Button>
          
          {file && (
            <>
              <Button 
                onClick={handleFileUpload} 
                disabled={isLoading}
                className="bg-instagram-primary hover:bg-instagram-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Upload & Analyze</>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setFile(null)}
                disabled={isLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </>
          )}
        </div>
      </div>
      
      {hasData && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={handleClearData}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Clear All Data
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
