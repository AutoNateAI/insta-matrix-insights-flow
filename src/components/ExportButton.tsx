
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface ExportButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const ExportButton = ({ className, variant = "outline" }: ExportButtonProps) => {
  const { exportReport } = useData();
  
  const handleExport = () => {
    exportReport();
    toast.success("Report exported successfully");
  };
  
  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleExport}
    >
      <Download className="h-4 w-4 mr-2" />
      Export Report
    </Button>
  );
};

export default ExportButton;
