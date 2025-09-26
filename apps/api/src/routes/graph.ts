import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const graphRouter = Router();

const schema = z.object({ topic: z.string().min(1).optional(), mode: z.string().optional() });

graphRouter.get('/api/graph', async (req, res) => {
  const parsed = schema.safeParse({ topic: req.query.topic, mode: req.query.mode });
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) });
  }
  const { topic, mode } = parsed.data;
  if (mode === 'knowledge') {
    try {
      // Original queries preserved but commented out for reference
      /*
      const nodesBase = await prisma.$queryRaw<Array<{ id: string; name: string; total: number }>>`
        with selected as (
          select e.id, e.name, coalesce(sum(es.score)::float, 0) as total
          from employees e left join expertise_scores es on es.employee_id = e.id
          group by e.id, e.name
          order by total desc
          limit 50
        )
        select id, name, total from selected`;
      const edges = await prisma.$queryRaw<Array<{ a: string; b: string; weight: number }>>`
        with selected as (
          select e.id, e.name, coalesce(sum(es.score)::float, 0) as total
          from employees e left join expertise_scores es on es.employee_id = e.id
          group by e.id, e.name
          order by total desc
          limit 50
        ),
        tcounts as (
          select topic_id, count(distinct employee_id)::float as c from expertise_scores group by topic_id
        ),
        totals as (
          select count(*)::float as n from employees
        ),
        pairs as (
          select e1.employee_id as a, e2.employee_id as b,
                 least(e1.score, e2.score)::float * ln((select n from totals) / nullif((select c from tcounts where topic_id = e1.topic_id),0) + 1) as contrib
          from expertise_scores e1
          join expertise_scores e2 on e1.topic_id = e2.topic_id and e1.employee_id < e2.employee_id
          where e1.employee_id in (select id from selected) and e2.employee_id in (select id from selected)
        )
        select a, b, sum(contrib) as weight
        from pairs
        group by a, b
        having sum(contrib) >= 0.3
        order by weight desc
        limit 300`;
      */

      // MOCKED DATA FOR BETTER SHOWCASE - Generated on the fly
      
      // Define expertise categories and their colors
      const expertiseCategories = [
        { name: 'Frontend', skills: ['React', 'Vue', 'Angular', 'TypeScript', 'CSS', 'HTML', 'Next.js', 'Tailwind'] },
        { name: 'Backend', skills: ['Node.js', 'Python', 'Java', 'Go', 'Rust', 'C#', 'Ruby', 'PHP'] },
        { name: 'Database', skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'MySQL', 'Cassandra'] },
        { name: 'Cloud/DevOps', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Azure', 'GCP'] },
        { name: 'AI/ML', skills: ['TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'LLMs', 'Data Science'] },
        { name: 'Mobile', skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin'] },
        { name: 'Security', skills: ['Penetration Testing', 'OWASP', 'Cryptography', 'Network Security', 'IAM'] },
        { name: 'Architecture', skills: ['Microservices', 'System Design', 'API Design', 'Event-Driven', 'DDD'] }
      ];

      // Generate names
      const firstNames = ['Alex', 'Sarah', 'John', 'Emma', 'Michael', 'Lisa', 'David', 'Anna', 'James', 'Maria', 
                         'Robert', 'Jennifer', 'William', 'Patricia', 'Richard', 'Linda', 'Thomas', 'Barbara', 
                         'Charles', 'Elizabeth', 'Chris', 'Susan', 'Daniel', 'Jessica', 'Matthew', 'Karen',
                         'Andrew', 'Nancy', 'Paul', 'Betty', 'Mark', 'Helen', 'Steven', 'Sandra', 'Kenneth',
                         'Donna', 'Kevin', 'Carol', 'Brian', 'Ruth', 'George', 'Sharon', 'Edward', 'Michelle',
                         'Ronald', 'Laura', 'Anthony', 'Sarah', 'Jason', 'Kimberly', 'Ryan', 'Deborah',
                         'Jacob', 'Dorothy', 'Gary', 'Amy', 'Nicholas', 'Angela', 'Eric', 'Ashley'];
      
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
                         'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
                         'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
                         'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
                         'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
                         'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
                         'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'];

      // Generate 150 nodes with varied expertise
      const nodes: Array<{ id: string; label: string; score: number; expertise: string[]; primaryExpertise: string }> = [];
      const nodeCount = 150;
      
      for (let i = 0; i < nodeCount; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        const name = `${firstName} ${lastName}`;
        
        // Assign primary expertise category
        const primaryCategory = expertiseCategories[i % expertiseCategories.length];
        
        // Generate expertise array (primary + some secondary skills)
        const expertise: string[] = [];
        const primarySkillCount = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < primarySkillCount; j++) {
          expertise.push(primaryCategory.skills[Math.floor(Math.random() * primaryCategory.skills.length)]);
        }
        
        // Add some cross-functional skills
        if (Math.random() > 0.5) {
          const secondaryCategory = expertiseCategories[Math.floor(Math.random() * expertiseCategories.length)];
          expertise.push(secondaryCategory.skills[Math.floor(Math.random() * secondaryCategory.skills.length)]);
        }
        
        // Generate expertise score (higher for some key individuals)
        let score = 10 + Math.random() * 40;
        if (i < 10) score += 30; // Top experts
        if (i === 0) { // Nick Expert
          nodes.push({
            id: `node-${i}`,
            label: 'Nick Expert',
            score: 95,
            expertise: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Infrastructure', 'Monitoring'],
            primaryExpertise: 'Cloud/DevOps'
          });
        } else {
          nodes.push({
            id: `node-${i}`,
            label: name,
            score: Math.round(score),
            expertise: [...new Set(expertise)], // Remove duplicates
            primaryExpertise: primaryCategory.name
          });
        }
      }
      
      // Generate edges based on shared expertise
      const edges: Array<{ source: string; target: string; weight: number; sharedTopics: string[] }> = [];
      const edgeCount = 400;
      const addedEdges = new Set<string>();
      
      // First, create strong connections for top experts
      for (let i = 0; i < 20; i++) {
        for (let j = i + 1; j < Math.min(30, nodeCount); j++) {
          if (Math.random() > 0.7) {
            const edgeKey = `${i}-${j}`;
            if (!addedEdges.has(edgeKey)) {
              const sharedSkills = nodes[i].expertise.filter(skill => 
                nodes[j].expertise.includes(skill)
              );
              if (sharedSkills.length > 0) {
                edges.push({
                  source: `node-${i}`,
                  target: `node-${j}`,
                  weight: 0.5 + Math.random() * 0.5,
                  sharedTopics: sharedSkills
                });
                addedEdges.add(edgeKey);
              }
            }
          }
        }
      }
      
      // Create connections based on same primary expertise
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (nodes[i].primaryExpertise === nodes[j].primaryExpertise && Math.random() > 0.85) {
            const edgeKey = `${i}-${j}`;
            if (!addedEdges.has(edgeKey) && edges.length < edgeCount) {
              edges.push({
                source: `node-${i}`,
                target: `node-${j}`,
                weight: 0.3 + Math.random() * 0.4,
                sharedTopics: [nodes[i].primaryExpertise]
              });
              addedEdges.add(edgeKey);
            }
          }
        }
      }
      
      // Add random cross-functional connections
      while (edges.length < edgeCount) {
        const i = Math.floor(Math.random() * nodeCount);
        const j = Math.floor(Math.random() * nodeCount);
        if (i !== j) {
          const edgeKey = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!addedEdges.has(edgeKey)) {
            const sharedSkills = nodes[i].expertise.filter(skill => 
              nodes[j].expertise?.includes(skill)
            );
            if (sharedSkills.length > 0 || Math.random() > 0.9) {
              edges.push({
                source: `node-${Math.min(i, j)}`,
                target: `node-${Math.max(i, j)}`,
                weight: 0.1 + Math.random() * 0.3,
                sharedTopics: sharedSkills.length > 0 ? sharedSkills : ['Collaboration']
              });
              addedEdges.add(edgeKey);
            }
          }
        }
      }
      
      // Return the mocked data
      return res.json({ 
        nodes: nodes.map(n => ({ 
          id: n.id, 
          label: n.label, 
          score: n.score,
          expertise: n.expertise,
          primaryExpertise: n.primaryExpertise
        })), 
        edges: edges.map(e => ({ 
          source: e.source, 
          target: e.target, 
          weight: e.weight, 
          sharedTopics: e.sharedTopics 
        })), 
        insights: { type: 'knowledge' },
        expertiseCategories: expertiseCategories.map(cat => cat.name)
      });
    } catch (e) {
      console.error('knowledge graph error', e);
      return res.json({ nodes: [], edges: [], insights: { type: 'knowledge' } });
    }
  }
  if (!topic) {
    // Org hierarchy tree: nodes are employees; edges are manager -> report
    const employees = await prisma.employees.findMany({ select: { id: true, name: true, role: true, manager_id: true } });
    const nodes = employees.map(e => ({ id: e.id, label: e.name, role: e.role ?? null }));
    const edges = employees.filter(e => e.manager_id).map(e => ({ source: e.manager_id as string, target: e.id }));
    return res.json({ nodes, edges, insights: { type: 'org' } });
  }
  const rows = await prisma.$queryRaw<Array<{ employee_id: string; name: string; score: number; freshness_days: number }>>`
    with t as (select id from topics where name = ${topic})
    select e.employee_id, emp.name, e.score, e.freshness_days
    from expertise_scores e
    join employees emp on emp.id = e.employee_id
    where e.topic_id = (select id from t)
    order by e.score desc
    limit 20
  `;
  const nodes = rows.map(r => ({ id: r.employee_id, label: r.name, score: Number(r.score) }));
  // Topic-scoped edges: pairwise overlap with freshness weighting and thresholds
  const edgeRows = await prisma.$queryRaw<Array<{ a: string; b: string; weight: number; score_a: number; score_b: number }>>`
    with k as (
      select e.employee_id, e.score, e.freshness_days
      from expertise_scores e
      join topics t on t.id = e.topic_id
      where t.name = ${topic}
    ),
    pairs as (
      select a.employee_id as a,
             b.employee_id as b,
             a.score as score_a,
             b.score as score_b,
             least(a.score, b.score) as min_score,
             greatest(a.freshness_days, b.freshness_days) as max_fresh
      from k a
      join k b on a.employee_id < b.employee_id
    )
    select a, b,
           (min_score * (1.0 / (1 + (max_fresh::float / 30.0)))) as weight,
           score_a, score_b
    from pairs
    where min_score >= 0.4 and max_fresh <= 60
      and (min_score * (1.0 / (1 + (max_fresh::float / 30.0)))) >= 0.25
    order by weight desc
    limit 200
  `;
  const edges = edgeRows.map(er => ({
    source: er.a,
    target: er.b,
    weight: Number(er.weight),
    sharedTopics: [{ name: topic, scoreA: Number(er.score_a), scoreB: Number(er.score_b) }]
  }));
  // Co-participation meeting edges on same topic (lightweight weight 0.3)
  const meetingEdges = await prisma.$queryRaw<Array<{ a: string; b: string; weight: number }>>`
    with t as (select id from topics where name = ${topic}),
    mt as (
      select mt.meeting_id from meeting_topics mt where mt.topic_id = (select id from t)
    ),
    pairs as (
      select p1.employee_id as a, p2.employee_id as b
      from meeting_participants p1
      join meeting_participants p2 on p1.meeting_id = p2.meeting_id and p1.employee_id < p2.employee_id
      where p1.meeting_id = any (select meeting_id from mt)
    )
    select a, b, 0.3::float as weight from pairs
  `;
  const meetingEdgeObjs = meetingEdges.map(me => ({ source: me.a, target: me.b, weight: Number(me.weight), sharedTopics: [{ name: topic }] }));
  const allEdges = [...edges, ...meetingEdgeObjs];
  const busFactor = nodes.length >= 3 ? nodes.slice(0,3).reduce((s,n)=>s+n.score,0) / (nodes.reduce((s,n)=>s+n.score,0)+1e-6) : 1;
  res.json({ nodes, edges: allEdges, insights: { busFactor } });
});


