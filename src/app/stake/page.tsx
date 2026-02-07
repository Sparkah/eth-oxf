'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { StakeForm } from '@/components/stake/stake-form'
import { StakeStats } from '@/components/stake/stake-stats'
import { useStaking } from '@/hooks/use-firelight'
import { useFtsoPrices } from '@/hooks/use-ftso-prices'
import { VAULTS, type VaultId } from '@/config/contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { shortenAddress } from '@/lib/utils'

const VAULT_IDS = Object.keys(VAULTS) as VaultId[]

export default function StakePage() {
  return (
    <Suspense>
      <StakePageInner />
    </Suspense>
  )
}

function StakePageInner() {
  const searchParams = useSearchParams()
  const urlVault = searchParams.get('vault') as VaultId | null
  const initialVault = urlVault && VAULT_IDS.includes(urlVault) ? urlVault : 'StFXRP'
  const [activeVault, setActiveVault] = useState<VaultId>(initialVault)
  const { prices } = useFtsoPrices()
  const {
    vault,
    vaultAddress,
    enabled,
    shareBalance,
    assetBalance,
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
  } = useStaking(activeVault)

  const decimals = vault.decimals
  const shareNum = shareBalance ? Number(shareBalance) / 10 ** decimals : 0
  const assetNum = assetBalance ? Number(assetBalance) / 10 ** decimals : 0
  const totalStakedNum = totalAssets ? Number(totalAssets) / 10 ** decimals : 0

  const priceKey = vault.asset === 'FXRP' ? 'FTestXRP' : vault.asset
  const assetPrice = prices[priceKey] ?? prices[vault.asset] ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stake</h1>
        <p className="text-sm text-muted-foreground">
          Deposit tokens into ERC-4626 vaults to receive yield-bearing receipt tokens.
          {enabled && (
            <span className="ml-1 font-mono text-xs">
              Vault: {shortenAddress(vaultAddress)}
            </span>
          )}
        </p>
      </div>

      {/* Vault selector */}
      <div className="flex gap-2">
        {VAULT_IDS.map((id) => {
          const v = VAULTS[id]
          return (
            <Button
              key={id}
              variant={activeVault === id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveVault(id)}
            >
              {v.asset} → {v.symbol}
              <Badge variant="secondary" className="ml-2 text-xs">
                {v.apy}%
              </Badge>
            </Button>
          )
        })}
      </div>

      <StakeStats
        stXrpBalance={shareNum}
        exchangeRate={exchangeRate}
        apy={vault.apy}
        totalStaked={totalStakedNum}
        xrpPrice={assetPrice}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StakeForm
          fxrpBalance={assetNum}
          stXrpBalance={shareNum}
          exchangeRate={exchangeRate}
          currentAllowance={currentAllowance}
          onStake={deposit}
          onUnstake={redeem}
          onApprove={approve}
          isApproving={isApproving}
          isStaking={isDepositing || isDepositConfirming}
          isUnstaking={isRedeeming}
          assetSymbol={vault.asset === 'FXRP' ? 'FTestXRP' : vault.asset}
          shareSymbol={vault.symbol}
          decimals={decimals}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">About {vault.symbol} Vault</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>
              The {vault.symbol} vault is an ERC-4626 tokenized vault deployed on Flare.
              When you deposit {vault.asset}, you receive {vault.symbol} — a receipt token
              representing your share of the vault.
            </p>
            <p>
              As yield accrues, the exchange rate between {vault.symbol} and {vault.asset}
              increases, meaning your {vault.symbol} becomes redeemable for more {vault.asset} over time.
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline">ERC-4626</Badge>
              <Badge variant="outline">{vault.apy}% APY</Badge>
              <Badge variant="outline">No lock-up</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
