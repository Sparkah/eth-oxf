'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TokenBalance } from '@/hooks/use-token-balances'
import { formatUsd, formatCompact } from '@/lib/utils'

interface PortfolioChartProps {
  balances: TokenBalance[]
  prices: Record<string, number>
}

const COLORS = ['#e11d48', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

export function PortfolioChart({ balances, prices }: PortfolioChartProps) {
  const items = balances
    .map((b) => ({
      symbol: b.symbol,
      value: b.balance * (prices[b.symbol] ?? 0),
    }))
    .filter((i) => i.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = items.reduce((sum, i) => sum + i.value, 0)

  if (total === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            No portfolio data
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Simple donut via SVG */}
          <svg viewBox="0 0 100 100" className="w-36 h-36">
            {(() => {
              let cumulative = 0
              return items.map((item, i) => {
                const pct = (item.value / total) * 100
                const start = cumulative
                cumulative += pct
                const startAngle = (start / 100) * 2 * Math.PI - Math.PI / 2
                const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2
                const largeArc = pct > 50 ? 1 : 0
                const x1 = 50 + 40 * Math.cos(startAngle)
                const y1 = 50 + 40 * Math.sin(startAngle)
                const x2 = 50 + 40 * Math.cos(endAngle)
                const y2 = 50 + 40 * Math.sin(endAngle)
                return (
                  <path
                    key={item.symbol}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={COLORS[i % COLORS.length]}
                    stroke="var(--background)"
                    strokeWidth="1"
                  />
                )
              })
            })()}
            <circle cx="50" cy="50" r="24" fill="var(--background)" />
            <text x="50" y="48" textAnchor="middle" className="text-[7px] font-bold fill-foreground">
              {formatCompact(total)}
            </text>
            <text x="50" y="56" textAnchor="middle" className="text-[5px] fill-muted-foreground">
              USD
            </text>
          </svg>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            {items.map((item, i) => (
              <div key={item.symbol} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-muted-foreground">{item.symbol}</span>
                <span className="ml-auto font-medium">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
