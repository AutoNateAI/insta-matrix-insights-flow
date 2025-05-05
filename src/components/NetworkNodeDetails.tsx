
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
import ExportButton from './ExportButton';

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
          <div className="flex space-x-2">
            <ExportButton 
              variant="outline" 
              size="sm" 
              filteredData={connections}
              dataType="network"
              filename={`network-node-${node.id}.json`}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
            >
              Close
            </Button>
          </div>
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
                <TableHead>Action</TableHead>
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
                  <TableCell>
                    {connection.type === 'post' && (
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // Add this post to cart - simplified for demo
                          const mockPost: InstagramPost = {
                            id: connection.id.replace('post-', ''),
                            inputUrl: '',
                            type: 'post',
                            shortCode: connection.label,
                            caption: 'Connected post',
                            hashtags: [],
                            mentions: [],
                            url: '',
                            commentsCount: 0,
                            firstComment: '',
                            latestComments: [],
                            likesCount: Math.floor(Math.random() * 50),
                            timestamp: new Date().toISOString(),
                            childPosts: [],
                            ownerFullName: '',
                            ownerUsername: '',
                            ownerId: '',
                            isSponsored: false,
                            taggedUsers: []
                          };
                          
                          addToCart({
                            id: connection.id,
                            type: 'post',
                            data: mockPost
                          });
                        }}
                        disabled={isInCart(connection.id, 'post')}
                      >
                        {isInCart(connection.id, 'post') ? 'In Cart' : 'Add to Cart'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-4">No connections found</p>
        )}
      </div>

      {/* Visual relationship diagram - simplified for this implementation */}
      <div className="p-4 border-t">
        <h4 className="font-medium mb-2">Relationship Diagram</h4>
        <div className="bg-white p-4 border rounded-md flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${getBadgeColorClass(node.type)}`}>
              <span className="font-medium">{node.type}</span>
            </div>
            <div className="mt-1 text-sm font-medium">{node.label}</div>
          </div>
          
          {connections.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {connections.slice(0, 5).map((connection) => (
                <div key={connection.id} className="flex flex-col items-center mx-4">
                  <div className="relative">
                    <div className="absolute top-[50%] -left-10 w-8 h-0.5 bg-gray-300"></div>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getBadgeColorClass(connection.type)}`}>
                      <span className="font-medium text-xs">{connection.type}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-xs">{connection.label}</div>
                </div>
              ))}
              {connections.length > 5 && (
                <div className="flex flex-col items-center mx-4">
                  <div className="relative">
                    <div className="absolute top-[50%] -left-10 w-8 h-0.5 bg-gray-300"></div>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200">
                      <span className="font-medium text-xs">+{connections.length - 5} more</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkNodeDetails;
