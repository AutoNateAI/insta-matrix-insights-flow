
import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader } from 'lucide-react';
import * as d3 from 'd3';
import { NetworkNode, NetworkLink } from '@/types';

// Add d3 dependency
<lov-add-dependency>d3@7.8.5</lov-add-dependency>

const NetworkAnalysis = () => {
  const { networkData, hasData, isLoading } = useData();
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Function to render the network graph using D3
  const renderNetworkGraph = () => {
    if (!networkData || !svgRef.current || networkData.nodes.length === 0) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 600; // Fixed height
    
    // Set SVG height
    svg.attr("height", height);

    // Create a force simulation
    const simulation = d3.forceSimulation(networkData.nodes)
      .force("link", d3.forceLink(networkData.links).id(d => (d as NetworkNode).id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));

    // Create links
    const links = svg.append("g")
      .selectAll("line")
      .data(networkData.links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value));

    // Define color scale for node types
    const colorScale = d3.scaleOrdinal<string>()
      .domain(["influencer", "post", "commenter"])
      .range(["#E7305B", "#6C5DD3", "#3ABFF8"]);

    // Create node groups
    const nodes = svg.append("g")
      .selectAll(".node")
      .data(networkData.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .on("mouseover", function(event, d) {
        // Show tooltip
        if (!tooltipRef.current) return;
        
        const tooltip = d3.select(tooltipRef.current);
        tooltip.style("display", "block")
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
          
        tooltip.select(".tooltip-type").text(d.type);
        tooltip.select(".tooltip-label").text(d.label);
      })
      .on("mouseout", function() {
        // Hide tooltip
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style("display", "none");
        }
      })
      .on("click", function(_, d) {
        setSelectedNode(d);
      })
      .call(d3.drag<SVGGElement, NetworkNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add circles to nodes
    nodes.append("circle")
      .attr("r", d => d.type === "post" ? 8 : d.type === "influencer" ? 12 : 6)
      .attr("fill", d => colorScale(d.type))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Add labels to nodes
    nodes.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.type === "post" ? "" : "@" + d.label)
      .attr("font-size", "10px")
      .attr("fill", "#666");

    // Update positions on each tick
    simulation.on("tick", () => {
      links
        .attr("x1", d => (d.source as NetworkNode).x!)
        .attr("y1", d => (d.source as NetworkNode).y!)
        .attr("x2", d => (d.target as NetworkNode).x!)
        .attr("y2", d => (d.target as NetworkNode).y!);

      nodes
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Functions to handle dragging
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
  };

  // Render graph when data is available
  useEffect(() => {
    renderNetworkGraph();
  }, [networkData]);

  // Update graph on window resize
  useEffect(() => {
    const handleResize = () => {
      renderNetworkGraph();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [networkData]);

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
        
        {/* Tooltip */}
        <div 
          ref={tooltipRef} 
          className="absolute hidden bg-white border border-gray-200 rounded-md shadow-lg p-2 pointer-events-none z-50"
          style={{ minWidth: '150px' }}
        >
          <div className="text-xs text-muted-foreground capitalize tooltip-type"></div>
          <div className="font-medium tooltip-label"></div>
        </div>
        
        {/* D3 Network Graph */}
        <div className="border rounded-md bg-slate-50 relative">
          <svg ref={svgRef} width="100%" className="overflow-visible"></svg>
          
          {!networkData || networkData.nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground">No network data available.</p>
            </div>
          ) : null}
        </div>
        
        {/* Selected Node Details */}
        {selectedNode && (
          <div className="mt-6 p-4 border rounded-md bg-slate-50">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg capitalize">{selectedNode.type}</h3>
                <p className="text-muted-foreground mb-2">
                  {selectedNode.type === "post" ? "Post ID" : "Username"}: {selectedNode.label}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedNode(null)}
              >
                Close
              </Button>
            </div>
            
            {/* Connection stats */}
            {networkData && (
              <div className="mt-2">
                <p>
                  <span className="font-medium">Connections:</span> {
                    networkData.links.filter(link => 
                      link.source === selectedNode.id || 
                      link.target === selectedNode.id
                    ).length
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default NetworkAnalysis;
