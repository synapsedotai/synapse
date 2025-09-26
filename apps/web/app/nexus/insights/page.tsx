"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldExclamationIcon,
  FireIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  CheckIcon,
} from "@heroicons/react/24/solid";

// HR Risk Intelligence - Knowledge retention alerts
const hrRiskAlerts = [
  {
    name: "Nick Expert",
    role: "DevOps Engineer",
    department: "Infrastructure Team",
    risk: "Critical",
    severity: "Immediate",
    meetings: 87,
    currentComp: 180000,
    marketAverage: 220000,
    compGap: -40000,
    retirementRisk: true,
    age: 64,
    knowledgeAreas: ["Kubernetes", "CI/CD", "AWS", "Docker", "Monitoring", "Infrastructure", "Deployment", "Legacy Systems"],
    impactRating: 98,
    lastRaise: "24 months ago",
    tenure: "10 years"
  },
  {
    name: "Sarah Martinez",
    role: "Senior Data Architect", 
    department: "Engineering",
    risk: "High",
    severity: "Urgent",
    meetings: 47,
    currentComp: 165000,
    marketAverage: 200000,
    compGap: -35000,
    retirementRisk: false,
    knowledgeAreas: ["Data Pipeline", "ML Infrastructure", "Analytics Platform"],
    impactRating: 92,
    lastRaise: "18 months ago",
    tenure: "3 years"
  },
  {
    name: "Robert Chen",
    role: "Principal Engineer",
    department: "Engineering", 
    risk: "Critical", 
    severity: "Immediate",
    meetings: 89,
    currentComp: 220000,
    marketAverage: 220000,
    compGap: 0,
    retirementRisk: true,
    age: 62,
    knowledgeAreas: ["Legacy Systems", "Core Infrastructure", "Security Architecture"],
    impactRating: 98,
    lastRaise: "6 months ago",
    tenure: "12 years"
  },
  {
    name: "Maria Rodriguez",
    role: "Design Lead",
    department: "Design",
    risk: "Medium",
    severity: "Monitor",
    meetings: 34,
    currentComp: 142000,
    marketAverage: 160000,
    compGap: -18000,
    retirementRisk: false,
    knowledgeAreas: ["Design System", "UX Research", "Product Strategy"],
    impactRating: 88,
    lastRaise: "12 months ago",
    tenure: "2.5 years"
  },
  {
    name: "David Kim",
    role: "Staff Engineer",
    department: "Engineering",
    risk: "High",
    severity: "Urgent", 
    meetings: 67,
    currentComp: 178000,
    marketAverage: 220000,
    compGap: -42000,
    retirementRisk: false,
    knowledgeAreas: ["Microservices", "Platform Architecture", "DevOps", "Kubernetes"],
    impactRating: 95,
    lastRaise: "24 months ago",
    tenure: "4 years"
  }
];

export default function NexusInsights() {
  const [resolvedAlerts, setResolvedAlerts] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState<{open: boolean, person: any}>({open: false, person: null});
  const [resolutionNote, setResolutionNote] = useState("");
  const [highlightedPerson, setHighlightedPerson] = useState<string | null>(null);
  
  // Set highlighted person based on URL parameter - using window.location for OpenNext compatibility
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const highlightParam = params.get('highlight');
    
    if (highlightParam) {
      // Convert the URL-safe ID back to a name for matching
      setHighlightedPerson(highlightParam);
      
      // Auto-scroll to the highlighted person after a short delay
      setTimeout(() => {
        const element = document.getElementById(`person-${highlightParam}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Add a pulse animation effect
          element.classList.add('animate-pulse');
          setTimeout(() => {
            element.classList.remove('animate-pulse');
          }, 2000);
        }
      }, 100);
    }
  }, []);

  const handleViewMore = (person: any) => {
    setDetailModal({open: true, person});
  };

  const confirmResolution = () => {
    if (detailModal.person) {
      setResolvedAlerts(prev => [...prev, detailModal.person.name]);
      setDetailModal({open: false, person: null});
      setResolutionNote("");
    }
  };

  const activeAlerts = hrRiskAlerts.filter(alert => !resolvedAlerts.includes(alert.name));

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">HR Intelligence</h1>
        <p className="text-muted-foreground">
          Knowledge retention risks and strategic talent insights
        </p>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
            <FireIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">2</div>
            <p className="text-xs text-red-600">
              Immediate action required
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risks</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">2</div>
            <p className="text-xs text-orange-600">
              Urgent attention needed
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risks</CardTitle>
            <ClockIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">1</div>
            <p className="text-xs text-yellow-600">
              Monitor closely
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      <Card className="border-black/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldExclamationIcon className="h-5 w-5 text-red-600" />
            Knowledge Retention Risks
          </CardTitle>
          <CardDescription>
            High-value experts at risk of departure - immediate HR attention needed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeAlerts.map((person) => {
            const personId = person.name.toLowerCase().replace(/\s+/g, '-');
            const isHighlighted = highlightedPerson === personId;
            
            return (
            <div 
              key={person.name} 
              id={`person-${personId}`}
              className={`p-4 border rounded-lg bg-white hover:bg-gray-50 transition-all duration-300 ${
                isHighlighted ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg bg-blue-50 hover:bg-blue-100' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm truncate">{person.name}</h4>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{person.role}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <ChatBubbleLeftRightIcon className="w-3 h-3" />
                        <strong>{person.meetings}</strong> meetings
                      </span>
                      <span className="flex items-center gap-1">
                        <TrophyIcon className="w-3 h-3" />
                        <strong>{person.impactRating}</strong>/100 impact
                      </span>
                      <span className="flex items-center gap-1">
                        <CurrencyDollarIcon className="w-3 h-3" />
                        <strong className="text-red-600">{person.compGap < 0 ? `-$${Math.abs(person.compGap/1000)}K` : 'Market'}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {person.compGap < 0 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        Undercomp
                      </Badge>
                    )}
                    {person.retirementRisk && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        Retirement Risk
                      </Badge>
                    )}
                    <Badge className={`text-xs ${
                      person.risk === 'Critical' ? 'bg-red-100 text-red-700' :
                      person.risk === 'High' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {person.risk}
                    </Badge>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 px-3"
                    onClick={() => handleViewMore(person)}
                  >
                    View More
                  </Button>
                </div>
              </div>
              
              {/* Compact knowledge areas */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {person.knowledgeAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Data Attribution */}
      <Card className="border-black/10 bg-blue-50">
        <CardContent className="p-4">
          <div className="text-sm text-blue-800 flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5" />
            <div>
              <div className="font-semibold">Market Compensation Data</div>
              <div className="text-xs text-blue-600 mt-1">
                Salary benchmarks sourced from <strong>Glassdoor</strong> industry data, filtered by role, location, and company size. 
                Risk algorithms analyze tenure, expertise level, external recruiting activity, and retention indicators.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModal.open} onOpenChange={(open) => setDetailModal({open, person: null})}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>HR Alert Details</DialogTitle>
            <DialogDescription>
              Detailed retention risk analysis and resolution options. Resolved alerts will be re-checked in 30 days.
            </DialogDescription>
          </DialogHeader>
          
          {detailModal.person && (
            <div className="space-y-4">
              {/* Person Header */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-white text-gray-700 font-semibold">
                    {detailModal.person.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold">{detailModal.person.name}</h4>
                  <p className="text-sm text-gray-600">{detailModal.person.role}</p>
                  <p className="text-xs text-gray-500">{detailModal.person.department} • {detailModal.person.tenure}</p>
                </div>
              </div>

              {/* Compensation Analysis */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Current Compensation</div>
                  <div className="text-xl font-bold">${detailModal.person.currentComp.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Last raise: {detailModal.person.lastRaise}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Market Average</div>
                  <div className="text-xl font-bold">${detailModal.person.marketAverage.toLocaleString()}</div>
                  <div className={`text-xs font-medium ${detailModal.person.compGap < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {detailModal.person.compGap < 0 ? `$${Math.abs(detailModal.person.compGap).toLocaleString()} below market` : 'At market rate'}
                  </div>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">{detailModal.person.meetings}</div>
                  <div className="text-xs text-blue-600">Expert Meetings</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">{detailModal.person.impactRating}/100</div>
                  <div className="text-xs text-purple-600">Impact Rating</div>
                </div>
              </div>

              {/* Knowledge Areas */}
              <div>
                <div className="text-sm font-semibold mb-2">Critical Knowledge Areas</div>
                <div className="flex flex-wrap gap-1">
                  {detailModal.person.knowledgeAreas.map((area: string) => (
                    <Badge key={area} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Resolution Section */}
              <div className="border-t pt-4">
                <div className="text-sm font-semibold mb-2">Resolution Notes</div>
                <div className="text-xs text-gray-600 mb-2">
                  Document actions taken. System will automatically re-check this alert in 30 days.
                </div>
                <Textarea
                  placeholder="Describe the actions taken to address this risk..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="min-h-[80px] mb-3"
                />
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setDetailModal({open: false, person: null})}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={confirmResolution}
                    disabled={!resolutionNote.trim()}
                    className="flex-1"
                  >
                    <CheckIcon className="w-4 h-4 mr-1" />
                    Mark Resolved (30d follow-up)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
