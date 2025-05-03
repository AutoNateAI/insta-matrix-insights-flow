
import { useState, useEffect } from 'react';
import { NetworkNode, NetworkData, InstagramPost } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useCart } from '@/contexts/CartContext';

interface NetworkNodeDetailsProps {
  node: NetworkNode;
  networkData: NetworkData;
  onClose: () => void;
}

const NetworkNodeDetails = ({ node, networkData, onClose }: NetworkNodeDetailsProps) => {
  const { addToCart, isInCart } = useCart();
  const [connections, setConnections] = useState<
    { id: string; type: string; label: string; relationship: string }[]
  >([]);

  // Calculate connections for the selected node
  useEffect(() => {
    const nodeConnections = networkData.links
      .filter(link => link.source === node.id || link.target === node.id)
      .map(link => {
        const isSource = link.source === node.id;
        const connectedNodeId = isSource ? link.target : link.source;
        const connectedNode = networkData.nodes.find(n => n.id === connectedNodeId);
        
        if (!connectedNode) return null;
        
        const relationship = isSource 
          ? `${node.type} → ${connectedNode.type}`
          : `${connectedNode.type} → ${node.type}`;
          
        return {
          id: connectedNodeId as string,
          type: connectedNode.type,
          label: connectedNode.label,
          relationship
        };
      })
      .filter(Boolean) as { id: string; type: string; label: string; relationship: string }[];
      
    setConnections(nodeConnections);
  }, [node, networkData]);

  const getBadgeColorClass = (type: string) => {
    switch(type) {
      case 'influencer': return 'bg-[#E7305B]/20 text-[#E7305B]';
      case 'post': return 'bg-[#6C5DD3]/20 text-[#6C5DD3]';
      case 'commenter': return 'bg-[#3ABFF8]/20 text-[#3ABFF8]';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const addNodeToCart = () => {
    if (node.type === 'post') {
      // For demo purposes, we'll create a mock post
      // In a real app, you'd have actual post data from your context
      const mockPost: InstagramPost = {
        id: node.id.replace('post-', ''),
        inputUrl: '',
        type: 'post',
        shortCode: node.label,
        caption: `Post by ${node.label}`,
        hashtags: [],
        mentions: [],
        url: '',
        commentsCount: connections.filter(c => c.type === 'commenter').length,
        firstComment: '',
        latestComments: [],
        likesCount: Math.floor(Math.random() * 100) + 1,
        timestamp: new Date().toISOString(),
        childPosts: [],
        ownerFullName: '',
        ownerUsername: connections.find(c => c.type === 'influencer')?.label || '',
        ownerId: '',
        isSponsored: false,
        taggedUsers: []
      };
      
      addToCart({
        id: node.id,
        type: 'post',
        data: mockPost
      });
    }
  };

  return (
    <div className="h-full border rounded-md bg-slate-50 overflow-auto">
      <div className="sticky top-0 bg-slate-50 p-4 border-b z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg capitalize">
              {node.type}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColorClass(node.type)}`}>
                {node.type}
              </span>
              <p className="text-sm">
                {node.type === "post" ? "ID" : "@"}{node.label}
              </p>
            </div>
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
            <span className="font-medium">Connections:</span> {connections.length}
          </p>
        </div>
        
        {/* Add to cart button for posts */}
        {node.type === 'post' && (
          <div className="mt-3">
            <Button 
              size="sm"
              variant="outline"
              onClick={addNodeToCart}
              disabled={isInCart(node.id, 'post')}
            >
              {isInCart(node.id, 'post') ? 'In Cart' : 'Add to Cart'}
            </Button>
          </div>
        )}
      </div>
      
      {/* Connections table */}
      <div className="p-4">
        <h4 className="font-medium mb-2">Connected Nodes</h4>
        
        {connections.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Relationship</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColorClass(connection.type)}`}>
                      {connection.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    {connection.type === 'post' ? connection.label : `@${connection.label}`}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {connection.relationship}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-4">No connections found</p>
        )}
      </div>
    </div>
  );
};

export default NetworkNodeDetails;
