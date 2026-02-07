'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompact } from '@/lib/utils'
import type { YieldOpportunity } from '@/hooks/use-yield-data'

const riskColor = {
  Low: 'bg-green-500/10 text-green-500 border-green-500/20',
  Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  High: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export function YieldTable({ yields }: { yields: YieldOpportunity[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">All Yield Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocol</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">APY</TableHead>
              <TableHead className="text-right">TVL</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Lock</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {yields.map((y) => (
              <TableRow key={`${y.protocol}-${y.asset}`}>
                <TableCell className="font-medium">{y.protocol}</TableCell>
                <TableCell>{y.asset}</TableCell>
                <TableCell className="text-right font-bold text-green-500">{y.apy}%</TableCell>
                <TableCell className="text-right">{y.tvl > 0 ? `$${formatCompact(y.tvl)}` : '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={riskColor[y.risk]}>
                    {y.risk}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{y.lockPeriod}</TableCell>
                <TableCell>
                  {y.curator ? (
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                      {y.curator}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Native</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
