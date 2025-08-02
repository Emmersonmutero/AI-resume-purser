"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
  ChartConfig
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import type { MatchResumeToJobsOutput } from "@/ai/flows/match-resume-to-jobs"
import { Badge } from "../ui/badge"

const chartConfig = {
    "Senior": { label: "Senior", color: "hsl(var(--chart-1))" },
    "Full Stack": { label: "Full Stack", color: "hsl(var(--chart-2))" },
    "Backend": { label: "Backend", color: "hsl(var(--chart-3))" },
    "Frontend": { label: "Frontend", color: "hsl(var(--chart-4))" },
    "Other": { label: "Other", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

type ThreatsByVirusChartProps = {
  matches: MatchResumeToJobsOutput | null;
  isLoading: boolean;
};

export function ThreatsByVirusChart({ matches, isLoading }: ThreatsByVirusChartProps) {
    const chartData = React.useMemo(() => {
        if (!matches) return [];

        const keywords = Object.keys(chartConfig).slice(0, -1);
        const distribution: { [key: string]: { name: string, value: number, fill: string } } = {};

        keywords.forEach(keyword => {
            distribution[keyword] = {
                name: keyword,
                value: 0,
                fill: `var(--color-${keyword})`
            };
        });
        distribution.Other = {
            name: "Other",
            value: 0,
            fill: "var(--color-Other)"
        };

        matches.forEach(match => {
            let found = false;
            for (const keyword of keywords) {
                if (match.jobPosting.toLowerCase().includes(keyword.toLowerCase())) {
                    distribution[keyword].value += 1;
                    found = true;
                    break;
                }
            }
            if (!found) {
                distribution.Other.value += 1;
            }
        });

        return Object.values(distribution).filter(d => d.value > 0);
    }, [matches]);

    const totalMatches = React.useMemo(() => {
        if (!matches) return 0;
        return matches.length;
    }, [matches]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
            <CardTitle>Threats By Keyword</CardTitle>
             <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4"/>
            </Button>
        </div>
        <CardDescription>Job distribution by keywords</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
         {isLoading || !matches ? (
            <div className="h-[200px] w-full flex items-center justify-center">
                <div className="animate-pulse rounded-lg bg-muted h-full w-full"></div>
            </div>
         ) : (
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" hideLabel />}
            />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80}>
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-2xl font-bold">{totalMatches}</p>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
            </div>
        </ChartContainer>
         )}
      </CardContent>
    </Card>
  )
}
