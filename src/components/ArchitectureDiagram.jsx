import { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { validateDiagram } from '../schemas/diagramSchema';
import iconRegistry from '../icons';

/**
 * Custom SVG-based Architecture Diagram Component
 * 
 * Renders cloud architecture diagrams from JSON data with:
 * - Clean left-to-right or top-to-bottom flow based on architecture
 * - Grouped containers for logical grouping
 * - Minimal connections showing only main flow paths
 * - Zoom and pan controls
 * - Interactive tooltips
 * - Provider-specific theming (AWS, Azure, GCP)
 */
export default function ArchitectureDiagram({ data, width = 1400, height = 900 }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const svgRef = useRef(null);

  // Validate diagram data
  const validation = validateDiagram(data);
  if (!validation.isValid) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Invalid Diagram Data</h4>
        <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
          {validation.errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Provider color themes
  const providerThemes = {
    aws: {
      primary: '#FF9900',
      secondary: '#232F3E',
      accent: '#146EB4'
    },
    azure: {
      primary: '#0078D4',
      secondary: '#50E6FF',
      accent: '#008272'
    },
    gcp: {
      primary: '#4285F4',
      secondary: '#EA4335',
      accent: '#34A853'
    },
    'multi-cloud': {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899'
    }
  };

  const theme = providerThemes[data.provider] || providerThemes['multi-cloud'];

  // Layer configuration with better colors and positioning
  const layers = {
    networking: { name: 'Networking', color: '#06B6D4', bgColor: '#ECFEFF' },
    presentation: { name: 'Presentation', color: '#3B82F6', bgColor: '#EFF6FF' },
    application: { name: 'Application', color: '#8B5CF6', bgColor: '#F5F3FF' },
    data: { name: 'Data', color: '#10B981', bgColor: '#ECFDF5' },
    operations: { name: 'Operations', color: '#F59E0B', bgColor: '#FFFBEB' },
    security: { name: 'Security', color: '#EF4444', bgColor: '#FEF2F2' }
  };

  // Calculate node positions with smart flow-based layout
  const calculateNodePositions = () => {
    const positions = {};
    
    // Separate monitoring/security nodes from main flow
    const mainNodes = data.nodes.filter(n => n.layer !== 'operations' && n.layer !== 'security');
    const monitoringNodes = data.nodes.filter(n => n.layer === 'operations');
    const securityNodes = data.nodes.filter(n => n.layer === 'security');
    
    // Build connection map (only non-dashed connections for layout)
    const solidConnections = data.connections.filter(c => c.type !== 'dashed');
    const connectionMap = new Map();
    const incomingMap = new Map();
    
    solidConnections.forEach(conn => {
      if (!connectionMap.has(conn.from)) connectionMap.set(conn.from, []);
      if (!incomingMap.has(conn.to)) incomingMap.set(conn.to, []);
      connectionMap.get(conn.from).push(conn.to);
      incomingMap.get(conn.to).push(conn.from);
    });
    
    // Find entry points (no incoming solid connections)
    const hasIncoming = new Set(solidConnections.map(c => c.to));
    const entryNodes = mainNodes.filter(n => !hasIncoming.has(n.id));
    
    // Calculate depth from entry points
    const nodeDepth = new Map();
    const visited = new Set();
    
    const calculateDepth = (nodeId, depth = 0) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      nodeDepth.set(nodeId, Math.max(nodeDepth.get(nodeId) || 0, depth));
      
      const targets = connectionMap.get(nodeId) || [];
      targets.forEach(targetId => calculateDepth(targetId, depth + 1));
    };
    
    entryNodes.forEach(node => calculateDepth(node.id));
    
    // Group by depth and layer for smarter positioning
    const columns = new Map();
    mainNodes.forEach(node => {
      const depth = nodeDepth.get(node.id) || 0;
      if (!columns.has(depth)) columns.set(depth, []);
      columns.get(depth).push(node);
    });
    
    // Compact layout parameters
    const columnWidth = 200;
    const nodeSpacing = 100;
    const startX = 80;
    const startY = 80;
    
    // Position main flow nodes
    Array.from(columns.entries()).sort((a, b) => a[0] - b[0]).forEach(([depth, nodes]) => {
      const x = startX + depth * columnWidth;
      
      nodes.forEach((node, index) => {
        positions[node.id] = {
          x: x,
          y: startY + index * nodeSpacing,
          layer: node.layer
        };
      });
    });
    
    // Position monitoring nodes on the right side
    const maxDepth = Math.max(...Array.from(columns.keys()));
    const monitoringX = startX + (maxDepth + 1.5) * columnWidth;
    monitoringNodes.forEach((node, index) => {
      positions[node.id] = {
        x: monitoringX,
        y: startY + index * nodeSpacing,
        layer: node.layer
      };
    });
    
    // Position security nodes below monitoring
    securityNodes.forEach((node, index) => {
      positions[node.id] = {
        x: monitoringX,
        y: startY + (monitoringNodes.length + index) * nodeSpacing,
        layer: node.layer
      };
    });
    
    return positions;
  };

  const nodePositions = calculateNodePositions();

  // Zoom functions
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Pan functions
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  // Get icon - try provider icon first, fallback to Lucide
  const getNodeIcon = (node) => {
    // Try to get provider-specific icon
    if (node.service && data.provider && data.provider !== 'multi-cloud') {
      const iconData = iconRegistry.getIcon(data.provider, node.service);
      if (iconData) {
        return { type: 'provider', data: iconData };
      }
    }
    
    // Fallback to Lucide icon
    if (node.icon) {
      const Icon = LucideIcons[node.icon];
      if (Icon) {
        return { type: 'lucide', Icon };
      }
    }
    
    // Final fallback
    return { type: 'lucide', Icon: LucideIcons.Box };
  };

  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded transition-colors"
          title="Zoom In"
        >
          <LucideIcons.ZoomIn className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded transition-colors"
          title="Zoom Out"
        >
          <LucideIcons.ZoomOut className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded transition-colors"
          title="Reset View"
        >
          <LucideIcons.Maximize2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </button>
        <div className="text-xs text-center font-medium text-blue-600 dark:text-blue-400 pt-1 border-t border-gray-200 dark:border-gray-600">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* SVG Diagram */}
      <div
        className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ userSelect: 'none' }}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {/* Optional: Only show layer groupings if explicitly defined in data */}
          {data.groups && data.groups.map((group, idx) => (
            <g key={idx}>
              <rect
                x={group.x}
                y={group.y}
                width={group.width}
                height={group.height}
                fill="none"
                stroke={layers[group.layer]?.color || '#6B7280'}
                strokeWidth={2}
                strokeDasharray="8,4"
                rx={12}
                opacity={0.5}
              />
              <text
                x={group.x + group.width / 2}
                y={group.y - 10}
                fontSize={11}
                fontWeight="700"
                fill={layers[group.layer]?.color || '#6B7280'}
                textAnchor="middle"
                className="uppercase tracking-wider"
              >
                {group.label}
              </text>
            </g>
          ))}

          {/* Connections - Simple, direct paths */}
          <g>
            {data.connections.map((conn, i) => {
              const fromPos = nodePositions[conn.from];
              const toPos = nodePositions[conn.to];
              if (!fromPos || !toPos) return null;

              const isDashed = conn.type === 'dashed';
              const isBidirectional = conn.type === 'bidirectional';
              
              // Calculate connection points - from right to left edge
              const x1 = fromPos.x + 75;
              const y1 = fromPos.y;
              const x2 = toPos.x - 75;
              const y2 = toPos.y;

              // Calculate distance and direction
              const dx = x2 - x1;
              const dy = y2 - y1;
              const distance = Math.sqrt(dx * dx + dy * dy);

              // For very short distances or same column, use straight line
              if (distance < 100 || Math.abs(dx) < 50) {
                return (
                  <g key={i}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={theme.accent}
                      strokeWidth={2}
                      strokeDasharray={isDashed ? '6,4' : '0'}
                      markerEnd={`url(#arrow-${data.provider})`}
                      opacity={0.7}
                    />
                    {conn.label && (
                      <text
                        x={(x1 + x2) / 2 + 10}
                        y={(y1 + y2) / 2 - 6}
                        fontSize={10}
                        fontWeight="500"
                        fill={theme.accent}
                        className="pointer-events-none"
                      >
                        {conn.label}
                      </text>
                    )}
                  </g>
                );
              }

              // For longer distances, use gentle curve (like RAG example)
              // Control points for smooth bezier - minimal curve
              const curve = Math.min(Math.abs(dx) * 0.3, 50);
              
              const path = `
                M ${x1},${y1}
                C ${x1 + curve},${y1} ${x2 - curve},${y2} ${x2},${y2}
              `;

              return (
                <g key={i}>
                  <path
                    d={path}
                    stroke={theme.accent}
                    strokeWidth={2}
                    strokeDasharray={isDashed ? '6,4' : '0'}
                    fill="none"
                    markerEnd={`url(#arrow-${data.provider})`}
                    opacity={0.7}
                  />
                  {isBidirectional && (
                    <path
                      d={path}
                      stroke={theme.accent}
                      strokeWidth={2}
                      strokeDasharray={isDashed ? '6,4' : '0'}
                      fill="none"
                      markerStart={`url(#arrow-reverse-${data.provider})`}
                      opacity={0.7}
                    />
                  )}
                  {conn.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 6}
                      fontSize={10}
                      fontWeight="500"
                      fill={theme.accent}
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Arrow marker definitions */}
          <defs>
            {/* Forward arrow */}
            <marker
              id={`arrow-${data.provider}`}
              markerWidth={10}
              markerHeight={10}
              refX={9}
              refY={3}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill={theme.accent} />
            </marker>
            {/* Reverse arrow for bidirectional */}
            <marker
              id={`arrow-reverse-${data.provider}`}
              markerWidth={10}
              markerHeight={10}
              refX={0}
              refY={3}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M9,0 L9,6 L0,3 z" fill={theme.accent} />
            </marker>
          </defs>

          {/* Nodes */}
          {data.nodes.map(node => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const iconInfo = getNodeIcon(node);
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Node background - transparent/minimal like RAG example */}
                <rect
                  x={-70}
                  y={-45}
                  width={140}
                  height={90}
                  fill="transparent"
                  stroke={isHovered ? theme.primary : 'transparent'}
                  strokeWidth={isHovered ? 2 : 0}
                  rx={8}
                  className="transition-all"
                />

                {/* Icon - provider-specific or Lucide */}
                {iconInfo.type === 'provider' ? (
                  /* Provider icon as embedded SVG image */
                  <image
                    x={-16}
                    y={-28}
                    width={32}
                    height={32}
                    href={iconInfo.data.svg}
                    preserveAspectRatio="xMidYMid meet"
                  />
                ) : (
                  /* Lucide icon via foreignObject */
                  <foreignObject x={-14} y={-25} width={28} height={28}>
                    <div className="flex items-center justify-center">
                      <iconInfo.Icon className="w-7 h-7" style={{ color: theme.primary }} />
                    </div>
                  </foreignObject>
                )}

                {/* Label */}
                <text
                  y={8}
                  fontSize={13}
                  fontWeight="600"
                  fill="#1F2937"
                  textAnchor="middle"
                  className="dark:fill-gray-100 pointer-events-none"
                >
                  {node.label}
                </text>

                {/* Cost badge */}
                {node.cost && (
                  <text
                    y={24}
                    fontSize={11}
                    fill="#059669"
                    textAnchor="middle"
                    fontWeight="600"
                    className="dark:fill-green-400 pointer-events-none"
                  >
                    {node.cost}/mo
                  </text>
                )}

                {/* Tooltip on hover */}
                {isHovered && node.description && (
                  <g>
                    <rect
                      x={-80}
                      y={45}
                      width={160}
                      height={60}
                      fill="white"
                      stroke={theme.primary}
                      strokeWidth={2}
                      rx={8}
                      className="dark:fill-gray-800"
                      filter="url(#shadow)"
                    />
                    <foreignObject x={-75} y={50} width={150} height={50}>
                      <div className="text-xs text-gray-700 dark:text-gray-300 p-2 text-center leading-relaxed">
                        {node.description}
                      </div>
                    </foreignObject>
                  </g>
                )}
              </g>
            );
          })}

          {/* Shadow filter for tooltips */}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: theme.primary }}></div>
          <span className="text-gray-700 dark:text-gray-300">{data.provider.toUpperCase()} Theme</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-0.5 bg-gray-400"></div>
          <span className="text-gray-700 dark:text-gray-300">Connection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-0.5 bg-gray-400" style={{ backgroundImage: 'repeating-linear-gradient(to right, #9CA3AF 0, #9CA3AF 5px, transparent 5px, transparent 10px)' }}></div>
          <span className="text-gray-700 dark:text-gray-300">Async/Auth</span>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Use mouse wheel to zoom • Click and drag to pan • Hover nodes for details
      </p>
    </div>
  );
}
