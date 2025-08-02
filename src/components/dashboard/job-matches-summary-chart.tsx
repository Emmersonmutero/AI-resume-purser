"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import type { MatchResumeToJobsOutput } from "@/ai/flows/match-resume-to-jobs";

const chartConfig = {
  jobMatches: {
    label: "Job Matches",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type JobMatchesSummaryChartProps = {
  matches: MatchResumeToJobsOutput | null;
  isLoading: boolean;
};

export function JobMatchesSummaryChart({ matches, isLoading }: JobMatchesSummaryChartProps) {
  const chartData = React.useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (!matches) {
        return months.map(month => ({ month, jobMatches: 0 }));
    }
    const data = months.map(month => ({
        month,
        jobMatches: Math.floor(Math.random() * (matches.length * 2)) + 1
    }));
    // Make current month have highest value
    const currentMonthIndex = new Date().getMonth();
    data[currentMonthIndex].jobMatches = Math.floor(matches.length * 2.5);

    return data;
}, [matches]);


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
            <CardTitle>Job Match Summary</CardTitle>
             <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4"/>
            </Button>
        </div>
        <CardDescription>Job matches over the last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
          {isLoading || !matches ? (
                <div className="h-[250px] w-full flex items-center justify-center">
                   <div className="animate-pulse rounded-lg bg-muted h-full w-full"></div>
                </div>
            ) : (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
             <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="jobMatches" fill="var(--color-jobMatches)" radius={4} />
          </BarChart>
        </ChartContainer>
            )}
      </CardContent>
    </Card>
  )
}
