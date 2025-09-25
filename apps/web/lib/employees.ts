export interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  office: string;
  building: string;
  expertise: string[];
  experience: string;
  about: string;
  email: string;
}

export const employees: Employee[] = [
  {
    id: "1",
    name: "John Doe",
    title: "Senior Product Designer",
    department: "Product Design Team - Platform Squad",
    office: "San Francisco Office",
    building: "Building 3, Floor 4",
    expertise: ["Design Systems", "Component Library", "Frontend Architecture", "User Research", "Prototyping"],
    experience: "5+ years in UX/UI Design",
    about: "Led the migration of our design system to the new component library. Deep knowledge of our internal tools, CI/CD pipeline, and frontend architecture. Happy to share knowledge about our design tokens, component patterns, and best practices for cross-team collaboration.",
    email: "john.doe@company.com"
  },
  {
    id: "2", 
    name: "Sarah Chen",
    title: "DevOps Engineer",
    department: "Infrastructure Team",
    office: "San Francisco Office",
    building: "Building 2, Floor 3", 
    expertise: ["Kubernetes", "CI/CD", "AWS", "Docker", "Monitoring", "Infrastructure", "Deployment"],
    experience: "4+ years in DevOps",
    about: "Manages our entire cloud infrastructure and deployment pipelines. Expert in containerization, orchestration, and monitoring systems. Can help with scaling issues, performance optimization, and infrastructure best practices.",
    email: "sarah.chen@company.com"
  },
  {
    id: "3",
    name: "Marcus Williams", 
    title: "Senior Software Engineer",
    department: "Backend Engineering Team",
    office: "San Francisco Office",
    building: "Building 1, Floor 2",
    expertise: ["Microservices", "API Design", "Database Architecture", "System Design", "Performance", "Scalability"],
    experience: "6+ years in Backend Engineering", 
    about: "Architect of our microservices platform and API gateway. Deep expertise in distributed systems, database optimization, and high-performance backend development. Great resource for architectural decisions and system scaling.",
    email: "marcus.williams@company.com"
  },
  {
    id: "4",
    name: "Lisa Rodriguez",
    title: "Compliance & Security Specialist", 
    department: "Legal & Compliance Team",
    office: "San Francisco Office",
    building: "Building 4, Floor 1",
    expertise: ["GDPR", "SOC2", "Security Audits", "Data Privacy", "Compliance", "Risk Management"],
    experience: "7+ years in Compliance",
    about: "Leads our compliance initiatives and security audits. Expert in GDPR, SOC2, and various regulatory requirements. Can help navigate legal requirements, data privacy concerns, and security best practices for product development.",
    email: "lisa.rodriguez@company.com"
  },
  {
    id: "5", 
    name: "David Kumar",
    title: "SAP HANA Specialist",
    department: "Enterprise Data Team", 
    office: "San Francisco Office",
    building: "Building 2, Floor 5",
    expertise: ["SAP HANA", "Data Modeling", "ETL", "Business Intelligence", "Data Warehousing", "SQL"],
    experience: "8+ years in Enterprise Data",
    about: "Our go-to expert for SAP HANA and enterprise data solutions. Manages our data warehouse, ETL processes, and business intelligence systems. Can help with data modeling, performance tuning, and complex analytics requirements.",
    email: "david.kumar@company.com"
  }
];

export function findBestEmployee(query: string): Employee {
  const lowerQuery = query.toLowerCase();
  
  // Score each employee based on expertise match
  const scoredEmployees = employees.map(employee => {
    let score = 0;
    
    // Check expertise keywords
    employee.expertise.forEach(skill => {
      if (lowerQuery.includes(skill.toLowerCase())) {
        score += 10;
      }
    });
    
    // Check title and department
    if (lowerQuery.includes(employee.title.toLowerCase())) score += 5;
    if (lowerQuery.includes(employee.department.toLowerCase())) score += 3;
    
    // Specific keyword matching
    if (lowerQuery.includes('design') || lowerQuery.includes('ui') || lowerQuery.includes('ux')) {
      if (employee.id === "1") score += 15;
    }
    if (lowerQuery.includes('devops') || lowerQuery.includes('infrastructure') || lowerQuery.includes('deployment')) {
      if (employee.id === "2") score += 15;
    }
    if (lowerQuery.includes('backend') || lowerQuery.includes('api') || lowerQuery.includes('microservice')) {
      if (employee.id === "3") score += 15;
    }
    if (lowerQuery.includes('compliance') || lowerQuery.includes('security') || lowerQuery.includes('gdpr')) {
      if (employee.id === "4") score += 15;
    }
    // SAP/S4 HANA synonyms
    if (
      lowerQuery.includes('sap') ||
      lowerQuery.includes('hana') ||
      lowerQuery.includes('s4') ||
      lowerQuery.includes('s/4') ||
      lowerQuery.includes('s4hana') ||
      lowerQuery.includes('s/4hana') ||
      lowerQuery.includes('sap hana') ||
      lowerQuery.includes('s4 hana') ||
      lowerQuery.includes('data')
    ) {
      if (employee.id === "5") score += 15;
    }
    
    return { employee, score };
  });
  
  // Sort by score and return the best match
  scoredEmployees.sort((a, b) => b.score - a.score);
  
  // Always return someone (fallback to John if no good match)
  return scoredEmployees[0].score > 0 ? scoredEmployees[0].employee : employees[0];
}
