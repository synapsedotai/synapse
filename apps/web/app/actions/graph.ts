'use server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.synapse.elia.vc';

export interface KnowledgeNode {
  id: string;
  label: string;
  score: number;
  expertise?: string[];
  primaryExpertise?: string;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  weight: number;
  sharedTopics?: string[];
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  insights: {
    type: string;
  };
  expertiseCategories?: string[];
}

export async function fetchKnowledgeGraph(): Promise<KnowledgeGraphData> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/graph?mode=knowledge`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch knowledge graph: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching knowledge graph:', error);
    // Return empty data on error
    return {
      nodes: [],
      edges: [],
      insights: { type: 'knowledge' }
    };
  }
}
