import React, { useState } from 'react';

export default function NetworkGraph() {
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    { id: 'Python', x: 70, y: 50, color: 'var(--v)' },
    { id: 'Django', x: 180, y: 50, color: 'var(--v)' },
    { id: 'PostgreSQL', x: 280, y: 70, color: 'var(--b)' },
    { id: 'React', x: 100, y: 150, color: 'var(--t)' },
    { id: 'TypeScript', x: 220, y: 150, color: 'var(--t)' },
    { id: 'Docker', x: 180, y: 100, color: 'var(--a)' }
  ];

  const edges = [
    { source: 'Python', target: 'Django' },
    { source: 'Django', target: 'PostgreSQL' },
    { source: 'React', target: 'TypeScript' },
    { source: 'React', target: 'Django' },
    { source: 'Django', target: 'Docker' },
    { source: 'PostgreSQL', target: 'Docker' },
    { source: 'React', target: 'Docker' },
    { source: 'TypeScript', target: 'Docker' }
  ];

  const isConnected = (nodeId) => {
    if (!hoveredNode) return false;
    if (hoveredNode === nodeId) return true;
    return edges.some(e => 
      (e.source === hoveredNode && e.target === nodeId) ||
      (e.target === hoveredNode && e.source === nodeId)
    );
  };

  const isEdgeActive = (edge) => {
    if (!hoveredNode) return false;
    return edge.source === hoveredNode || edge.target === hoveredNode;
  };

  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" height="200" viewBox="0 0 350 200">
        {/* Render Edges */}
        {edges.map((edge, idx) => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const isActive = isEdgeActive(edge);

          return (
            <line
              key={idx}
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              className={`edge ${isActive ? 'active' : ''}`}
              style={{
                stroke: isActive ? 'var(--v)' : 'var(--border)',
                strokeWidth: isActive ? 2 : 1
              }}
            />
          );
        })}

        {/* Render Nodes */}
        {nodes.map((node) => {
          const isActive = isConnected(node.id) || hoveredNode === node.id;
          
          return (
            <g
              key={node.id}
              className={`node ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r="6"
                fill={node.color}
                stroke={isActive ? '#fff' : 'transparent'}
                strokeWidth="1.5"
                style={{ transition: 'all 0.2s ease' }}
              />
              <text
                x={node.x + 10}
                y={node.y + 4}
                className="node-label"
                fontSize="9"
                fontWeight={isActive ? 'bold' : '500'}
                fill={isActive ? '#fff' : 'var(--muted)'}
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        Hover nodes to highlight skill associations in listings
      </div>
    </div>
  );
}
