'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatUsd, formatToken, formatCompact } from '@/lib/utils'

interface StakeStatsProps {
  stXrpBalance: number
  exchangeRate: number
  apy: number
  totalStaked: number
  xrpPrice: number
}

export function StakeStats({ stXrpBalance, exchangeRate, apy, totalStaked, xrpPrice }: StakeStatsProps) {
  const fxrpValue = stXrpBalance * exchangeRate
  const usdValue = fxrpValue * xrpPrice

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground font-normal">Your stXRP</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{formatToken(stXrpBalance, 2)}</p>
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
          <p className="text-xs text-muted-foreground">FXRP per stXRP</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs text-muted-foreground font-normal">Total Staked</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">${formatCompact(totalStaked * xrpPrice)}</p>
          <p className="text-xs text-muted-foreground">{formatCompact(totalStaked)} FXRP</p>
        </CardContent>
      </Card>
    </div>
  )
}
