import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import ELK from "elkjs/lib/elk.bundled.js";
import * as LucideIcons from "lucide-react";
import iconRegistry from "../icons/iconRegistry";
import { useTheme } from "../contexts/ThemeContext";
import "../icons/index"; // Load all icons into registry

const elk = new ELK();

// Custom node component with multi-directional handles for better routing
const CustomNode = ({ data }) => {
  const Icon = data.icon;
  const iconData = data.iconData;
  const { isDark } = useTheme();
  const handleColor = isDark ? '#94a3b8' : '#555';

  // Determine which handles to show based on node type and connections
  const handlePositions = data.handlePositions || {
    top: true,
    bottom: true,
    left: true,
    right: true,
  };

  return (
    <div className="relative group">
      {/* Connection handles - positioned on all sides for optimal routing */}
      {/* Each position has BOTH source and target handles for bidirectional connections */}
      {handlePositions.top && (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            style={{ background: handleColor, width: 8, height: 8 }}
          />
          <Handle
            type="source"
            position={Position.Top}
            id="top"
            style={{ background: handleColor, width: 8, height: 8 }}
          />
        </>
      )}
      {handlePositions.bottom && (
        <>
          <Handle
            type="target"
            position={Position.Bottom}
            id="bottom"
            style={{ background: handleColor, width: 8, height: 8 }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            style={{ background: handleColor, width: 8, height: 8 }}
          />
        </>
      )}
      {handlePositions.left && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            style={{ background: handleColor, width: 8, height: 8 }}
          />
          <Handle
            type="source"
            position={Position.Left}
            id="left"
            style={{ background: handleColor, width: 8, height: 8 }}
          />
        </>
      )}
      {handlePositions.right && (
        <>
          <Handle
            type="target"
            position={Position.Right}
            id="right"
            style={{ background: handleColor, width: 8, height: 8 }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            style={{ background: handleColor, width: 8, height: 8 }}
          />
        </>
      )}

      {/* Node container - transparent with hover effect */}
      <div className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-transparent hover:border-blue-500 transition-all bg-transparent">
        {/* Icon */}
        <div className="mb-2">
          {iconData?.svg ? (
            <img
              src={iconData.svg}
              alt={data.label}
              className="w-12 h-12"
            />
          ) : typeof iconData === 'string' ? (
            <img
              src={iconData}
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
        <div className="text-sm font-semibold text-gray-900 dark:text-white text-center min-w-[120px]">
          {data.label}
        </div>

        {/* Cost */}
        {data.cost && (
          <div className="text-xs text-green-400 mt-1">{data.cost}/mo</div>
        )}
      </div>

      {/* Tooltip on hover */}
      {data.description && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {data.description}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// ELK.js layout algorithm - superior to Dagre with better edge routing and active maintenance
const getLayoutedElements = async (nodes, edges) => {
  console.log('Layout function called with:', { 
    nodeCount: nodes.length, 
    edgeCount: edges.length,
    edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, type: e.edgeType }))
  });
  
  // Classify edges using the edgeType metadata
  const solidEdges = edges.filter((e) => e.edgeType === "solid");
  const dashedEdges = edges.filter((e) => e.edgeType === "dashed");
  
  console.log('Edge classification:', {
    solidCount: solidEdges.length,
    dashedCount: dashedEdges.length,
    dashedEdges: dashedEdges.map(e => ({ source: e.source, target: e.target }))
  });

  // Identify utility nodes: those that ONLY have outgoing dashed edges (no solid connections)
  // OR nodes with NO connections at all (standalone governance like IAM)
  // Also identify DNS nodes (Route 53, etc.) that should appear BEFORE client
  const solidSourceIds = new Set(solidEdges.map((e) => e.source));
  const solidTargetIds = new Set(solidEdges.map((e) => e.target));
  const dashedSourceIds = new Set(dashedEdges.map((e) => e.source));
  const dashedTargetIds = new Set(dashedEdges.map((e) => e.target));
  
  const utilityNodeIds = new Set();
  
  nodes.forEach(node => {
    const hasAnySolid = solidSourceIds.has(node.id) || solidTargetIds.has(node.id);
    const hasAnyDashed = dashedSourceIds.has(node.id) || dashedTargetIds.has(node.id);
    
    // Check if it's a DNS node (Route 53, Cloud DNS, Azure DNS)
    // Node structure: { id, type, data: { label, layer, ... }, position }
    const isDNS = node.id.includes('r53') || node.id.includes('route53') || 
                  node.id.includes('dns') || 
                  node.data?.label?.toLowerCase().includes('route 53') ||
                  node.data?.label?.toLowerCase().includes('cloud dns') ||
                  node.data?.label?.toLowerCase().includes('azure dns');
    
    if (isDNS && !solidTargetIds.has(node.id)) {
      // DNS nodes with no incoming solid edges - they're utility infrastructure
      utilityNodeIds.add(node.id);
      return; // Treat as utility, not main flow
    }
    
    // Utility if: (1) only dashed connections OR (2) no connections at all (standalone)
    if (!hasAnySolid && (hasAnyDashed || !hasAnyDashed)) {
      // Check if it's truly a utility by layer
      const isUtilityLayer = ['security', 'operations'].includes(node.data?.layer);
      
      if (isUtilityLayer || (dashedSourceIds.has(node.id) && !hasAnySolid)) {
        utilityNodeIds.add(node.id);
      }
    }
  });
  
  console.log('Utility nodes identified:', Array.from(utilityNodeIds));

  // Separate main flow and utilities (no separate DNS handling)
  const mainFlowNodes = nodes.filter(n => !utilityNodeIds.has(n.id));
  const utilityNodes = nodes.filter(n => utilityNodeIds.has(n.id));

  // Layout ONLY main flow with ELK (ignore utilities for now)
  const mainElkNodes = mainFlowNodes.map((n) => ({
    id: n.id,
    width: 180,
    height: 120,
  }));

  const mainElkEdges = solidEdges.map((e) => ({
    id: e.id,
    sources: [e.source],
    targets: [e.target],
  }));

  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "100",
      "elk.layered.spacing.nodeNodeBetweenLayers": "150",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.edgeRouting": "ORTHOGONAL",
    },
    children: mainElkNodes,
    edges: mainElkEdges,
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    // Map ELK positions for main flow
    const positionedNodesMap = {};
    layoutedGraph.children.forEach((node) => {
      positionedNodesMap[node.id] = { x: node.x, y: node.y };
    });

    // Calculate bounds
    const positions = Object.values(positionedNodesMap);
    const minY = Math.min(...positions.map((p) => p.y));
    
    // Smart positioning for utilities based on available space and edges
    const utilityPositions = {};
    const occupiedSpaces = []; // Track occupied positions to prevent overlap
    
    // Helper: Check if a position would cross any solid edges
    const wouldCrossEdges = (x, y, targetIds) => {
      return solidEdges.some(edge => {
        const sourcePos = positionedNodesMap[edge.source];
        const targetPos = positionedNodesMap[edge.target];
        if (!sourcePos || !targetPos) return false;
        
        // Check if utility position is between source and target Y coordinates
        const minEdgeY = Math.min(sourcePos.y, targetPos.y);
        const maxEdgeY = Math.max(sourcePos.y, targetPos.y);
        const minEdgeX = Math.min(sourcePos.x, targetPos.x);
        const maxEdgeX = Math.max(sourcePos.x, targetPos.x);
        
        // If utility overlaps with the edge's bounding box, might cross
        return (y >= minEdgeY - 100 && y <= maxEdgeY + 100 && 
                x >= minEdgeX - 100 && x <= maxEdgeX + 100 &&
                !targetIds.includes(edge.source) && !targetIds.includes(edge.target));
      });
    };
    
    utilityNodes.forEach((utilityNode) => {
      // Find all nodes this utility connects to (in either direction).
      // IMPORTANT: The AI sometimes outputs utilities as the *target* (e.g. workload -> Secret Manager).
      // If we only look at outgoing edges, we misclassify utilities as "standalone" and place them far away.
      const connectedNodeIds = dashedEdges
        .filter(e => e.source === utilityNode.id || e.target === utilityNode.id)
        .map(e => (e.source === utilityNode.id ? e.target : e.source));
      
      const connectedPositions = connectedNodeIds
        .map(id => positionedNodesMap[id])
        .filter(Boolean);
      
      let proposedX, proposedY, preferredDirection = 'above';
      
      // Special positioning logic
      const nodeData = nodes.find(n => n.id === utilityNode.id);
      const layer = nodeData?.data?.layer;
      const isOperations = layer === 'operations';
      const isSecurity = layer === 'security';
      const isSecurityInline = isSecurity && connectedNodeIds.length <= 2 && connectedNodeIds.length > 0;
      const isStandalone = connectedNodeIds.length === 0;
      
      if (isStandalone) {
        // Standalone governance nodes (IAM): position at top-center
        const avgX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
        proposedX = avgX + 200;
        proposedY = minY - 180;
        preferredDirection = 'above';
      } else if (isSecurityInline && connectedPositions.length >= 1) {
        // Security nodes (Secret Manager, KMS): keep close to what they secure.
        // Inline placement prevents huge vertical separation when one connected node happens to be high up.
        const avgX = connectedPositions.reduce((sum, p) => sum + p.x, 0) / connectedPositions.length;
        const avgY = connectedPositions.reduce((sum, p) => sum + p.y, 0) / connectedPositions.length;
        proposedX = avgX;
        proposedY = avgY;
        preferredDirection = 'inline';
      } else if (connectedPositions.length > 0) {
        // Smart positioning for utilities.
        // - Operations nodes: keep in a dedicated "top band" above the main flow.
        // - Other utilities: prefer above/below near their connected cluster.
        const avgX = connectedPositions.reduce((sum, p) => sum + p.x, 0) / connectedPositions.length;
        const minConnY = Math.min(...connectedPositions.map(p => p.y));
        const maxConnY = Math.max(...connectedPositions.map(p => p.y));

        if (isOperations) {
          // Always above to avoid getting inserted between main-flow nodes.
          proposedX = avgX;
          proposedY = Math.min(minConnY, minY) - 220;
          preferredDirection = 'above';
        } else {
          // Try above first, then below if it would intersect the main solid-edge envelope.
          let aboveY = minConnY - 180;
          let belowY = maxConnY + 180;

          const crossesAbove = wouldCrossEdges(avgX, aboveY, connectedNodeIds);
          const crossesBelow = wouldCrossEdges(avgX, belowY, connectedNodeIds);
        
          if (!crossesAbove) {
            proposedX = avgX;
            proposedY = aboveY;
            preferredDirection = 'above';
          } else if (!crossesBelow) {
            proposedX = avgX;
            proposedY = belowY;
            preferredDirection = 'below';
          } else {
            proposedX = avgX;
            proposedY = minConnY - 250;
            preferredDirection = 'above';
          }
        }
      } else {
        // Fallback
        proposedX = 100;
        proposedY = minY - 200;
        preferredDirection = 'above';
      }
      
      // Collision detection and adjustment
      const minSpacing = 200;
      let finalX = proposedX;
      let finalY = proposedY;
      
      let hasCollision = true;
      let attempts = 0;
      
      while (hasCollision && attempts < 20) {
        hasCollision = occupiedSpaces.some(occupied => 
          Math.abs(occupied.x - finalX) < minSpacing && 
          Math.abs(occupied.y - finalY) < 140 // Check vertical spacing too
        );
        
        if (hasCollision) {
          // Try shifting right first, then down if needed
          if (attempts < 10) {
            finalX += minSpacing * 0.6; // Smaller increments
          } else {
            finalY += 150; // Shift down if can't fit horizontally
          }
          attempts++;
        }
      }
      
      utilityPositions[utilityNode.id] = { x: finalX, y: finalY, direction: preferredDirection };
      occupiedSpaces.push({ x: finalX, y: finalY });
    });

    // Position all nodes
    const layoutedNodes = nodes.map((node) => {
      // Main flow nodes - use ELK position
      if (positionedNodesMap[node.id]) {
        return {
          ...node,
          position: positionedNodesMap[node.id],
        };
      }

      // Utility nodes - use calculated position
      if (utilityPositions[node.id]) {
        return {
          ...node,
          position: { x: utilityPositions[node.id].x, y: utilityPositions[node.id].y },
        };
      }

      return { ...node, position: { x: 0, y: 0 } };
    });

    // Update edges with proper handles based on actual node positions
    const updatedEdges = edges.map(edge => {
      const sourceNode = layoutedNodes.find(n => n.id === edge.source);
      const targetNode = layoutedNodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) {
        console.warn(`Edge ${edge.id}: Missing nodes`, { source: edge.source, target: edge.target });
        return edge;
      }
      
      const sourcePos = sourceNode.position;
      const targetPos = targetNode.position;
      
      if (!sourcePos || !targetPos || sourcePos.x === undefined || targetPos.x === undefined) {
        console.warn(`Edge ${edge.id}: Invalid positions`, { sourcePos, targetPos });
        return edge;
      }
      
      const isSolid = edge.edgeType === 'solid';
      
      let sourceHandle, targetHandle;
      
      if (isSolid) {
        // Solid edges: always horizontal left→right
        sourceHandle = 'right';
        targetHandle = 'left';
      } else {
        // Dashed edges: determine based on relative positions
        const deltaY = targetPos.y - sourcePos.y;
        const deltaX = targetPos.x - sourcePos.x;
        
        // Use a threshold to determine if connection should be vertical or horizontal
        // Prefer vertical connections for dashed edges (monitoring/logging from above/below)
        const verticalDist = Math.abs(deltaY);
        const horizontalDist = Math.abs(deltaX);
        
        // If vertical distance is significant (>50px) AND greater than horizontal, use vertical
        if (verticalDist > 50 && verticalDist > horizontalDist * 0.7) {
          // Vertical connection (source above or below target)
          if (deltaY > 0) {
            // Source is ABOVE target (deltaY positive means target has higher Y)
            sourceHandle = 'bottom';
            targetHandle = 'top';
          } else {
            // Source is BELOW target (deltaY negative means source has higher Y)
            sourceHandle = 'top';
            targetHandle = 'bottom';
          }
        } else {
          // Horizontal or diagonal - use left/right
          if (deltaX > 0) {
            // Target is to the RIGHT of source
            sourceHandle = 'right';
            targetHandle = 'left';
          } else {
            // Target is to the LEFT of source
            sourceHandle = 'left';
            targetHandle = 'right';
          }
        }
      }
      
      const updatedEdge = {
        ...edge,
        sourceHandle,
        targetHandle,
      };
      
      // Debug logging for dashed edges
      if (!isSolid) {
        console.log(`Dashed edge ${edge.source} → ${edge.target}:`, {
          sourcePos,
          targetPos,
          deltaY: targetPos.y - sourcePos.y,
          sourceHandle,
          targetHandle,
        });
      }
      
      return updatedEdge;
    });
    
    console.log('Updated edges:', {
      total: updatedEdges.length,
      dashed: updatedEdges.filter(e => e.edgeType === 'dashed').map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
      }))
    });

    return { nodes: layoutedNodes, edges: updatedEdges };
  } catch (error) {
    console.error("ELK layout error:", error);
    return {
      nodes: nodes.map((node, idx) => ({
        ...node,
        position: { x: idx * 200, y: 100 },
      })),
      edges,
    };
  }
};

export default function ArchitectureDiagram({ data }) {
  const [hoveredEdge, setHoveredEdge] = React.useState(null);
  const { isDark } = useTheme(); // Get current theme

  const hasValidData = Boolean(data && Array.isArray(data.nodes) && Array.isArray(data.connections));

  const initialNodes = useMemo(() => {
    if (!hasValidData) return [];

    return data.nodes.map((node) => {
      // Get icon
      let iconComponent = null;
      let iconData = null;

      if (node.service && data.provider && data.provider !== "multi-cloud") {
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
        type: "custom",
        data: {
          label: node.label,
          cost: node.cost,
          description: node.description,
          icon: iconComponent,
          iconData: iconData,
          layer: node.layer,
          handlePositions: {
            top: true,
            bottom: true,
            left: true,
            right: true,
          },
        },
        position: { x: 0, y: 0 }, // Will be set by layout
      };
    });
  }, [data, hasValidData]);

  const initialEdges = useMemo(() => {
    if (!hasValidData) return [];

    // Theme-aware edge colors
    const dashedColor = isDark ? "#6366f1" : "#4f46e5";
    const solidColor = isDark ? "#22c55e" : "#16a34a";

    // Filter out non-connection fields and ensure valid connections
    const validConnections = (data.connections || []).filter(
      (conn) =>
        conn &&
        conn.from &&
        conn.to &&
        typeof conn === "object" &&
        !Array.isArray(conn)
    );

    // Helper function to calculate optimal connection points based on node positions
    const calculateConnectionPoints = (sourceNode, targetNode, isDashed) => {
      if (!sourceNode || !targetNode) return { source: 'right', target: 'left' };
      
      const dx = targetNode.position.x - sourceNode.position.x;
      const dy = targetNode.position.y - sourceNode.position.y;
      
      // For dashed (utility) connections - use vertical approach
      if (isDashed) {
        if (dy < -50) return { source: 'top', target: 'bottom' }; // Target is above
        if (dy > 50) return { source: 'bottom', target: 'top' };   // Target is below
        if (dx > 0) return { source: 'right', target: 'left' };    // Target is to the right
        return { source: 'left', target: 'right' };                 // Target is to the left
      }
      
      // For solid (main flow) connections - enforce left-to-right flow
      // Source uses RIGHT connection point (output)
      // Target uses LEFT connection point (input from logical flow)
      if (dx > 50) {
        // Standard left-to-right flow
        return { source: 'right', target: 'left' };
      } else if (dx < -50) {
        // Backward connection (should be rare)
        return { source: 'left', target: 'right' };
      } else {
        // Vertical alignment - use top/bottom
        if (dy > 50) return { source: 'bottom', target: 'top' };
        return { source: 'top', target: 'bottom' };
      }
    };

    return validConnections.map((conn, idx) => {
      const isDashed = conn.type === "dashed";
      
      const sourceNode = initialNodes.find(n => n.id === conn.from);
      const targetNode = initialNodes.find(n => n.id === conn.to);
      const { source: sourceHandle, target: targetHandle } = calculateConnectionPoints(sourceNode, targetNode, isDashed);

      // Initial handles (will be updated post-layout based on positions)
      const initialSourceHandle = sourceHandle;
      const initialTargetHandle = targetHandle;

      return {
        id: `e${idx}-${conn.from}-${conn.to}`,
        source: conn.from,
        target: conn.to,
        sourceHandle: initialSourceHandle, // Initial handle
        targetHandle: initialTargetHandle, // Initial handle
        edgeType: conn.type, // Preserve original type ("solid" or "dashed")
        data: { label: conn.label },
        type: "smoothstep",
        animated: false,
        style: {
          stroke: isDashed ? dashedColor : solidColor,
          strokeWidth: 2,
          strokeDasharray: isDashed ? "5,5" : "none",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: isDashed ? dashedColor : solidColor,
        },
      };
    });
  }, [data, hasValidData, initialNodes, isDark]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layoutComplete, setLayoutComplete] = React.useState(false);
  
  // Debug: Log edges state changes
  React.useEffect(() => {
    console.log('Edges state updated:', {
      count: edges.length,
      dashed: edges.filter(e => e.edgeType === 'dashed').map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
      }))
    });
  }, [edges]);

  // Apply ELK layout (async)
  React.useEffect(() => {
    const applyLayout = async () => {
      setLayoutComplete(false);
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        await getLayoutedElements(initialNodes, initialEdges);
      console.log('Setting edges in state:', layoutedEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: e.type,
        edgeType: e.edgeType
      })));
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setLayoutComplete(true);
    };

    if (!hasValidData) {
      setNodes([]);
      setEdges([]);
      setLayoutComplete(true);
      return;
    }

    if (initialNodes.length > 0 && initialEdges.length > 0) {
      applyLayout();
    }
  }, [hasValidData, initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full relative bg-white dark:bg-slate-900">
      {!hasValidData && (
        <div className="flex items-center justify-center h-full text-gray-400">
          No diagram data available
        </div>
      )}
      {!layoutComplete && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/80 z-10">
          <div className="text-gray-400">Generating diagram layout...</div>
        </div>
      )}
      {hasValidData && (
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
          className="bg-white dark:bg-slate-900"
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: "smoothstep",
          }}
        >
          <Background color={isDark ? "#475569" : "#E6EEF8"} gap={16} />
          <Controls className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700" />
          <MiniMap
            className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
            nodeColor={(node) => {
              const layerColors = {
                networking: "#06B6D4",
                presentation: "#3B82F6",
                application: "#8B5CF6",
                data: "#10B981",
                operations: "#F59E0B",
                security: "#EF4444",
              };
              return layerColors[node.data.layer] || "#6366f1";
            }}
          />
        </ReactFlow>
      )}

      {/* Edge label tooltip on hover */}
      {hoveredEdge && hoveredEdge.data?.label && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gray-900 text-white text-sm rounded shadow-lg z-50 pointer-events-none">
          {hoveredEdge.data.label}
        </div>
      )}
    </div>
  );
}
