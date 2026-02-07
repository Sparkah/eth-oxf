'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowDown } from 'lucide-react'

interface StakeFormProps {
  fxrpBalance: number
  stXrpBalance: number
  exchangeRate: number
  currentAllowance?: bigint
  onStake?: (amount: bigint) => void
  onUnstake?: (shares: bigint) => void
  onApprove?: (amount: bigint) => void
  isApproving?: boolean
  isStaking?: boolean
  isUnstaking?: boolean
  assetSymbol?: string
  shareSymbol?: string
  decimals?: number
}

export function StakeForm({
  fxrpBalance,
  stXrpBalance,
  exchangeRate,
  currentAllowance,
  onStake,
  onUnstake,
  onApprove,
  isApproving,
  isStaking,
  isUnstaking,
  assetSymbol = 'FXRP',
  shareSymbol = 'stFXRP',
  decimals = 6,
}: StakeFormProps) {
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const { isConnected } = useAccount()

  const stakeNum = parseFloat(stakeAmount) || 0
  const unstakeNum = parseFloat(unstakeAmount) || 0
  const receiveShares = stakeNum / exchangeRate
  const receiveAsset = unstakeNum * exchangeRate

  const stakeRaw = BigInt(Math.floor(stakeNum * 10 ** decimals))
  const needsApproval = currentAllowance === undefined || stakeRaw > currentAllowance
  const insufficientBalance = stakeNum > fxrpBalance
  const insufficientShares = unstakeNum > stXrpBalance

  const handleApprove = () => {
    if (stakeNum <= 0 || insufficientBalance) return
    onApprove?.(stakeRaw)
  }

  const handleStake = () => {
    if (stakeNum <= 0 || insufficientBalance) return
    onStake?.(stakeRaw)
  }

  const handleUnstake = () => {
    if (unstakeNum <= 0 || insufficientShares) return
    const shares = BigInt(Math.floor(unstakeNum * 10 ** decimals))
    onUnstake?.(shares)
  }

  const assetIcon = assetSymbol.slice(0, 2).toUpperCase()
  const shareIcon = shareSymbol.slice(0, 2).toLowerCase()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{assetSymbol} Staking</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stake">
          <TabsList className="w-full">
            <TabsTrigger value="stake" className="flex-1">Stake</TabsTrigger>
            <TabsTrigger value="unstake" className="flex-1">Unstake</TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">You stake</Label>
                <button
                  className="text-xs text-primary"
                  onClick={() => setStakeAmount(fxrpBalance.toString())}
                >
                  Max: {fxrpBalance.toFixed(2)} {assetSymbol}
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {assetIcon}
                </div>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="border-0 bg-transparent text-lg font-mono p-0 h-auto focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground shrink-0">{assetSymbol}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="rounded-full border border-border p-2">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">You receive</Label>
              <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-muted/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {shareIcon}
                </div>
                <span className="text-lg font-mono">
                  {receiveShares > 0 ? receiveShares.toFixed(4) : '0.0'}
                </span>
                <span className="text-sm text-muted-foreground shrink-0 ml-auto">{shareSymbol}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Exchange rate: 1 {shareSymbol} = {exchangeRate.toFixed(4)} {assetSymbol}
            </div>

            {needsApproval ? (
              <Button
                className="w-full"
                size="lg"
                disabled={!isConnected || stakeNum <= 0 || insufficientBalance || isApproving}
                onClick={handleApprove}
              >
                {!isConnected
                  ? 'Connect Wallet'
                  : isApproving
                    ? 'Approving...'
                    : stakeNum <= 0
                      ? 'Enter Amount'
                      : insufficientBalance
                        ? `Insufficient ${assetSymbol} Balance`
                        : `Approve ${stakeNum} ${assetSymbol}`}
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                disabled={!isConnected || stakeNum <= 0 || insufficientBalance || isStaking}
                onClick={handleStake}
              >
                {!isConnected
                  ? 'Connect Wallet'
                  : isStaking
                    ? 'Staking...'
                    : stakeNum <= 0
                      ? 'Enter Amount'
                      : insufficientBalance
                        ? `Insufficient ${assetSymbol} Balance`
                        : `Stake ${stakeNum} ${assetSymbol}`}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="unstake" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">You unstake</Label>
                <button
                  className="text-xs text-primary"
                  onClick={() => setUnstakeAmount(stXrpBalance.toString())}
                >
                  Max: {stXrpBalance.toFixed(2)} {shareSymbol}
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {shareIcon}
                </div>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  className="border-0 bg-transparent text-lg font-mono p-0 h-auto focus-visible:ring-0"
                />
                <span className="text-sm text-muted-foreground shrink-0">{shareSymbol}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="rounded-full border border-border p-2">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">You receive</Label>
              <div className="flex items-center gap-2 rounded-lg border border-border p-3 bg-muted/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {assetIcon}
                </div>
                <span className="text-lg font-mono">
                  {receiveAsset > 0 ? receiveAsset.toFixed(4) : '0.0'}
                </span>
                <span className="text-sm text-muted-foreground shrink-0 ml-auto">{assetSymbol}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!isConnected || unstakeNum <= 0 || insufficientShares || isUnstaking}
              onClick={handleUnstake}
            >
              {!isConnected
                ? 'Connect Wallet'
                : isUnstaking
                  ? 'Unstaking...'
                  : unstakeNum <= 0
                    ? 'Enter Amount'
                    : insufficientShares
                      ? `Insufficient ${shareSymbol} Balance`
                      : 'Unstake'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
