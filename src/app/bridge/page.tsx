'use client'

import { useState } from 'react'
import { BridgeForm } from '@/components/bridge/bridge-form'
import { BridgeStatus } from '@/components/bridge/bridge-status'
import { useFtsoPrices } from '@/hooks/use-ftso-prices'
import { useFAssets } from '@/hooks/use-fassets'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BridgePage() {
  const { prices } = useFtsoPrices()
  const [lots, setLots] = useState(1)

  const {
    enabled,
    agents,
    isLoadingAgents,
    lotSizeXRP,
    reservationFeeFLR,
    reserveCollateral,
    isReserving,
    isConfirming,
    isConfirmed,
    paymentInfo,
    txHash,
  } = useFAssets(BigInt(lots))

  // Best agent = first (sorted by lowest fee)
  const bestAgent = agents[0] ?? null

  // Determine minting step from hook state
  const mintingStep = paymentInfo
    ? 'awaiting_payment' as const
    : isConfirming
      ? 'reserving' as const
      : 'idle' as const

  const handleReserve = () => {
    if (!bestAgent) return
    reserveCollateral(bestAgent.agentVault, bestAgent.feeBIPS)
  }

  // Total XRP to send (value + agent fee, in drops → XRP)
  const xrpToSend = paymentInfo
    ? Number(paymentInfo.valueUBA + paymentInfo.feeUBA) / 1e6
    : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bridge XRP to FTestXRP</h1>
        <p className="text-sm text-muted-foreground">
          Use FAssets to bring your XRP onto the Flare network as FTestXRP.
          {enabled && agents.length > 0 && (
            <span className="ml-1">
              {agents.length} agent{agents.length !== 1 ? 's' : ''} available.
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BridgeForm
          onReserve={handleReserve}
          isReserving={isReserving || isConfirming}
          prices={prices}
          lots={lots}
          onLotsChange={setLots}
          lotSizeXRP={lotSizeXRP}
          reservationFeeFLR={reservationFeeFLR}
          maxLots={bestAgent ? Number(bestAgent.freeCollateralLots) : 0}
          agentFeeBIPS={bestAgent ? Number(bestAgent.feeBIPS) : undefined}
          isLoadingAgents={isLoadingAgents}
          noAgents={enabled && !isLoadingAgents && agents.length === 0}
        />

        <div className="space-y-6">
          <BridgeStatus
            step={mintingStep}
            agentXrplAddress={paymentInfo?.paymentAddress}
            paymentReference={paymentInfo?.paymentReference}
            xrpAmount={xrpToSend}
            txHash={txHash}
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">About FAssets Bridge</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                FAssets is Flare&apos;s native bridging protocol that brings non-smart-contract
                tokens like XRP onto Flare as fully collateralized ERC-20 tokens (FTestXRP).
              </p>
              <p>
                Each FTestXRP is backed by over-collateralization from agents on the Flare network,
                verified by the Flare Data Connector (FDC).
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline">Trustless</Badge>
                <Badge variant="outline">Over-collateralized</Badge>
                <Badge variant="outline">FDC verified</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
