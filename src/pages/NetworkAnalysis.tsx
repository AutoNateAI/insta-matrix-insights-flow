import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { NetworkNode } from '@/types';
import NetworkGraph from '@/components/NetworkGraph';
import NetworkNodeDetails from '@/components/NetworkNodeDetails';
import NetworkGraphControls from '@/components/NetworkGraphControls';

// D3 dependency is already installed

const NetworkAnalysis = () => {
  const { networkData, hasData, isLoading } = useData();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [forceStrength, setForceStrength] = useState<number>(-200);
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string>("all");
  const [viewType, setViewType] = useState<string>("all");
  const [filteredData, setFilteredData] = useState(networkData);
  
  // Apply filters to network data
  useEffect(() => {
    if (!networkData) return;
    
    // First apply node type filter
    let nodes = [...networkData.nodes];
    let links = [...networkData.links];
    
    // Filter nodes by type
    if (nodeTypeFilter !== "all") {
      nodes = networkData.nodes.filter(node => node.type === nodeTypeFilter);
      const filteredNodeIds = new Set(nodes.map(node => node.id));
      
      // Keep only links that connect to filtered nodes
      links = networkData.links.filter(link => 
        filteredNodeIds.has(link.source as string) || filteredNodeIds.has(link.target as string)
      );
    }
    
    // Then apply view type filter
    if (viewType !== "all") {
      if (viewType === "influencer-post") {
        // Only keep influencers and posts
        nodes = nodes.filter(node => node.type === "influencer" || node.type === "post");
        // Keep links connecting influencers to posts
        links = links.filter(link => {
          const sourceNode = networkData.nodes.find(n => n.id === link.source);
          const targetNode = networkData.nodes.find(n => n.id === link.target);
          return (sourceNode?.type === "influencer" && targetNode?.type === "post") || 
                 (sourceNode?.type === "post" && targetNode?.type === "influencer");
        });
      } else if (viewType === "post-commenter") {
        // Only keep posts and commenters
        nodes = nodes.filter(node => node.type === "post" || node.type === "commenter");
        // Keep links connecting posts to commenters
        links = links.filter(link => {
          const sourceNode = networkData.nodes.find(n => n.id === link.source);
          const targetNode = networkData.nodes.find(n => n.id === link.target);
          return (sourceNode?.type === "post" && targetNode?.type === "commenter") || 
                 (sourceNode?.type === "commenter" && targetNode?.type === "post");
        });
      } else if (viewType === "influencer-commenter") {
        // Create direct links between influencers and commenters
        const influencers = nodes.filter(node => node.type === "influencer");
        const commenters = nodes.filter(node => node.type === "commenter");
        
        // Only keep influencers and commenters
        nodes = [...influencers, ...commenters];
        
        // Create synthetic links
        links = [];
        
        // For each commenter, find posts they commented on and link them to post owner
        networkData.links.forEach(link => {
          const sourceNode = networkData.nodes.find(n => n.id === link.source);
          const targetNode = networkData.nodes.find(n => n.id === link.target);
          
          if (sourceNode?.type === "commenter" && targetNode?.type === "post") {
            // Find the influencer for this post
            const postToInfluencer = networkData.links.find(l => 
              l.target === targetNode.id && 
              networkData.nodes.find(n => n.id === l.source)?.type === "influencer"
            );
            
            if (postToInfluencer) {
              links.push({
                source: sourceNode.id,
                target: postToInfluencer.source,
                value: 1
              });
            }
          }
          
          if (sourceNode?.type === "post" && targetNode?.type === "commenter") {
            // Find the influencer for this post
            const influencerToPost = networkData.links.find(l => 
              l.target === sourceNode.id && 
              networkData.nodes.find(n => n.id === l.source)?.type === "influencer"
            );
            
            if (influencerToPost) {
              links.push({
                source: targetNode.id,
                target: influencerToPost.source,
                value: 1
              });
            }
          }
        });
      }
    }
    
    setFilteredData({
      nodes,
      links
    });
  }, [networkData, nodeTypeFilter, viewType]);
  
  // Handle zoom controls (these would need to be implemented in the NetworkGraph component)
  const handleZoomIn = () => {
    // This is a placeholder - would need D3 zoom implementation
    console.log("Zoom in");
  };
  
  const handleZoomOut = () => {
    // This is a placeholder - would need D3 zoom implementation
    console.log("Zoom out");
  };
  
  const handleReset = () => {
    // Reset graph to initial state
    setSelectedNode(null);
    setForceStrength(-200);
    setNodeTypeFilter("all");
    setViewType("all");
  };

  const handleExportNetworkData = () => {
    if (!filteredData) return;
    
    // Create a JSON blob and trigger download
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportNetworkImage = () => {
    const svgElement = document.querySelector('.network-graph-container svg');
    if (!svgElement) return;
    
    // Use svg-to-png conversion (simplified mock version)
    // In a real app, you'd use a library like svg-to-png or html-to-image
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions - in a real app, get actual dimensions
    canvas.width = 1200;
    canvas.height = 800;
    
    // Create a mock image download (in real implementation, draw SVG to canvas)
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `network-graph-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  if (!hasData) {
    return (
      <DashboardLayout title="Network Analysis">
        <div className="text-center space-y-4 max-w-lg mx-auto py-12">
          <h2 className="text-2xl font-bold">No Data Available</h2>
          <p className="text-muted-foreground">
            Please upload your Instagram data first to view network analysis.
          </p>
          <Button asChild className="bg-instagram-primary hover:bg-instagram-primary/90">
            <Link to="/upload">Upload Data</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Network Analysis">
        <div className="text-center py-12">
          <Loader className="animate-spin h-8 w-8 mx-auto text-primary" />
          <p className="mt-4">Processing data...</p>
        </div>
      </DashboardLayout>
    );
  }

  const nodeTypes = Array.from(new Set(networkData?.nodes.map(node => node.type) || []));
  const viewTypes = [
    { value: "all", label: "All Connections" },
    { value: "influencer-post", label: "Influencers → Posts" },
    { value: "post-commenter", label: "Posts → Commenters" },
    { value: "influencer-commenter", label: "Influencers → Commenters" }
  ];

  return (
    <DashboardLayout title="Network Analysis">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Connection Network</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportNetworkData}
            >
              Export Data
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportNetworkImage}
            >
              Export Image
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Visualize the connections between influencers, posts, and commenters. 
          Drag nodes to rearrange the graph.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#E7305B]"></div>
            <span className="text-sm">Influencers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#6C5DD3]"></div>
            <span className="text-sm">Posts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#3ABFF8]"></div>
            <span className="text-sm">Commenters</span>
          </div>
        </div>
        
        {/* Graph Controls */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <NetworkGraphControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleReset}
              forceStrength={forceStrength}
              onForceStrengthChange={(values) => setForceStrength(values[0])}
              nodeType={nodeTypeFilter}
              onNodeTypeChange={setNodeTypeFilter}
              nodeTypes={nodeTypes}
            />
          </div>
          <div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">View Type:</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
              >
                {viewTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Network Graph Container */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 border rounded-md bg-slate-50 relative overflow-hidden h-[600px]">
            <NetworkGraph 
              data={filteredData || { nodes: [], links: [] }} 
              onSelectNode={setSelectedNode}
              height={580}
            />
          </div>
          
          {/* Node Details Panel */}
          <div className="md:col-span-1">
            {selectedNode ? (
              <NetworkNodeDetails 
                node={selectedNode} 
                networkData={networkData || { nodes: [], links: [] }} 
                onClose={() => setSelectedNode(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center border rounded-md bg-slate-50 p-4">
                <div className="text-center text-muted-foreground">
                  <p>Select a node to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default NetworkAnalysis;
