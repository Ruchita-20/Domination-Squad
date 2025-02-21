"use client"

import { TrendingUp } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Function to calculate days in the month
const getMonthDaysData = () => {
  const today = new Date()
  const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const daysPassed = today.getDate()
  return { totalDays, daysPassed, remainingDays: totalDays - daysPassed }
}

const { totalDays, daysPassed, remainingDays } = getMonthDaysData()

const chartData = [{ name: "Days", passed: daysPassed, remaining: remainingDays }]

const chartConfig = {
  passed: {
    label: "Days Passed",
    color: "hsl(var(--chart-1))", // Customize the color for days passed
  },
  remaining: {
    label: "Remaining Days",
    color: "hsl(var(--chart-2))", // Customize the color for remaining days
  },
} satisfies ChartConfig

export function Days() {
  const totalDaysInMonth = totalDays

  return (
    <Card className="flex flex-col rounded-lg shadow-lg">
      <CardHeader className="items-center pb-0">
        <CardTitle>Monthly Days Overview</CardTitle>
        <CardDescription>
          {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalDaysInMonth.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Total Days
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="passed"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-passed)" // Passed days color
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="remaining"
              fill="var(--color-remaining)" // Remaining days color
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          <strong>{daysPassed}</strong> days have passed, <strong>{remainingDays}</strong> days left.
        </div>
      </CardFooter>
    </Card>
  )
}
