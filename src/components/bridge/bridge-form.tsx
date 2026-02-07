'use client'

import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowDown, Info, Loader2, AlertTriangle } from 'lucide-react'

interface BridgeFormProps {
  onReserve?: () => void
  isReserving?: boolean
  prices: Record<string, number>
  lots: number
  onLotsChange: (lots: number) => void
  lotSizeXRP?: number
  reservationFeeFLR?: number
  maxLots: number
  agentFeeBIPS?: number
  isLoadingAgents?: boolean
  noAgents?: boolean
}

export function BridgeForm({
  onReserve,
  isReserving,
  prices,
  lots,
  onLotsChange,
  lotSizeXRP,
  reservationFeeFLR,
  maxLots,
  agentFeeBIPS,
  isLoadingAgents,
  noAgents,
}: BridgeFormProps) {
  const { isConnected } = useAccount()
  const xrpPrice = prices['XRP'] ?? 0.55

  const totalXRP = lotSizeXRP ? lots * lotSizeXRP : 0
  const agentFeePercent = agentFeeBIPS ? agentFeeBIPS / 100 : 0
  const agentFeeXRP = totalXRP * (agentFeePercent / 100)
  const receiveXRP = totalXRP - agentFeeXRP
  const usdValue = totalXRP * xrpPrice

  const canReserve = isConnected && lots > 0 && lots <= maxLots && !isReserving && !noAgents

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Bridge XRP to FTestXRP
          <Badge variant="outline" className="text-xs">FAssets</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lots input */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Number of lots
            {lotSizeXRP && (
              <span className="ml-1">
                (1 lot = {lotSizeXRP.toLocaleString()} XRP)
              </span>
            )}
          </Label>
          <div className="flex items-center gap-2 rounded-lg border border-border p-3">
            <Input
              type="number"
              min={1}
              max={maxLots || undefined}
              step={1}
              value={lots}
              onChange={(e) => onLotsChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="border-0 bg-transparent text-lg font-mono p-0 h-auto focus-visible:ring-0"
            />
            <span className="text-sm text-muted-foreground shrink-0">lots</span>
          </div>
          {maxLots > 0 && (
            <p className="text-xs text-muted-foreground">
              Max available: {maxLots} lot{maxLots !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Send */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">You send (on XRPL testnet)</Label>
          <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-muted/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
              XR
            </div>
            <span className="text-lg font-mono">
              {totalXRP > 0 ? totalXRP.toLocaleString() : '—'}
            </span>
            <span className="text-sm text-muted-foreground shrink-0 ml-auto">XRP</span>
          </div>
          {usdValue > 0 && (
            <p className="text-xs text-muted-foreground">~${usdValue.toFixed(2)} USD</p>
          )}
        </div>

        <div className="flex justify-center">
          <div className="rounded-full border border-border p-2">
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Receive */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">You receive (on Flare)</Label>
          <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-muted/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
              FX
            </div>
            <span className="text-lg font-mono">
              {receiveXRP > 0 ? receiveXRP.toLocaleString() : '—'}
            </span>
            <span className="text-sm text-muted-foreground shrink-0 ml-auto">FTestXRP</span>
          </div>
        </div>

        {/* Fee breakdown */}
        {totalXRP > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-xs">
            {agentFeeBIPS !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agent fee ({agentFeePercent.toFixed(2)}%)</span>
                <span>{agentFeeXRP.toFixed(4)} XRP</span>
              </div>
            )}
            {reservationFeeFLR !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collateral reservation fee</span>
                <span>{reservationFeeFLR.toFixed(6)} C2FLR</span>
              </div>
            )}
          </div>
        )}

        {/* Loading / no agents */}
        {isLoadingAgents && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading available agents...
          </div>
        )}

        {noAgents && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-yellow-500">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>No agents with available collateral found on this network.</span>
          </div>
        )}

        {/* How it works */}
        <div className="flex gap-2 rounded-lg border border-border p-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">How it works</p>
            <p className="mt-1">
              1. Reserve collateral on Flare (pays small C2FLR fee).{' '}
              2. Send XRP to the agent&apos;s XRPL address shown after reservation.{' '}
              3. FDC verifies payment and FTestXRP mints to your Flare wallet.
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!canReserve}
          onClick={() => onReserve?.()}
        >
          {!isConnected
            ? 'Connect Wallet'
            : isReserving
              ? 'Reserving...'
              : noAgents
                ? 'No Agents Available'
                : lots > maxLots
                  ? 'Exceeds Available Lots'
                  : 'Reserve Collateral'}
        </Button>
      </CardContent>
    </Card>
  )
}
