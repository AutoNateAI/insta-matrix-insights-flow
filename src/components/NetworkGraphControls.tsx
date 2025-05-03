
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface NetworkGraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  forceStrength: number;
  onForceStrengthChange: (value: number[]) => void;
  nodeType: string;
  onNodeTypeChange: (type: string) => void;
  nodeTypes: string[];
}

const NetworkGraphControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
  forceStrength,
  onForceStrengthChange,
  nodeType,
  onNodeTypeChange,
  nodeTypes
}: NetworkGraphControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 p-3 bg-slate-100 rounded-md mb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col min-w-[200px]">
        <Label htmlFor="force-strength" className="mb-1 text-sm">Force Strength</Label>
        <Slider 
          id="force-strength"
          value={[forceStrength]} 
          onValueChange={onForceStrengthChange}
          min={-500}
          max={0}
          step={10}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <select
          value={nodeType}
          onChange={(e) => onNodeTypeChange(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value="all">All Node Types</option>
          {nodeTypes.map(type => (
            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}s</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default NetworkGraphControls;
