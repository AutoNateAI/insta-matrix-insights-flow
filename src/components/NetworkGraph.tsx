
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { NetworkData, NetworkNode, NetworkLink } from '@/types';

interface NetworkGraphProps {
  data: NetworkData;
  onSelectNode: (node: NetworkNode) => void;
  width?: number;
  height?: number;
}

interface SimulationNode extends NetworkNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

const NetworkGraph = ({ data, onSelectNode, height = 600 }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Function to render the network graph using D3
  const renderNetworkGraph = () => {
    if (!data || !svgRef.current || data.nodes.length === 0) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    
    // Set SVG height
    svg.attr("height", height);

    // Create a force simulation
    const simulation = d3.forceSimulation(data.nodes as SimulationNode[])
      .force("link", d3.forceLink(data.links).id(d => (d as NetworkNode).id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));

    // Create links
    const links = svg.append("g")
      .selectAll("line")
      .data(data.links)
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
      .data(data.nodes)
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
        onSelectNode(d);
      })
      .call(d3.drag<SVGGElement, SimulationNode>()
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
        .attr("x1", d => (d.source as SimulationNode).x!)
        .attr("y1", d => (d.source as SimulationNode).y!)
        .attr("x2", d => (d.target as SimulationNode).x!)
        .attr("y2", d => (d.target as SimulationNode).y!);

      nodes
        .attr("transform", d => `translate(${(d as SimulationNode).x},${(d as SimulationNode).y})`);
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
  }, [data]);

  // Update graph on window resize
  useEffect(() => {
    const handleResize = () => {
      renderNetworkGraph();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data]);

  return (
    <div className="relative">
      {/* Tooltip */}
      <div 
        ref={tooltipRef} 
        className="absolute hidden bg-white border border-gray-200 rounded-md shadow-lg p-2 pointer-events-none z-50"
        style={{ minWidth: '150px' }}
      >
        <div className="text-xs text-muted-foreground capitalize tooltip-type"></div>
        <div className="font-medium tooltip-label"></div>
      </div>
      
      <svg ref={svgRef} width="100%" className="overflow-visible"></svg>
      
      {!data || data.nodes.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">No network data available.</p>
        </div>
      ) : null}
    </div>
  );
};

export default NetworkGraph;
