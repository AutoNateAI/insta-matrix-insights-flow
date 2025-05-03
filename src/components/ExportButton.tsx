
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface ExportButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  filteredData?: any[];
  dataType?: 'all' | 'posts' | 'comments' | 'network' | 'hashtags' | 'timing';
  filename?: string;
}

const ExportButton = ({ 
  className, 
  variant = "outline", 
  filteredData,
  dataType = 'all',
  filename
}: ExportButtonProps) => {
  const { exportReport } = useData();
  
  const handleExport = () => {
    // If filtered data is provided, export just that data with the specified type
    if (filteredData) {
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        dataType,
        data: filteredData
      };
      
      // Create a JSON blob and trigger download
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `instagram-${dataType}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${dataType} data exported successfully`);
    } else {
      // Use the context's exportReport function for full exports
      exportReport();
      toast.success("Full report exported successfully");
    }
  };
  
  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleExport}
    >
      <Download className="h-4 w-4 mr-2" />
      {dataType === 'all' ? 'Export Report' : `Export ${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`}
    </Button>
  );
};

export default ExportButton;
