
import { NetworkNode, NetworkData } from '@/types';
import { Button } from '@/components/ui/button';

interface NetworkNodeDetailsProps {
  node: NetworkNode;
  networkData: NetworkData;
  onClose: () => void;
}

const NetworkNodeDetails = ({ node, networkData, onClose }: NetworkNodeDetailsProps) => {
  // Calculate connections for the selected node
  const connections = networkData.links.filter(link => 
    link.source === node.id || 
    link.target === node.id
  ).length;

  return (
    <div className="mt-6 p-4 border rounded-md bg-slate-50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg capitalize">{node.type}</h3>
          <p className="text-muted-foreground mb-2">
            {node.type === "post" ? "Post ID" : "Username"}: {node.label}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
        >
          Close
        </Button>
      </div>
      
      {/* Connection stats */}
      <div className="mt-2">
        <p>
          <span className="font-medium">Connections:</span> {connections}
        </p>
      </div>
    </div>
  );
};

export default NetworkNodeDetails;
