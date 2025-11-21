import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import * as LucideIcons from 'lucide-react';
import iconRegistry from '../icons/iconRegistry';
import '../icons/index'; // Load all icons into registry

// Custom node component with transparent background and icons
const CustomNode = ({ data }) => {
  const Icon = data.icon;
  const iconData = data.iconData;
  
  return (
    <div className="relative group">
      {/* Connection handles - REQUIRED for edges to work */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: 8, height: 8 }}
      />
      
      {/* Node container - transparent with hover effect */}
      <div className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all bg-transparent">
        {/* Icon */}
        <div className="mb-2">
          {iconData ? (
            <img 
              src={`data:image/svg+xml;base64,${iconData}`}
              alt={data.label}
              className="w-12 h-12"
            />
          ) : Icon ? (
            <Icon size={48} className="text-blue-400" />
          ) : (
            <LucideIcons.Box size={48} className="text-gray-400" />
          )}
        </div>
        
        {/* Label */}
        <div className="text-sm font-semibold text-white text-center min-w-[120px]">
          {data.label}
        </div>
        
        {/* Cost */}
        {data.cost && (
          <div className="text-xs text-green-400 mt-1">
            {data.cost}/mo
          </div>
        )}
      </div>
      
      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555', width: 8, height: 8 }}
      />
      
      {/* Tooltip on hover */}
      {data.description && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {data.description}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Universal Dagre layout algorithm - works for any architecture
const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 180;
  const nodeHeight = 120;
  
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 60,      // Tighter vertical spacing
    ranksep: 180,     // Tighter horizontal spacing
    edgesep: 20,
    align: 'UL',
    ranker: 'tight-tree',
  });

  // Analyze ALL edges (solid and dashed) for topology
  const solidEdges = edges.filter(e => !e.style?.strokeDasharray || e.style.strokeDasharray === 'none');
  const dashedEdges = edges.filter(e => e.style?.strokeDasharray && e.style.strokeDasharray !== 'none');
  
  // Count connections for each node
  const outgoingCount = {};
  const incomingCount = {};
  const dashedOutgoing = {};
  const dashedIncoming = {};
  
  solidEdges.forEach(edge => {
    outgoingCount[edge.source] = (outgoingCount[edge.source] || 0) + 1;
    incomingCount[edge.target] = (incomingCount[edge.target] || 0) + 1;
  });
  
  dashedEdges.forEach(edge => {
    dashedOutgoing[edge.source] = (dashedOutgoing[edge.source] || 0) + 1;
    dashedIncoming[edge.target] = (dashedIncoming[edge.target] || 0) + 1;
  });
  
  // Classify nodes by connection patterns (universal, works for any architecture)
  const classifyNode = (node) => {
    const nodeId = node.id;
    const layer = node.data.layer;
    
    // Utility pattern: only has dashed outgoing connections (monitoring, security services)
    if (dashedOutgoing[nodeId] > 0 && !outgoingCount[nodeId] && !incomingCount[nodeId]) {
      return 'utility';
    }
    
    // Infrastructure pattern: only receives connections, networking layer
    if (layer === 'networking' && incomingCount[nodeId] > 0 && !outgoingCount[nodeId]) {
      return 'infrastructure';
    }
    
    // Entry pattern: no solid incoming, has solid outgoing
    if (!incomingCount[nodeId] && outgoingCount[nodeId] > 0) {
      return 'entry';
    }
    
    // Main flow: has both incoming and outgoing solid connections
    if (incomingCount[nodeId] > 0 || outgoingCount[nodeId] > 0) {
      return 'main';
    }
    
    // Isolated: no solid connections at all
    return 'isolated';
  };
  
  const nodeClassifications = {};
  nodes.forEach(node => {
    nodeClassifications[node.id] = classifyNode(node);
  });
  
  // Get nodes by classification
  const mainFlowNodes = nodes.filter(n => 
    nodeClassifications[n.id] === 'main' || 
    nodeClassifications[n.id] === 'entry'
  );
  
  const utilityNodes = nodes.filter(n => nodeClassifications[n.id] === 'utility');
  const infrastructureNodes = nodes.filter(n => nodeClassifications[n.id] === 'infrastructure');
  const isolatedNodes = nodes.filter(n => nodeClassifications[n.id] === 'isolated');

  // Add main flow nodes to Dagre for automatic layout
  mainFlowNodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Only use solid edges between main flow nodes
  solidEdges.forEach(edge => {
    if (mainFlowNodes.find(n => n.id === edge.source) && 
        mainFlowNodes.find(n => n.id === edge.target)) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  // Calculate bounds of main flow for utility positioning
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  mainFlowNodes.forEach(node => {
    const pos = dagreGraph.node(node.id);
    if (pos) {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    }
  });

  // Layout all nodes - first pass for main flow, second pass for utilities
  const layoutedNodes = [];
  
  // First pass: position main flow nodes
  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    if (nodeWithPosition) {
      layoutedNodes.push({
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      });
    }
  });
  
  // Second pass: position utility, infrastructure, and isolated nodes
  nodes.forEach(node => {
    // Skip if already positioned in first pass
    if (layoutedNodes.find(n => n.id === node.id)) return;
    
    const classification = nodeClassifications[node.id];
    
    // Utility nodes - position ABOVE their primary targets (centered)
    if (classification === 'utility') {
      // Find what this utility connects to
      const targets = dashedEdges
        .filter(e => e.source === node.id)
        .map(e => e.target);
      
      if (targets.length > 0) {
        // Calculate average X position of targets for centering
        const targetNodes = layoutedNodes.filter(n => targets.includes(n.id));
        if (targetNodes.length > 0) {
          const avgX = targetNodes.reduce((sum, n) => sum + n.position.x, 0) / targetNodes.length;
          const index = utilityNodes.indexOf(node);
          layoutedNodes.push({
            ...node,
            position: {
              x: avgX, // Centered above targets
              y: minY - 180 - (index * 70), // Stack multiple utilities
            },
          });
          return;
        }
      }
      
      // Fallback: position above left side
      const index = utilityNodes.indexOf(node);
      layoutedNodes.push({
        ...node,
        position: {
          x: minX + index * 220,
          y: minY - 180,
        },
      });
      return;
    }
    
    // Infrastructure nodes - position BELOW main flow (VPCs, networks)
    if (classification === 'infrastructure') {
      const index = infrastructureNodes.indexOf(node);
      layoutedNodes.push({
        ...node,
        position: {
          x: minX + index * 220,
          y: maxY + 200, // Below main flow
        },
      });
      return;
    }
    
    // Isolated nodes - position to the right
    if (classification === 'isolated') {
      const index = isolatedNodes.indexOf(node);
      layoutedNodes.push({
        ...node,
        position: {
          x: maxX + 300,
          y: minY + index * 140,
        },
      });
      return;
    }
    
    // Fallback
    layoutedNodes.push({
      ...node,
      position: { x: 0, y: 0 },
    });
  });

  return { nodes: layoutedNodes, edges };
};

export default function ArchitectureDiagram({ data }) {
  const [hoveredEdge, setHoveredEdge] = React.useState(null);
  
  if (!data || !data.nodes || !data.connections) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No diagram data available
      </div>
    );
  }

  // Convert our data format to ReactFlow format
  const initialNodes = useMemo(() => {
    return data.nodes.map(node => {
      // Get icon
      let iconComponent = null;
      let iconData = null;
      
      if (node.service && data.provider && data.provider !== 'multi-cloud') {
        iconData = iconRegistry.getIcon(data.provider, node.service);
        if (!iconData) {
          console.log(`Icon not found for ${data.provider}/${node.service}`);
        }
      }
      
      if (!iconData && node.icon) {
        iconComponent = LucideIcons[node.icon];
      }
      
      return {
        id: node.id,
        type: 'custom',
        data: {
          label: node.label,
          cost: node.cost,
          description: node.description,
          icon: iconComponent,
          iconData: iconData,
          layer: node.layer,
        },
        position: { x: 0, y: 0 }, // Will be set by layout
        sourcePosition: Position.Right,  // CRITICAL for edges
        targetPosition: Position.Left,   // CRITICAL for edges
      };
    });
  }, [data]);

  const initialEdges = useMemo(() => {
    // Filter out non-connection fields and ensure valid connections
    const validConnections = (data.connections || []).filter(conn => 
      conn && conn.from && conn.to && typeof conn === 'object' && !Array.isArray(conn)
    );
    
    return validConnections.map((conn, idx) => ({
      id: `e${idx}-${conn.from}-${conn.to}`,
      source: conn.from,
      target: conn.to,
      data: { label: conn.label }, // Store label in data for tooltip
      type: 'smoothstep',
      animated: false,
      style: { 
        stroke: conn.type === 'dashed' ? '#6366f1' : '#22c55e',
        strokeWidth: 2,
        strokeDasharray: conn.type === 'dashed' ? '5,5' : 'none',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: conn.type === 'dashed' ? '#6366f1' : '#22c55e',
      },
      // No visible label - will show on hover/click
    }));
  }, [data]);

  // Apply dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Re-layout when data changes
  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-slate-900 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeMouseEnter={(event, edge) => setHoveredEdge(edge)}
        onEdgeMouseLeave={() => setHoveredEdge(null)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        attributionPosition="bottom-left"
        className="bg-slate-900"
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background color="#475569" gap={16} />
        <Controls className="bg-slate-800 border-slate-700" />
        <MiniMap 
          className="bg-slate-800 border-slate-700"
          nodeColor={(node) => {
            const layerColors = {
              networking: '#06B6D4',
              presentation: '#3B82F6',
              application: '#8B5CF6',
              data: '#10B981',
              operations: '#F59E0B',
              security: '#EF4444',
            };
            return layerColors[node.data.layer] || '#6366f1';
          }}
        />
      </ReactFlow>
      
      {/* Edge label tooltip on hover */}
      {hoveredEdge && hoveredEdge.data?.label && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-900 text-white text-sm rounded shadow-lg z-50 pointer-events-none">
          {hoveredEdge.data.label}
        </div>
      )}
    </div>
  );
}
