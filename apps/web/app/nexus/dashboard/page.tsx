"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";

// Executive-level metrics for expert matching platform
const weeklyInterviews = [
  { week: "W1", completed: 847, total: 1200, satisfaction: 4.2 },
  { week: "W2", completed: 923, total: 1200, satisfaction: 4.3 },
  { week: "W3", completed: 1089, total: 1200, satisfaction: 4.5 },
  { week: "W4", completed: 1156, total: 1200, satisfaction: 4.4 },
];

const expertMatchingData = [
  { month: "Jan", matches: 234, success: 89, time: 2.3, satisfaction: 4.1 },
  { month: "Feb", matches: 287, success: 92, time: 2.1, satisfaction: 4.2 },
  { month: "Mar", matches: 312, success: 94, time: 1.8, satisfaction: 4.4 },
  { month: "Apr", matches: 356, success: 96, time: 1.6, satisfaction: 4.3 },
  { month: "May", matches: 423, success: 97, time: 1.4, satisfaction: 4.5 },
  { month: "Jun", matches: 478, success: 98, time: 1.2, satisfaction: 4.6 },
];

const teamEngagement = [
  { team: "Platform Engineering", engagement: 96, experts: 12, lead: "Alex Chen" },
  { team: "Mobile Development", engagement: 89, experts: 8, lead: "Sarah Kim" },
  { team: "Data Science", engagement: 94, experts: 6, lead: "Mike Rodriguez" },
  { team: "Design Systems", engagement: 91, experts: 5, lead: "Emma Wilson" },
  { team: "Sales Engineering", engagement: 73, experts: 4, lead: "David Park" },
  { team: "DevOps & Infrastructure", engagement: 88, experts: 7, lead: "Lisa Zhang" },
  { team: "Product Strategy", engagement: 85, experts: 9, lead: "James Taylor" },
  { team: "Marketing Analytics", engagement: 67, experts: 3, lead: "Maria Garcia" },
];

export default function NexusDashboard() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Executive Dashboard</h1>
        <p className="text-muted-foreground">
          Expert matching platform insights and organizational intelligence
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Interviews</CardTitle>
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,156</div>
            <p className="text-xs text-muted-foreground">
              96% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expert Matches</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">478</div>
            <p className="text-xs text-muted-foreground">
              +13% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Match Success</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              Industry leading accuracy
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Match Time</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2m</div>
            <p className="text-xs text-muted-foreground">
              Down 48% this quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Interview Completion Trends</CardTitle>
            <CardDescription>
              Weekly interview completion rates across the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completed: {
                  label: "Completed",
                  color: "#8B5CF6",
                },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%" className="w-full">
                <AreaChart data={weeklyInterviews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="week" stroke="#737373" />
                  <YAxis stroke="#737373" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Post-Meeting Satisfaction</CardTitle>
            <CardDescription>
              Satisfaction ratings from expert meetings (both parties)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                satisfaction: {
                  label: "Satisfaction",
                  color: "#10B981",
                },
              }}
              className="h-[280px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%" className="w-full">
                <AreaChart data={expertMatchingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="month" stroke="#737373" />
                  <YAxis domain={[3.5, 5]} stroke="#737373" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="satisfaction"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Team Engagement</CardTitle>
            <CardDescription>
              Interview participation and knowledge sharing by team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamEngagement.map((team) => (
              <div key={team.team} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{team.team}</span>
                    <div className="text-xs text-muted-foreground">Led by {team.lead}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {team.experts} experts
                    </Badge>
                    <span className="text-sm font-medium text-gray-700">
                      {team.engagement}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={team.engagement} 
                  className="h-1.5 [&>div]:bg-gray-700"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Platform Intelligence</CardTitle>
            <CardDescription>
              Critical metrics and operational insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-green-800">98%</p>
                  <p className="text-xs text-green-600">Match Accuracy</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-purple-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-purple-800">73%</p>
                  <p className="text-xs text-purple-600">Expert Utilization</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-blue-800">+127</p>
                  <p className="text-xs text-blue-600">New Expertise Areas</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-800">4</p>
                  <p className="text-xs text-red-600">Retention Risks</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                <ClockIcon className="h-6 w-6 text-amber-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800">Avg. 1.2min Response</p>
                  <p className="text-xs text-amber-600">48% improvement this quarter</p>
                </div>
                <Badge className="bg-amber-100 text-amber-800 text-xs">Excellent</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
