'use client'

import { StakeForm } from '@/components/stake/stake-form'
import { StakeStats } from '@/components/stake/stake-stats'
import { useFirelight } from '@/hooks/use-firelight'
import { useFtsoPrices } from '@/hooks/use-ftso-prices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function StakePage() {
  const { prices } = useFtsoPrices()
  const {
    stXrpBalance,
    exchangeRate,
    approve,
    isApproving,
    deposit,
    isDepositing,
    isDepositConfirming,
    withdraw,
    isWithdrawing,
  } = useFirelight()

  const stXrpNum = stXrpBalance ? Number(stXrpBalance) / 1e18 : 125.5 // demo fallback

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stake FXRP</h1>
        <p className="text-sm text-muted-foreground">
          Stake your FXRP via Firelight to earn auto-compounding yield as stXRP.
        </p>
      </div>

      <StakeStats
        stXrpBalance={stXrpNum}
        exchangeRate={exchangeRate}
        apy={8.5}
        totalStaked={4_350_000}
        xrpPrice={prices['XRP'] ?? 0.55}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StakeForm
          fxrpBalance={1250.0} // demo fallback
          stXrpBalance={stXrpNum}
          exchangeRate={exchangeRate}
          onStake={deposit}
          onUnstake={withdraw}
          onApprove={approve}
          isApproving={isApproving}
          isStaking={isDepositing || isDepositConfirming}
          isUnstaking={isWithdrawing}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">About Firelight Staking</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              Firelight is a liquid staking protocol on Flare. When you deposit FXRP, you receive
              stXRP — a yield-bearing token that increases in value over time as delegation rewards
              accrue.
            </p>
            <p>
              stXRP can be used across DeFi while your underlying FXRP earns FTSO delegation
              rewards and FlareDrop distributions.
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline">Liquid staking</Badge>
              <Badge variant="outline">Auto-compound</Badge>
              <Badge variant="outline">No lock-up</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
