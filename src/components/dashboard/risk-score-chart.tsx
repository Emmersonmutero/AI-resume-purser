"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { MoreVertical } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { MatchResumeToJobsOutput } from "@/ai/flows/match-resume-to-jobs";
import { Button } from "../ui/button";

const chartConfig = {
  score: {
    label: "Score",
  },
  average: {
    label: "Average",
    color: "hsl(var(--muted-foreground))",
  },
  good: {
    label: "Good",
    color: "hsl(var(--chart-2))",
  },
  perfect: {
    label: "Perfect",
    color: "hsl(var(--chart-1))",
  },
}

type RiskScoreChartProps = {
  matches: MatchResumeToJobsOutput | null;
  isLoading: boolean;
};

export function RiskScoreChart({ matches, isLoading }: RiskScoreChartProps) {
  const averageScore = React.useMemo(() => {
    if (!matches || matches.length === 0) return 0;
    const totalScore = matches.reduce((sum, match) => sum + match.matchScore, 0);
    return Math.round((totalScore / matches.length) * 100);
  }, [matches]);

  const chartData = [
    { name: "average", value: averageScore, fill: "var(--color-average)" },
    { name: "good", value: 85 - averageScore, fill: "var(--color-good)" },
    { name: "perfect", value: 100 - 85, fill: "var(--color-perfect)" },
  ];

  const getLevel = (score: number) => {
    if (score >= 85) return { text: "High", className: "text-primary" };
    if (score >= 70) return { text: "Medium", className: "text-yellow-500" };
    return { text: "Low", className: "text-red-500" };
  }

  const level = getLevel(averageScore);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex justify-between items-center w-full">
            <CardTitle>Risk Score</CardTitle>
             <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4"/>
            </Button>
        </div>
        <CardDescription>Average Match Score</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
            {isLoading || !matches ? (
                <div className="h-full w-full flex items-center justify-center">
                   <div className="animate-pulse rounded-full bg-muted h-[200px] w-[200px]"></div>
                </div>
            ) : (
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={80}
              strokeWidth={5}
              startAngle={180}
              endAngle={0}
              activeIndex={0}
              activeShape={({ outerRadius = 0, ...props }) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector {...props} outerRadius={outerRadius} />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <>
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {averageScore.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Score
                        </tspan>
                      </text>
                      <text
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 50}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                         <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 40}
                          className={`font-semibold ${level.className}`}
                        >
                         {level.text}
                        </tspan>
                      </text>
                      </>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
            )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Scores are trending up <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing average score for all matched jobs
        </div>
      </CardFooter>
    </Card>
  )
}
