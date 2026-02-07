'use client'

import { StakeForm } from '@/components/stake/stake-form'
import { StakeStats } from '@/components/stake/stake-stats'
import { useStaking } from '@/hooks/use-firelight'
import { useFtsoPrices } from '@/hooks/use-ftso-prices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { shortenAddress } from '@/lib/utils'

export default function StakePage() {
  const { prices } = useFtsoPrices()
  const {
    vaultAddress,
    enabled,
    stFxrpBalance,
    fxrpBalance,
    totalAssets,
    currentAllowance,
    exchangeRate,
    approve,
    isApproving,
    deposit,
    isDepositing,
    isDepositConfirming,
    redeem,
    isRedeeming,
  } = useStaking()

  const decimals = 6 // FTestXRP has 6 decimals
  const stFxrpNum = stFxrpBalance ? Number(stFxrpBalance) / 10 ** decimals : 0
  const fxrpNum = fxrpBalance ? Number(fxrpBalance) / 10 ** decimals : 0
  const totalStakedNum = totalAssets ? Number(totalAssets) / 10 ** decimals : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stake FXRP</h1>
        <p className="text-sm text-muted-foreground">
          Deposit FTestXRP into the StFXRP vault to receive stFXRP receipt tokens.
          {enabled && (
            <span className="ml-1 font-mono text-xs">
              Vault: {shortenAddress(vaultAddress)}
            </span>
          )}
        </p>
      </div>

      <StakeStats
        stXrpBalance={stFxrpNum}
        exchangeRate={exchangeRate}
        apy={8.5}
        totalStaked={totalStakedNum}
        xrpPrice={prices['FTestXRP'] ?? prices['XRP'] ?? 0.55}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StakeForm
          fxrpBalance={fxrpNum}
          stXrpBalance={stFxrpNum}
          exchangeRate={exchangeRate}
          currentAllowance={currentAllowance}
          onStake={deposit}
          onUnstake={redeem}
          onApprove={approve}
          isApproving={isApproving}
          isStaking={isDepositing || isDepositConfirming}
          isUnstaking={isRedeeming}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">About StFXRP Vault</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              The StFXRP vault is an ERC-4626 tokenized vault deployed on Flare.
              When you deposit FTestXRP (FXRP), you receive stFXRP — a receipt token
              representing your share of the vault.
            </p>
            <p>
              As yield accrues (from FTSO delegation rewards, FlareDrop distributions,
              or direct reward distribution), the exchange rate between stFXRP and FXRP
              increases, meaning your stFXRP becomes redeemable for more FXRP over time.
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline">ERC-4626</Badge>
              <Badge variant="outline">FAssets</Badge>
              <Badge variant="outline">No lock-up</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
