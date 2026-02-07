'use client'

import { useYieldData } from '@/hooks/use-yield-data'
import { YieldCard } from '@/components/yield/yield-card'
import { YieldTable } from '@/components/yield/yield-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export default function YieldPage() {
  const { yields, bestYield } = useYieldData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Yield Opportunities</h1>
        <p className="text-sm text-muted-foreground">
          Compare yield sources across the Flare ecosystem.
        </p>
      </div>

      {bestYield && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Top Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {bestYield.protocol} — {bestYield.apy}% APY on {bestYield.asset}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{bestYield.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {yields.map((y) => (
          <YieldCard key={`${y.protocol}-${y.asset}`} opportunity={y} />
        ))}
      </div>

      <YieldTable yields={yields} />
    </div>
  )
}
