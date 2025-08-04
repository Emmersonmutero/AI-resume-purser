
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
    const data = months.map(month => ({ month, jobMatches: 0 }));

    if (matches) {
        // This is a simulation for demonstration. In a real app, you'd use timestamps.
        const currentMonthIndex = new Date().getMonth();
        // Distribute matches across previous months
        matches.forEach((_, index) => {
            const monthIndex = (currentMonthIndex - (index % 6) + 12) % 12;
            data[monthIndex].jobMatches += 1;
        });
        // Give a boost to the current month
        if (data[currentMonthIndex].jobMatches > 0) {
            data[currentMonthIndex].jobMatches = Math.ceil(data[currentMonthIndex].jobMatches * 1.5);
        } else if (matches.length > 0) {
           data[currentMonthIndex].jobMatches = Math.ceil(matches.length / 5)
        }
    }
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
        <CardDescription>A summary of your job matches over time</CardDescription>
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
