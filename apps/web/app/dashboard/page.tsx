"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

// Generate random data for charts
const weeklyData = [
  { day: "Mon", insights: 12, connections: 3, points: 45 },
  { day: "Tue", insights: 18, connections: 5, points: 72 },
  { day: "Wed", insights: 15, connections: 2, points: 58 },
  { day: "Thu", insights: 25, connections: 7, points: 95 },
  { day: "Fri", insights: 22, connections: 4, points: 83 },
  { day: "Sat", insights: 8, connections: 1, points: 32 },
  { day: "Sun", insights: 10, connections: 2, points: 40 },
];

const monthlyProgress = [
  { month: "Jan", rank: 142, score: 1200 },
  { month: "Feb", rank: 128, score: 1450 },
  { month: "Mar", rank: 115, score: 1680 },
  { month: "Apr", rank: 98, score: 1920 },
  { month: "May", rank: 87, score: 2150 },
  { month: "Jun", rank: 72, score: 2400 },
];

const expertiseAreas = [
  { area: "Product Design", level: 85 },
  { area: "User Research", level: 72 },
  { area: "Design Systems", level: 90 },
  { area: "Prototyping", level: 68 },
  { area: "Team Leadership", level: 78 },
];

const upcomingCalls = [
  {
    id: 1,
    name: "Sarah Kim",
    role: "Senior Frontend Engineer",
    topic: "React component architecture",
    time: "Today, 2:30 PM",
    duration: "30 min",
    type: "expert-call"
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    role: "Data Scientist",
    topic: "ML pipeline optimization",
    time: "Tomorrow, 10:00 AM", 
    duration: "45 min",
    type: "expert-call"
  },
  {
    id: 3,
    name: "Emma Wilson",
    role: "UX Researcher",
    topic: "User testing methodology",
    time: "Thursday, 3:00 PM",
    duration: "30 min",
    type: "expert-call"
  }
];

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and contributions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <TrophyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,400</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Rank</CardTitle>
            <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#72</div>
            <p className="text-xs text-muted-foreground">
              Top 5% contributor
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Streak</CardTitle>
            <FireIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 weeks</div>
            <p className="text-xs text-muted-foreground">
              Personal best: 12 weeks
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <UserGroupIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              23 this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-black/10 max-w-[80vw]">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>
              Your insights and connections over the past week
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full overflow-hidden">
            <ChartContainer
              config={{
                insights: {
                  label: "Insights",
                  color: "#000000",
                },
                connections: {
                  label: "Connections",
                  color: "#eeebe3",
                },
              }}
              className="h-[300px] max-w-full sm:max-w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="day" stroke="#737373" />
                  <YAxis stroke="#737373" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="insights"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={{ fill: "#000000", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="connections"
                    stroke="#737373"
                    strokeWidth={2}
                    dot={{ fill: "#737373", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Rank Progress</CardTitle>
            <CardDescription>
              Your ranking improvement over time
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full max-w-[80vw] overflow-hidden">
            <ChartContainer
              config={{
                rank: {
                  label: "Rank",
                  color: "#000000",
                },
              }}
              className="h-[300px] max-w-[88vw] sm:max-w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="month" stroke="#737373" />
                  <YAxis reversed stroke="#737373" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="rank"
                    stroke="#000000"
                    fill="#eeebe3"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expertise and Achievements */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Expertise Areas</CardTitle>
            <CardDescription>
              AI-identified areas of your expertise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expertiseAreas.map((area) => (
              <div key={area.area} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{area.area}</span>
                  <span className="text-sm text-muted-foreground">
                    {area.level}%
                  </span>
                </div>
                <Progress value={area.level} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>
              Your latest milestones and badges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeebe3]">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Expert Helper</p>
                <p className="text-xs text-muted-foreground">
                  Helped 10 colleagues this month
                </p>
              </div>
              <Badge>+50 pts</Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeebe3]">
                <FireIcon className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">On Fire</p>
                <p className="text-xs text-muted-foreground">
                  8 week contribution streak
                </p>
              </div>
              <Badge>+100 pts</Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeebe3]">
                <ArrowTrendingUpIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Rising Star</p>
                <p className="text-xs text-muted-foreground">
                  Fastest growing contributor
                </p>
              </div>
              <Badge>+200 pts</Badge>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeebe3]">
                <TrophyIcon className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Top 5%</p>
                <p className="text-xs text-muted-foreground">
                  Reached top 5% of contributors
                </p>
              </div>
              <Badge variant="secondary">Prestige</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calls and Points */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Upcoming Expert Calls</CardTitle>
            <CardDescription>
              Your scheduled knowledge sharing sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingCalls.map((call) => (
              <div key={call.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeebe3]">
                  <PhoneIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{call.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {call.duration}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{call.topic}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ClockIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{call.time}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full mt-3" size="sm">
              <CalendarIcon className="h-4 w-4 mr-2" />
              View All Calls
            </Button>
          </CardContent>
        </Card>

        <Card className="border-black/10">
          <CardHeader>
            <CardTitle>Points Breakdown</CardTitle>
            <CardDescription>
              How you earned points this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                points: {
                  label: "Points",
                  color: "#000000",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="day" stroke="#737373" />
                  <YAxis stroke="#737373" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="points" fill="#000000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
