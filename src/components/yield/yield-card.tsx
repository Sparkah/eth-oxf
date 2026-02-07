'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCompact } from '@/lib/utils'
import type { YieldOpportunity } from '@/hooks/use-yield-data'
import Link from 'next/link'

const riskColor = {
  Low: 'bg-green-500/10 text-green-500 border-green-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  High: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export function YieldCard({ opportunity }: { opportunity: YieldOpportunity }) {
  const { protocol, asset, apy, tvl, risk, description, lockPeriod, vaultId, curator, url } = opportunity

  const stakeHref = vaultId ? `/stake?vault=${vaultId}` : '/stake'

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{protocol}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{asset}</p>
          </div>
          <div className="flex gap-1">
            {curator && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                Curated
              </Badge>
            )}
            <Badge variant="outline" className={riskColor[risk]}>
              {risk}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

        <div className="grid grid-cols-3 gap-2 mt-auto">
          <div>
            <p className="text-xs text-muted-foreground">APY</p>
            <p className="text-lg font-bold text-green-500">{apy}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">TVL</p>
            <p className="text-sm font-medium">{tvl > 0 ? `$${formatCompact(tvl)}` : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lock</p>
            <p className="text-sm font-medium">{lockPeriod}</p>
          </div>
        </div>

        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button className="w-full mt-2" size="sm" variant="outline">
              View on {protocol}
            </Button>
          </a>
        ) : (
          <Link href={stakeHref}>
            <Button className="w-full mt-2" size="sm">
              Stake Now
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
