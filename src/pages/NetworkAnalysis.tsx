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

// Add d3 dependency
<lov-add-dependency>d3@7.8.5</lov-add-dependency>

const NetworkAnalysis = () => {
  const { networkData, hasData, isLoading } = useData();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [forceStrength, setForceStrength] = useState<number>(-200);
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string>("all");
  const [filteredData, setFilteredData] = useState(networkData);
  
  // Apply filters to network data
  useEffect(() => {
    if (!networkData) return;
    
    if (nodeTypeFilter === "all") {
      setFilteredData(networkData);
      return;
    }
    
    // Filter nodes by type
    const filteredNodes = networkData.nodes.filter(node => node.type === nodeTypeFilter);
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
    
    // Keep only links that connect to filtered nodes
    const filteredLinks = networkData.links.filter(link => 
      filteredNodeIds.has(link.source as string) || filteredNodeIds.has(link.target as string)
    );
    
    setFilteredData({
      nodes: filteredNodes,
      links: filteredLinks
    });
  }, [networkData, nodeTypeFilter]);
  
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

  return (
    <DashboardLayout title="Network Analysis">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">Connection Network</h2>
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
        
        {/* Network Graph */}
        <div className="border rounded-md bg-slate-50 relative overflow-hidden h-[600px]">
          <NetworkGraph 
            data={filteredData || { nodes: [], links: [] }} 
            onSelectNode={setSelectedNode}
            height={580}
          />
        </div>
        
        {/* Selected Node Details */}
        {selectedNode && networkData && (
          <NetworkNodeDetails 
            node={selectedNode} 
            networkData={networkData} 
            onClose={() => setSelectedNode(null)} 
          />
        )}
      </Card>
    </DashboardLayout>
  );
};

export default NetworkAnalysis;
