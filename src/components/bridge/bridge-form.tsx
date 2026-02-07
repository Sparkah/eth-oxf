'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowDown, Info } from 'lucide-react'

interface BridgeFormProps {
  onReserve?: (amount: number) => void
  isReserving?: boolean
  prices: Record<string, number>
}

export function BridgeForm({ onReserve, isReserving, prices }: BridgeFormProps) {
  const [amount, setAmount] = useState('')
  const { isConnected } = useAccount()
  const xrpPrice = prices['XRP'] ?? 0.55

  const numAmount = parseFloat(amount) || 0
  const usdValue = numAmount * xrpPrice
  // ~0.1% minting fee
  const mintingFee = numAmount * 0.001
  const receiveAmount = numAmount - mintingFee

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Bridge XRP to FXRP
          <Badge variant="outline" className="text-xs">FAssets</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Send */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">You send (on XRPL)</Label>
          <div className="flex items-center gap-2 rounded-lg border border-border p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
              XR
            </div>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-0 bg-transparent text-lg font-mono p-0 h-auto focus-visible:ring-0"
            />
            <span className="text-sm text-muted-foreground shrink-0">XRP</span>
          </div>
          {numAmount > 0 && (
            <p className="text-xs text-muted-foreground">
              ~${usdValue.toFixed(2)} USD
            </p>
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
              {receiveAmount > 0 ? receiveAmount.toFixed(4) : '0.0'}
            </span>
            <span className="text-sm text-muted-foreground shrink-0 ml-auto">FXRP</span>
          </div>
        </div>

        {/* Fee info */}
        {numAmount > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minting fee (~0.1%)</span>
              <span>{mintingFee.toFixed(4)} XRP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Collateral reservation fee</span>
              <span>~0.005 FLR</span>
            </div>
          </div>
        )}

        {/* Info callout */}
        <div className="flex gap-2 rounded-lg border border-border p-3 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">How it works</p>
            <p className="mt-1">
              1. Reserve collateral on Flare (pays small FLR fee).
              2. Send XRP to the agent&apos;s XRPL address shown after reservation.
              3. FDC verifies payment and FXRP mints to your Flare wallet.
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!isConnected || numAmount <= 0 || isReserving}
          onClick={() => onReserve?.(numAmount)}
        >
          {!isConnected
            ? 'Connect Wallet'
            : isReserving
              ? 'Reserving...'
              : numAmount <= 0
                ? 'Enter Amount'
                : 'Reserve Collateral'}
        </Button>
      </CardContent>
    </Card>
  )
}
