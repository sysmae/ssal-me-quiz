// ScoreDistributionChart.tsx
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

type ScoreDistributionChartProps = {
  scoreData: number[]
}

export default function ScoreDistributionChart({
  scoreData,
}: ScoreDistributionChartProps) {
  const chartConfig = {
    frequency: {
      label: '빈도',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  const calculateScoreStats = (scores: number[]) => {
    if (!scores.length)
      return { average: 0, median: 0, bins: [], binLabels: [] }

    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length

    const sortedScores = [...scores].sort((a, b) => a - b)
    const median =
      sortedScores.length % 2 === 0
        ? (sortedScores[sortedScores.length / 2 - 1] +
            sortedScores[sortedScores.length / 2]) /
          2
        : sortedScores[Math.floor(sortedScores.length / 2)]

    // 5점 단위로 명확하게 표시하기 위해 수정
    const min = 0
    const max = 100
    const binSize = 5
    const binCount = (max - min) / binSize + 1

    const bins = Array(binCount).fill(0)
    const binLabels = Array(binCount)
      .fill(0)
      .map((_, i) => `${min + i * binSize}`)

    scores.forEach((score) => {
      if (score === 100) {
        bins[binCount - 1]++
      } else {
        const binIndex = Math.floor(score / binSize)
        if (binIndex >= 0 && binIndex < binCount) {
          bins[binIndex]++
        }
      }
    })

    return { average, median, bins, binLabels, min, max }
  }

  const scoreStats = calculateScoreStats(scoreData)

  const chartData = scoreStats.binLabels.map((label, index) => ({
    score: label,
    frequency: scoreStats.bins[index],
  }))

  return (
    <div className="mb-6">
      <div className="text-md text-gray-700 dark:text-gray-300 mb-2">
        <p>평균 점수: {scoreStats.average.toFixed(2)}점</p>
        <p>중앙값 점수: {scoreStats.median.toFixed(2)}점</p>
      </div>

      <ChartContainer config={chartConfig} className="h-64 w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="score"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            // 5점 단위로 모든 레이블 표시
            ticks={Array.from({ length: 21 }, (_, i) => i * 5)}
          />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip
            content={(props) => {
              if (!props.active || !props.payload?.length) return null

              const modifiedPayload = props.payload.map((item) => ({
                ...item,
                value:
                  typeof item.value === 'number'
                    ? `${item.value}명`
                    : item.value,
              }))

              return (
                <ChartTooltipContent
                  active={props.active}
                  payload={modifiedPayload}
                  label={props.label}
                  labelFormatter={(label) => `점수: ${label}점`}
                />
              )
            }}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="frequency" fill="var(--color-frequency)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
