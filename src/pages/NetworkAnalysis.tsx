
import { useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// This component simulates a network graph
// In a real implementation, you would use a library like react-force-graph or visx
const SimpleNetworkGraph = ({ data }: { data: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data || !data.nodes || !data.links) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Setup canvas
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    // Node positions (simplified layout)
    const nodePositions = new Map();
    
    // Assign fixed positions based on type
    data.nodes.forEach((node: any, i: number) => {
      let x, y;
      
      if (node.type === 'influencer') {
        // Place influencers at the top
        const index = data.nodes.filter((n: any) => n.type === 'influencer').indexOf(node);
        x = width * (0.2 + (index % 3) * 0.3);
        y = height * 0.2;
      } else if (node.type === 'post') {
        // Place posts in the middle
        const index = data.nodes.filter((n: any) => n.type === 'post').indexOf(node);
        x = width * (0.1 + (index % 5) * 0.2);
        y = height * 0.5;
      } else {
        // Place commenters at the bottom
        const index = data.nodes.filter((n: any) => n.type === 'commenter').indexOf(node);
        x = width * (0.05 + (index % 10) * 0.1);
        y = height * 0.8;
      }
      
      nodePositions.set(node.id, { x, y });
    });
    
    // Draw links
    ctx.strokeStyle = 'rgba(155, 135, 245, 0.3)';
    ctx.lineWidth = 1;
    
    data.links.forEach((link: any) => {
      const sourcePos = nodePositions.get(link.source);
      const targetPos = nodePositions.get(link.target);
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.stroke();
      }
    });
    
    // Draw nodes
    data.nodes.forEach((node: any) => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;
      
      let color;
      let size;
      
      switch (node.type) {
        case 'influencer':
          color = '#9b87f5';
          size = 12;
          break;
        case 'post':
          color = '#7E69AB';
          size = 8;
          break;
        case 'commenter':
          color = '#6E59A5';
          size = 6;
          break;
        default:
          color = '#cccccc';
          size = 5;
      }
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Add labels for influencers
    ctx.fillStyle = '#000000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    data.nodes.forEach((node: any) => {
      if (node.type === 'influencer') {
        const pos = nodePositions.get(node.id);
        if (!pos) return;
        
        ctx.fillText(node.label, pos.x, pos.y - 15);
      }
    });
    
  }, [data]);
  
  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="w-full h-[400px] border rounded"
    />
  );
};

const NetworkAnalysis = () => {
  const { networkData, hasData, isLoading } = useData();
  
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
  
  return (
    <DashboardLayout title="Network Analysis">
      <div className="grid gap-6">
        <Card className="dashboard-card">
          <h2 className="card-title">Network Graph</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Visualizes connections between influencers, posts, and commenters
          </p>
          <div className="bg-card/50 rounded-lg p-4">
            <SimpleNetworkGraph data={networkData} />
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex justify-center space-x-6 mt-2">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-instagram-primary mr-2"></span>
                Influencers
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-instagram-secondary mr-2"></span>
                Posts
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-instagram-dark mr-2"></span>
                Commenters
              </div>
            </div>
          </div>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="dashboard-card">
            <h2 className="card-title">Network Statistics</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground">Influencers</div>
                  <div className="text-2xl font-bold">
                    {networkData?.nodes.filter(node => node.type === 'influencer').length}
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground">Posts</div>
                  <div className="text-2xl font-bold">
                    {networkData?.nodes.filter(node => node.type === 'post').length}
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground">Commenters</div>
                  <div className="text-2xl font-bold">
                    {networkData?.nodes.filter(node => node.type === 'commenter').length}
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-xs text-muted-foreground">Connections</div>
                  <div className="text-2xl font-bold">
                    {networkData?.links.length}
                  </div>
                </div>
              </div>
              
              <div className="text-sm">
                <p>
                  This network analysis shows how influencers, posts, and commenters are connected.
                  Each link represents an interaction between entities. The more connections, the
                  stronger the relationship between users and content.
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="dashboard-card">
            <h2 className="card-title">Top Connected Accounts</h2>
            <div className="space-y-2">
              {networkData?.nodes
                .filter(node => node.type === 'influencer' || node.type === 'commenter')
                .map(node => ({
                  id: node.id,
                  label: node.label,
                  type: node.type,
                  connectionCount: networkData.links.filter(link => 
                    link.source === node.id || link.target === node.id
                  ).length
                }))
                .sort((a, b) => b.connectionCount - a.connectionCount)
                .slice(0, 10)
                .map((item, index) => (
                  <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor: item.type === 'influencer' 
                            ? '#9b87f5' 
                            : '#6E59A5'
                        }}
                      ></span>
                      <span>
                        @{item.label}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({item.type})
                        </span>
                      </span>
                    </div>
                    <div className="font-medium">{item.connectionCount} connections</div>
                  </div>
                ))
              }
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NetworkAnalysis;
