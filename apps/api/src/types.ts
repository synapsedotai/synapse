export type Snippet = { text: string; source: string; docId: string };
export type CandidateTopic = { name: string; confidence: number };
export type Expert = { employeeId: string; name: string; score: number; freshnessDays: number };

export type SearchResult = {
  plan: string[];
  snippets: Snippet[];
  candidateTopics: CandidateTopic[];
  experts: Expert[];
};

