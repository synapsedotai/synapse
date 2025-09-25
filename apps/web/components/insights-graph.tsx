"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ProfileCard } from './profile-card';
import { HoverTooltip } from './hover-tooltip';

// Dynamically import ForceGraph3D to avoid SSR issues
const ForceGraph3D = dynamic(() => import('3d-force-graph').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading 3D visualization...</p>
      </div>
    </div>
  )
});

interface GraphNode {
  id: string;
  name: string;
  group: number;
  value: number;
  profile: {
    role: string;
    department: string;
    level: string;
    email: string;
    age: number;
    compensation: string;
    startDate: string;
    location: string;
    reports: number;
    knowledgeDomains: string[];
    impactRating: number;
    expertMeetings: number;
    retentionRisk: 'Low' | 'Medium' | 'High' | 'Critical';
    riskFactors: string[];
    avatar?: string;
  };
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  type?: 'hierarchy' | 'call' | 'collaboration';
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Generate organizational chart data
const generateSampleData = (): GraphData => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  
  let nodeId = 0;
  
  // Helper functions for generating realistic data
  const generateEmail = (name: string) => {
    return name.toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, '.') + '@synapse.com';
  };
  
  const generateCompensation = (level: number) => {
    const ranges = ['$450K-500K', '$250K-300K', '$180K-220K', '$140K-170K', '$110K-140K', '$85K-110K', '$65K-85K'];
    return ranges[level] || '$65K-85K';
  };
  
  const generateKnowledgeDomains = (level: number) => {
    const domainSets = [
      ['Strategic Planning', 'Board Relations', 'M&A', 'Investor Relations'],
      ['Department Strategy', 'Budget Planning', 'Team Scaling', 'Process Design'],
      ['Team Leadership', 'Resource Planning', 'Cross-functional Coordination', 'Performance Management'],
      ['Project Management', 'Technical Leadership', 'Mentoring', 'Process Optimization'],
      ['System Architecture', 'Technical Implementation', 'Code Review', 'Best Practices'],
      ['Feature Development', 'Testing', 'Documentation', 'Collaboration'],
      ['Learning', 'Implementation', 'Support', 'Growth']
    ];
    return domainSets[level] || domainSets[6];
  };
  
  const generateRetentionRisk = (level: number, meetings: number) => {
    // Higher level + more meetings = higher retention risk if other factors present
    if (level <= 2 && meetings > 40) return Math.random() > 0.7 ? 'High' : 'Medium';
    if (meetings > 60) return Math.random() > 0.8 ? 'Critical' : 'High';
    if (meetings > 30) return Math.random() > 0.6 ? 'Medium' : 'Low';
    return 'Low';
  };
  
  const generateRiskFactors = (risk: string, meetings: number) => {
    const factors = [];
    if (meetings > 40) factors.push(`High expertise (${meetings} expert meetings)`);
    if (Math.random() > 0.6) factors.push('Below market compensation (Glassdoor data)');
    if (Math.random() > 0.8) factors.push('Retirement eligible (60+ years)');
    if (Math.random() > 0.7) factors.push('High external recruiting interest');
    if (Math.random() > 0.5) factors.push('Key knowledge holder for legacy systems');
    return factors.slice(0, 2 + Math.floor(Math.random() * 2));
  };
  
  const locations = ['San Francisco', 'New York', 'London', 'Remote', 'Austin', 'Seattle'];
  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR'];
  const levels = ['CEO', 'C-Suite', 'Director', 'Senior Manager', 'Team Lead', 'Senior IC', 'Mid IC', 'Junior IC'];
  
  // Create CEO
  nodes.push({
    id: `node-${nodeId}`,
    name: 'Sarah Chen',
    group: 0,
    value: 20,
    profile: {
      role: 'Chief Executive Officer',
      department: 'Executive',
      level: levels[0],
      email: generateEmail('Sarah Chen'),
      age: 42,
      compensation: generateCompensation(0),
      startDate: 'Jan 2019',
      location: 'San Francisco',
      reports: 4,
      knowledgeDomains: generateKnowledgeDomains(0),
      impactRating: 95,
      expertMeetings: 12,
      retentionRisk: 'Low',
      riskFactors: [],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-chen`
    }
  });
  const ceoId = nodeId++;

  // Create C-Suite
  const csuiteIds: number[] = [];
  const csuiteData = [
    { title: 'CTO', name: 'Alex Rodriguez', dept: 'Engineering' },
    { title: 'CFO', name: 'Maria Kim', dept: 'Finance' },
    { title: 'CMO', name: 'David Wilson', dept: 'Marketing' },
    { title: 'COO', name: 'Lisa Zhang', dept: 'Operations' }
  ];
  
  for (const exec of csuiteData) {
    nodes.push({
      id: `node-${nodeId}`,
      name: exec.name,
      group: 0,
      value: 15,
      profile: {
        role: exec.title,
        department: exec.dept,
        level: levels[1],
        email: generateEmail(exec.name),
        age: 38 + Math.floor(Math.random() * 8),
        compensation: generateCompensation(1),
        startDate: ['Mar 2020', 'Jun 2019', 'Sep 2020', 'Jan 2021'][Math.floor(Math.random() * 4)],
        location: locations[Math.floor(Math.random() * locations.length)],
        reports: 3 + Math.floor(Math.random() * 4),
        knowledgeDomains: generateKnowledgeDomains(1),
        impactRating: 85 + Math.floor(Math.random() * 15),
        expertMeetings: 8 + Math.floor(Math.random() * 12),
        retentionRisk: generateRetentionRisk(1, 8 + Math.floor(Math.random() * 12)),
        riskFactors: generateRiskFactors('Medium', 8 + Math.floor(Math.random() * 12)),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${exec.name.replace(' ', '-')}`
      }
    });
    // Connect to CEO
    links.push({
      source: `node-${ceoId}`,
      target: `node-${nodeId}`,
      value: 5,
      type: 'hierarchy'
    });
    csuiteIds.push(nodeId++);
  }

  // Create Directors
  const directorIds: number[] = [];
  const directorNames = [
    'VP Engineering', 'VP Design', 'VP Sales', 'VP Marketing', 
    'VP Operations', 'VP Finance', 'Director Product', 'Director Data', 
    'Director Security', 'Director HR', 'Director Legal', 'Director Strategy'
  ];
  
  for (let i = 0; i < directorNames.length; i++) {
    const title = directorNames[i];
    const firstName = ['John', 'Jane', 'Mike', 'Sarah', 'Chris', 'Emma', 'Ryan', 'Nicole', 'Kevin', 'Amanda', 'Jason', 'Lisa'][i] || 'Director';
    const lastName = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White'][i] || 'Person';
    const fullName = `${firstName} ${lastName}`;
    
    nodes.push({
      id: `node-${nodeId}`,
      name: fullName,
      group: 1,
      value: 12,
      profile: {
        role: title,
        department: departments[Math.floor(Math.random() * departments.length)],
        level: levels[2],
        email: generateEmail(fullName),
        age: 35 + Math.floor(Math.random() * 10),
        compensation: generateCompensation(2),
        startDate: ['2020', '2021', '2022', '2023'][Math.floor(Math.random() * 4)],
        location: locations[Math.floor(Math.random() * locations.length)],
        reports: 2 + Math.floor(Math.random() * 4),
        knowledgeDomains: generateKnowledgeDomains(2),
        impactRating: 70 + Math.floor(Math.random() * 25),
        expertMeetings: 15 + Math.floor(Math.random() * 35),
        retentionRisk: generateRetentionRisk(2, 15 + Math.floor(Math.random() * 35)),
        riskFactors: generateRiskFactors('Medium', 15 + Math.floor(Math.random() * 35)),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName.replace(' ', '-')}`
      }
    });
    // Connect to appropriate C-Suite member
    const csuiteIndex = Math.floor(i / 3) % csuiteIds.length;
    links.push({
      source: `node-${csuiteIds[csuiteIndex]}`,
      target: `node-${nodeId}`,
      value: 4,
      type: 'hierarchy'
    });
    directorIds.push(nodeId++);
  }

  // Create Senior Managers  
  const seniorManagerIds: number[] = [];
  const firstNames = ['Alex', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
  const lastNames = ['Chen', 'Patel', 'Garcia', 'Lee', 'Martinez', 'Thompson', 'Clark', 'Lewis', 'Walker', 'Hall'];
  
  for (let i = 0; i < 25; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    
    nodes.push({
      id: `node-${nodeId}`,
      name: fullName,
      group: 2,
      value: 10,
      profile: {
        role: 'Senior Manager',
        department: departments[Math.floor(Math.random() * departments.length)],
        level: levels[3],
        email: generateEmail(fullName),
        age: 32 + Math.floor(Math.random() * 8),
        compensation: generateCompensation(3),
        startDate: ['2021', '2022', '2023', '2024'][Math.floor(Math.random() * 4)],
        location: locations[Math.floor(Math.random() * locations.length)],
        reports: 2 + Math.floor(Math.random() * 3),
        knowledgeDomains: generateKnowledgeDomains(3),
        impactRating: 60 + Math.floor(Math.random() * 30),
        expertMeetings: 8 + Math.floor(Math.random() * 25),
        retentionRisk: generateRetentionRisk(3, 8 + Math.floor(Math.random() * 25)),
        riskFactors: [],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName.replace(' ', '-')}`
      }
    });
    // Connect to directors
    const directorIndex = Math.floor(i / 2) % directorIds.length;
    links.push({
      source: `node-${directorIds[directorIndex]}`,
      target: `node-${nodeId}`,
      value: 3,
      type: 'hierarchy'
    });
    seniorManagerIds.push(nodeId++);
  }

  // Simplified node creation for remaining levels (keeping it hackathon-ready)
  const teamLeadIds: number[] = [];
  const seniorICIds: number[] = [];
  const midICIds: number[] = [];
  
  // Create remaining nodes with basic profile data
  const remainingLevels = [
    { count: 45, group: 3, level: 'Team Lead', baseName: 'Team Lead' },
    { count: 80, group: 4, level: 'Senior IC', baseName: 'Senior IC' },
    { count: 120, group: 5, level: 'Mid IC', baseName: 'Mid IC' },
    { count: 90, group: 6, level: 'Junior IC', baseName: 'Junior IC' }
  ];
  
  for (const levelData of remainingLevels) {
    const levelIds: number[] = [];
    
    for (let i = 0; i < levelData.count; i++) {
      const name = `${levelData.baseName} ${i + 1}`;
      
      nodes.push({
        id: `node-${nodeId}`,
        name,
        group: levelData.group,
        value: 8 - levelData.group,
        profile: {
          role: levelData.level,
          department: departments[Math.floor(Math.random() * departments.length)],
          level: levels[levelData.group],
          email: generateEmail(name),
          age: 25 + Math.floor(Math.random() * 15),
          compensation: generateCompensation(levelData.group),
          startDate: ['2022', '2023', '2024'][Math.floor(Math.random() * 3)],
          location: locations[Math.floor(Math.random() * locations.length)],
          reports: levelData.group < 4 ? Math.floor(Math.random() * 3) : 0,
          knowledgeDomains: generateKnowledgeDomains(levelData.group),
          impactRating: 40 + Math.floor(Math.random() * 50),
          expertMeetings: Math.floor(Math.random() * (8 - levelData.group) * 10),
          retentionRisk: 'Low',
          riskFactors: [],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '-')}`
        }
      });
      
      // Connect based on level
      if (levelData.group === 3) { // Team Leads
        const managerIndex = Math.floor(i / 2) % seniorManagerIds.length;
        links.push({
          source: `node-${seniorManagerIds[managerIndex]}`,
          target: `node-${nodeId}`,
          value: 3,
          type: 'hierarchy'
        });
        teamLeadIds.push(nodeId);
      } else if (levelData.group === 4) { // Senior ICs
        const leadIndex = Math.floor(i / 2) % teamLeadIds.length;
        links.push({
          source: `node-${teamLeadIds[leadIndex]}`,
          target: `node-${nodeId}`,
          value: 2,
          type: 'hierarchy'
        });
        seniorICIds.push(nodeId);
      } else if (levelData.group === 5) { // Mid ICs
        const seniorIndex = Math.floor(i / 2) % seniorICIds.length;
        links.push({
          source: `node-${seniorICIds[seniorIndex]}`,
          target: `node-${nodeId}`,
          value: 2,
          type: 'hierarchy'
        });
        midICIds.push(nodeId);
      } else { // Junior ICs
        const midIndex = Math.floor(i / 2) % midICIds.length;
        links.push({
          source: `node-${midICIds[midIndex]}`,
          target: `node-${nodeId}`,
          value: 1,
          type: 'hierarchy'
        });
      }
      
      nodeId++;
    }
  }


  // Add call connections (green pulsing cross-team calls)
  // Focus on same-level, different team connections
  
  // Same-level cross-team calls (most common pattern)
  for (let i = 0; i < 40; i++) {
    const sourceIndex = Math.floor(Math.random() * nodes.length);
    const targetIndex = Math.floor(Math.random() * nodes.length);
    
    // Same level (group), different positions = different teams
    if (sourceIndex !== targetIndex && 
        nodes[sourceIndex].group === nodes[targetIndex].group && // Same organizational level
        Math.random() > 0.3) { // 70% chance to create connection
      
      links.push({
        source: `node-${sourceIndex}`,
        target: `node-${targetIndex}`,
        value: 1,
        type: 'call'
      });
    }
  }
  
  // Create communication hubs - some people who talk to many teams
  const hubCount = 8; // Number of communication hubs
  for (let h = 0; h < hubCount; h++) {
    const hubIndex = Math.floor(Math.random() * nodes.length);
    const connectionsPerHub = 4 + Math.floor(Math.random() * 6); // 4-9 connections per hub
    
    for (let c = 0; c < connectionsPerHub; c++) {
      const targetIndex = Math.floor(Math.random() * nodes.length);
      
      // Hub can connect across levels but prefer same/adjacent levels
      if (hubIndex !== targetIndex && 
          Math.abs(nodes[hubIndex].group - nodes[targetIndex].group) <= 2) {
        
        links.push({
          source: `node-${hubIndex}`,
          target: `node-${targetIndex}`,
          value: 1.2,
          type: 'call'
        });
      }
    }
  }
  
  // Add some strategic cross-level calls (fewer, but important)
  for (let i = 0; i < 15; i++) {
    const sourceIndex = Math.floor(Math.random() * nodes.length);
    const targetIndex = Math.floor(Math.random() * nodes.length);
    
    // Different levels, representing escalations or strategic calls
    if (sourceIndex !== targetIndex && 
        Math.abs(nodes[sourceIndex].group - nodes[targetIndex].group) >= 2 && 
        Math.random() > 0.6) { // Less frequent than same-level calls
      
      links.push({
        source: `node-${sourceIndex}`,
        target: `node-${targetIndex}`,
        value: 1.5,
        type: 'call'
      });
    }
  }
  
  return { nodes, links };
};

export function InsightsGraph() {
  const graphRef = useRef<HTMLDivElement>(null);
  const forceGraphRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [ForceGraph3DComponent, setForceGraph3DComponent] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [hoveredProfile, setHoveredProfile] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import the library
    const loadForceGraph = async () => {
      try {
        const ForceGraph3DModule = await import('3d-force-graph');
        setForceGraph3DComponent(() => ForceGraph3DModule.default);
      } catch (error) {
        console.error('Failed to load 3D Force Graph:', error);
      }
    };
    
    loadForceGraph();
  }, []);

  useEffect(() => {
    if (!graphRef.current || !isClient || !ForceGraph3DComponent) return;

    // Generate sample data
    const data = generateSampleData();
    
    // Position nodes vertically based on hierarchy - executives at top!
    data.nodes.forEach((node: any) => {
      // Fix Y position based on hierarchy level (fy = fixed Y)
      const hierarchyY = [300, 200, 100, 0, -100, -200, -300]; // CEO at top (300), juniors at bottom (-300)
      node.fy = hierarchyY[node.group] || 0; // Fix Y position so it doesn't move vertically
      
      // Allow X and Z to move freely for natural spread
      node.fx = undefined; // Allow X movement
      node.fz = undefined; // Allow Z movement
      
      // Shift the spread to the left to center it better in viewport
      node.x = (Math.random() - 0.5) * 150 - 100; // Shift left by 100 units
      node.z = (Math.random() - 0.5) * 150; // Keep Z centered
    });
    
    // Create the 3D force graph - keep it simple!
    const graph = ForceGraph3DComponent()(graphRef.current)
      .graphData(data)
      .backgroundColor('rgba(0,0,0,0)') // Transparent background
      .showNavInfo(false) // Hide navigation info
      .nodeLabel(() => '') // Disable default gray tooltips
      .nodeAutoColorBy('group')
      .nodeOpacity(0.9)
      .nodeResolution(16)
      .nodeVal('value')
      .linkWidth((link: any) => {
        if (link.type === 'call') return 2;
        return 1.5; // hierarchy
      })
      .linkOpacity((link: any) => {
        if (link.type === 'call') return 0.9;
        return 0.2; // hierarchy - very subtle
      })
      .linkColor((link: any) => {
        if (link.type === 'call') {
          // Create pulsing bright neon green effect for call links
          const time = Date.now() * 0.004;
          const pulse = Math.sin(time) * 0.2 + 0.8; // Oscillate between 0.6 and 1.0 (brighter)
          // Bright neon green that pulses
          const green = Math.floor((220 + 35 * pulse)); // Range from 220 to 255 (very bright)
          const red = Math.floor((10 + 20 * pulse)); // Range from 10 to 30 (minimal red)
          return `rgb(${red}, ${green}, 10)`; // Bright pulsing neon green
        }
        return '#F3F4F6'; // Very light gray for hierarchy (really subtle)
      })
      .enableNavigationControls(true) // Enable pan/zoom/rotate controls
      .enablePointerInteraction(true) // Enable mouse interaction
      .onNodeHover((node: any, prevNode: any) => {
        // Change cursor and show tooltip on hover
        if (graphRef.current) {
          graphRef.current.style.cursor = node ? 'pointer' : 'default';
        }
        
        if (node && node.profile) {
          setHoveredProfile({
            id: node.id,
            name: node.name,
            ...node.profile
          });
        } else {
          setHoveredProfile(null);
        }
      })
      .onNodeClick((node: any) => {
        // Show profile card dialog on node click
        if (node && node.profile) {
          setSelectedProfile({
            id: node.id,
            name: node.name,
            ...node.profile
          });
          setHoveredProfile(null); // Clear hover tooltip to prevent flash
          setDialogOpen(true);
        }
      });

    // Customize node colors based on organizational level
    graph.nodeColor((node: any) => {
      const colors = [
        '#8B5CF6', // Leadership (CEO/C-Suite) - Purple
        '#EF4444', // Directors - Red
        '#F59E0B', // Senior Managers - Orange
        '#10B981', // Team Leads - Green
        '#3B82F6', // Senior ICs - Blue
        '#6366F1', // Mid ICs - Indigo
        '#8B5A2B'  // Junior ICs - Brown
      ];
      return colors[node.group] || '#8B5CF6';
    });

    // Store reference for cleanup
    forceGraphRef.current = graph;
    
    // Improve camera controls for smoother interaction
    setTimeout(() => {
      const controls = graph.controls;
      if (controls) {
        // Make panning smoother and more predictable
        controls.enableDamping = true; // Smooth camera movements
        controls.dampingFactor = 0.05; // Smooth damping
        controls.screenSpacePanning = true; // Pan in screen space, not world space
        controls.enableRotate = true;
        controls.enablePan = true;
        controls.enableZoom = true;
        
        // Limit rotation to prevent weird angles
        controls.maxPolarAngle = Math.PI * 0.8; // Prevent going too far up/down
        controls.minPolarAngle = Math.PI * 0.2; // Prevent going too far up/down
        
        // Limit zoom range
        controls.minDistance = 100;
        controls.maxDistance = 2000;
        
        // Smoother rotation speed
        controls.rotateSpeed = 0.5;
        controls.panSpeed = 0.8;
        controls.zoomSpeed = 0.6;
        
        // Set default camera position to center view on the shifted graph
        if (controls.target && controls.target.set) {
          controls.target.set(-100, 0, 0); // Center target on the shifted graph
        }
      }
    }, 100);

    // Animation loop for pulsing call links
    let animationId: number;
    const animate = () => {
      if (forceGraphRef.current) {
        forceGraphRef.current.refresh(); // Trigger re-render to update colors
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (forceGraphRef.current) {
        forceGraphRef.current._destructor?.();
      }
    };
  }, [isClient, ForceGraph3DComponent]);

  if (!isClient || !ForceGraph3DComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading 3D visualization...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full relative"
      onMouseMove={(e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }}
    >
      <div 
        ref={graphRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
      
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm border">
        <h3 className="text-sm font-semibold mb-2 text-gray-900">Organizational Levels</h3>
        <div className="space-y-1">
          {[
            'Leadership (CEO/C-Suite)',
            'Directors & VPs', 
            'Senior Managers',
            'Team Leads',
            'Senior ICs',
            'Mid-level ICs',
            'Junior ICs'
          ].map((level, index) => {
            const colors = ['#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5A2B'];
            return (
              <div key={level} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index] }}
                />
                <span className="text-gray-700">{level}</span>
              </div>
            );
          })}
        </div>
      </div>

      
      {/* Hover Tooltip */}
      <HoverTooltip
        profile={hoveredProfile}
        position={mousePosition}
        visible={!!hoveredProfile}
      />
      
      {/* Profile Card Dialog */}
      <ProfileCard 
        profile={selectedProfile} 
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedProfile(null);
        }} 
      />
    </div>
  );
}