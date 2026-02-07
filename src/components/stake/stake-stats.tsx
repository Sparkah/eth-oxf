'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUsd, formatToken, formatCompact } from '@/lib/utils'

interface StakeStatsProps {
  shareBalance: number
  exchangeRate: number
  apy: number
  totalStaked: number
  assetPrice: number
  assetSymbol: string
  shareSymbol: string
}

export function StakeStats({
  shareBalance,
  exchangeRate,
  apy,
  totalStaked,
  assetPrice,
  assetSymbol,
  shareSymbol,
}: StakeStatsProps) {
  const assetValue = shareBalance * exchangeRate
  const usdValue = assetValue * assetPrice

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground font-normal">Your {shareSymbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{formatToken(shareBalance, 2)}</p>
          <p className="text-xs text-muted-foreground">{formatUsd(usdValue)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground font-normal">Current APY</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-green-500">{apy}%</p>
          <p className="text-xs text-muted-foreground">Auto-compounding</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground font-normal">Exchange Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{exchangeRate.toFixed(4)}</p>
          <p className="text-xs text-muted-foreground">{assetSymbol} per {shareSymbol}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground font-normal">Total Staked</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">${formatCompact(totalStaked * assetPrice)}</p>
          <p className="text-xs text-muted-foreground">{formatCompact(totalStaked)} {assetSymbol}</p>
        </CardContent>
      </Card>
    </div>
  )
}
