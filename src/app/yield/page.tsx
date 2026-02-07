'use client'

import { useRef } from 'react'
import { useYieldData } from '@/hooks/use-yield-data'
import { YieldCard } from '@/components/yield/yield-card'
import { YieldTable } from '@/components/yield/yield-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function YieldPage() {
  const { yields, isLoading } = useYieldData()
  const nativeRef = useRef<HTMLDivElement>(null)

  // Our best native vault
  const bestNative = yields.find((y) => y.vaultId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Yield Opportunities</h1>
        <p className="text-sm text-muted-foreground">
          Live curated yield data from Flare DeFi protocols via DeFiLlama.
        </p>
      </div>

      {bestNative && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Top Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold">
                FlareVault — {bestNative.apy}% APY on {bestNative.asset}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{bestNative.description}</p>
            </div>
            <Link href={`/stake?vault=${bestNative.vaultId}`}>
              <Button size="sm">Stake Now</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div ref={nativeRef} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {yields.map((y) => (
          <YieldCard key={`${y.protocol}-${y.asset}`} opportunity={y} />
        ))}
      </div>

      <YieldTable yields={yields} />
    </div>
  )
}
