'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TokenBalance } from '@/hooks/use-token-balances'
import { formatToken, formatUsd } from '@/lib/utils'

interface TokenBalancesProps {
  balances: TokenBalance[]
  prices: Record<string, number>
  isLoading?: boolean
}

export function TokenBalances({ balances, prices, isLoading }: TokenBalancesProps) {
  const rows = balances
    .map((b) => ({
      ...b,
      usdValue: b.balance * (prices[b.symbol] ?? 0),
    }))
    .sort((a, b) => b.usdValue - a.usdValue)

  const totalUsd = rows.reduce((sum, r) => sum + r.usdValue, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Token Balances</CardTitle>
          <span className="text-lg font-bold">{formatUsd(totalUsd)}</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            Loading balances...
          </div>
        ) : rows.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            No tokens found. Add a wallet address to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.symbol}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                        {row.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{row.symbol}</div>
                        <div className="text-xs text-muted-foreground">{row.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatToken(row.balance)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatUsd(prices[row.symbol] ?? 0)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">
                    {formatUsd(row.usdValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
