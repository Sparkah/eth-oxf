'use client'

import { useState } from 'react'
import { formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'
import { usePredictionMarket, type MarketData } from '@/hooks/use-prediction-market'
import { useFtsoPrices } from '@/hooks/use-ftso-prices'
import { FEED_IDS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Target, TrendingUp, Clock, Zap, Brain } from 'lucide-react'

const FEED_OPTIONS = [
  { label: 'FLR/USD', id: FEED_IDS['FLR/USD'], priceKey: 'FLR' },
  { label: 'XRP/USD', id: FEED_IDS['XRP/USD'], priceKey: 'XRP' },
  { label: 'BTC/USD', id: FEED_IDS['BTC/USD'], priceKey: 'BTC' },
  { label: 'ETH/USD', id: FEED_IDS['ETH/USD'], priceKey: 'ETH' },
] as const

// --- AI Probability Estimator ---
function estimateProbability(
  currentPrice: number,
  targetPrice: number,
  deadlineTs: number,
  nowTs: number
): number {
  if (nowTs >= deadlineTs) return currentPrice >= targetPrice ? 99 : 1
  const priceDist = (targetPrice - currentPrice) / (currentPrice || 1)
  const timeLeftHours = Math.max((deadlineTs - nowTs) / 3600, 0.01)
  // Volatility factor: more time = more uncertain = closer to 50%
  const vol = Math.min(timeLeftHours * 0.02, 0.5)
  // Sigmoid on normalized distance, scaled by volatility
  const z = -priceDist / (vol || 0.01)
  const prob = 1 / (1 + Math.exp(-z))
  return Math.round(Math.max(1, Math.min(99, prob * 100)))
}

function feedIdToSymbol(feedId: string): string {
  for (const [key, value] of Object.entries(FEED_IDS)) {
    if (value.toLowerCase() === feedId.toLowerCase()) return key.split('/')[0]
  }
  return '???'
}

function formatTimeLeft(deadlineTs: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = deadlineTs - now
  if (diff <= 0) return 'Expired'
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
  return `${Math.floor(diff / 86400)}d`
}

// --- Create Market Form ---
function CreateMarketForm({ onSubmit, isCreating }: {
  onSubmit: (feedId: string, targetPrice: bigint, deadline: bigint, question: string) => void
  isCreating: boolean
}) {
  const [feed, setFeed] = useState(0)
  const [targetPrice, setTargetPrice] = useState('')
  const [minutes, setMinutes] = useState('10')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetPrice || !minutes) return
    const feedOpt = FEED_OPTIONS[feed]
    const priceWei = parseEther(targetPrice)
    const deadlineTs = BigInt(Math.floor(Date.now() / 1000) + Number(minutes) * 60)
    const question = `Will ${feedOpt.label} be >= $${targetPrice} in ${minutes} minutes?`
    onSubmit(feedOpt.id, priceWei, deadlineTs, question)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4" />
          Create Market
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs">Price Feed</Label>
            <div className="flex gap-1.5 mt-1">
              {FEED_OPTIONS.map((opt, i) => (
                <Button
                  key={opt.label}
                  type="button"
                  size="sm"
                  variant={feed === i ? 'default' : 'outline'}
                  onClick={() => setFeed(i)}
                  className="text-xs"
                >
                  {opt.label.split('/')[0]}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="target" className="text-xs">Target Price ($)</Label>
              <Input
                id="target"
                type="number"
                step="any"
                placeholder="0.025"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="mins" className="text-xs">Duration (minutes)</Label>
              <Input
                id="mins"
                type="number"
                min="1"
                placeholder="10"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isCreating || !targetPrice}>
            {isCreating ? 'Creating...' : 'Create Market'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// --- Market Card ---
function MarketCard({
  market,
  userBet,
  prices,
  onBet,
  onResolve,
  onClaim,
  isBetting,
  isResolving,
  isClaiming,
}: {
  market: MarketData
  userBet: { yesBet: bigint; noBet: bigint; claimed: boolean; payout: bigint }
  prices: Record<string, number>
  onBet: (marketId: number, isYes: boolean, amount: string) => void
  onResolve: (marketId: number) => void
  onClaim: (marketId: number) => void
  isBetting: boolean
  isResolving: boolean
  isClaiming: boolean
}) {
  const [betAmount, setBetAmount] = useState('')
  const now = Math.floor(Date.now() / 1000)
  const deadlineTs = Number(market.deadline)
  const isExpired = now >= deadlineTs
  const symbol = feedIdToSymbol(market.feedId)
  const currentPrice = prices[symbol] ?? 0
  const targetPriceNum = Number(formatEther(market.targetPrice))

  const totalPool = market.yesPool + market.noPool
  const yesPercent = totalPool > 0n ? Number((market.yesPool * 100n) / totalPool) : 50
  const noPercent = 100 - yesPercent

  // AI estimate
  const aiProb = estimateProbability(currentPrice, targetPriceNum, deadlineTs, now)

  const hasUserBet = userBet.yesBet > 0n || userBet.noBet > 0n
  const canClaim = market.resolved && userBet.payout > 0n && !userBet.claimed

  return (
    <Card className={market.resolved ? 'border-muted' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight">{market.question}</CardTitle>
          <div className="flex gap-1 shrink-0">
            {market.resolved ? (
              <Badge variant={market.outcome ? 'default' : 'destructive'}>
                {market.outcome ? 'YES' : 'NO'}
              </Badge>
            ) : isExpired ? (
              <Badge variant="outline" className="text-yellow-600">Awaiting Resolution</Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTimeLeft(deadlineTs)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pool bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-green-500 font-medium">YES {yesPercent}%</span>
            <span className="text-xs text-muted-foreground">
              {Number(formatEther(totalPool)).toFixed(2)} C2FLR
            </span>
            <span className="text-red-500 font-medium">NO {noPercent}%</span>
          </div>
          <Progress value={yesPercent} className="h-2" />
        </div>

        {/* AI probability */}
        {!market.resolved && (
          <div className="flex items-center gap-2 text-xs bg-purple-500/10 rounded-md px-2.5 py-1.5">
            <Brain className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-purple-300">
              AI estimates <span className="font-bold">{aiProb}%</span> chance of YES
            </span>
            {currentPrice > 0 && (
              <span className="ml-auto text-muted-foreground">
                Now: ${currentPrice.toFixed(4)}
              </span>
            )}
          </div>
        )}

        {/* Resolved info */}
        {market.resolved && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
            <Zap className="h-3 w-3 inline mr-1" />
            FTSO Price: ${Number(formatEther(market.resolvedPrice)).toFixed(4)}
            {' | '}Target: ${targetPriceNum.toFixed(4)}
          </div>
        )}

        {/* User position */}
        {hasUserBet && (
          <div className="text-xs text-muted-foreground">
            Your bets:{' '}
            {userBet.yesBet > 0n && (
              <span className="text-green-500">{Number(formatEther(userBet.yesBet)).toFixed(3)} YES</span>
            )}
            {userBet.yesBet > 0n && userBet.noBet > 0n && ' / '}
            {userBet.noBet > 0n && (
              <span className="text-red-500">{Number(formatEther(userBet.noBet)).toFixed(3)} NO</span>
            )}
            {market.resolved && userBet.payout > 0n && (
              <span className="ml-2 font-medium text-foreground">
                Payout: {Number(formatEther(userBet.payout)).toFixed(3)} C2FLR
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {!market.resolved && !isExpired && (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="Amount (C2FLR)"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="text-xs h-8"
              />
            </div>
            <Button
              size="sm"
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-xs"
              disabled={isBetting || !betAmount}
              onClick={() => { onBet(market.id, true, betAmount); setBetAmount('') }}
            >
              YES
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="text-xs"
              disabled={isBetting || !betAmount}
              onClick={() => { onBet(market.id, false, betAmount); setBetAmount('') }}
            >
              NO
            </Button>
          </div>
        )}

        {!market.resolved && isExpired && (
          <Button
            className="w-full"
            size="sm"
            onClick={() => onResolve(market.id)}
            disabled={isResolving}
          >
            <Zap className="h-3.5 w-3.5 mr-1" />
            {isResolving ? 'Resolving...' : 'Resolve via FTSO Oracle'}
          </Button>
        )}

        {canClaim && (
          <Button
            className="w-full"
            size="sm"
            onClick={() => onClaim(market.id)}
            disabled={isClaiming}
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1" />
            {isClaiming ? 'Claiming...' : `Claim ${Number(formatEther(userBet.payout)).toFixed(3)} C2FLR`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// --- Page ---
export default function MarketsPage() {
  const { address } = useAccount()
  const { prices } = useFtsoPrices()
  const {
    enabled,
    markets,
    userBets,
    createMarket,
    isCreating,
    placeBet,
    isBetting,
    resolveMarket,
    isResolving,
    claimPayout,
    isClaiming,
  } = usePredictionMarket()

  const activeMarkets = markets.filter((m) => !m.resolved)
  const resolvedMarkets = markets.filter((m) => m.resolved)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prediction Markets</h1>
        <p className="text-sm text-muted-foreground">
          Create and bet on FTSO-resolved price prediction markets. Powered by Flare oracle.
        </p>
      </div>

      {!enabled && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="py-4 text-sm text-yellow-400">
            FlareBet contract not deployed on this network. Deploy and update the address in contracts config.
          </CardContent>
        </Card>
      )}

      {!address && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="py-4 text-sm text-blue-400">
            Connect your wallet to create markets and place bets.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CreateMarketForm onSubmit={createMarket} isCreating={isCreating} />

          {/* AI Info Card */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                AI Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                Each market shows an AI probability estimate based on:
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Current FTSO price vs. target price</li>
                <li>Time remaining until deadline</li>
                <li>Implied volatility scaling</li>
              </ul>
              <p>
                The estimate uses a sigmoid function on the normalized price distance,
                adjusted for time-based volatility. Not financial advice.
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-purple-400 border-purple-500/30">Deterministic</Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-500/30">No API Key</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {activeMarkets.length === 0 && resolvedMarkets.length === 0 && enabled && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No markets yet. Create the first prediction market!
              </CardContent>
            </Card>
          )}

          {activeMarkets.length > 0 && (
            <>
              <h2 className="text-lg font-semibold">Active Markets</h2>
              {activeMarkets.map((m) => (
                <MarketCard
                  key={m.id}
                  market={m}
                  userBet={userBets[m.id] ?? { yesBet: 0n, noBet: 0n, claimed: false, payout: 0n }}
                  prices={prices}
                  onBet={placeBet}
                  onResolve={resolveMarket}
                  onClaim={claimPayout}
                  isBetting={isBetting}
                  isResolving={isResolving}
                  isClaiming={isClaiming}
                />
              ))}
            </>
          )}

          {resolvedMarkets.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mt-6">Resolved Markets</h2>
              {resolvedMarkets.map((m) => (
                <MarketCard
                  key={m.id}
                  market={m}
                  userBet={userBets[m.id] ?? { yesBet: 0n, noBet: 0n, claimed: false, payout: 0n }}
                  prices={prices}
                  onBet={placeBet}
                  onResolve={resolveMarket}
                  onClaim={claimPayout}
                  isBetting={isBetting}
                  isResolving={isResolving}
                  isClaiming={isClaiming}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
