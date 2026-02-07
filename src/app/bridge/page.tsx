'use client'

import { useState } from 'react'
import { BridgeForm } from '@/components/bridge/bridge-form'
import { BridgeStatus } from '@/components/bridge/bridge-status'
import { useFtsoPrices } from '@/hooks/use-ftso-prices'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type MintingStep = 'idle' | 'reserving' | 'awaiting_payment' | 'verifying' | 'minted'

export default function BridgePage() {
  const { prices } = useFtsoPrices()
  const [mintingStep, setMintingStep] = useState<MintingStep>('idle')
  const [isReserving, setIsReserving] = useState(false)

  const handleReserve = async (amount: number) => {
    setIsReserving(true)
    setMintingStep('reserving')

    // Simulate the minting flow for demo purposes
    await new Promise((r) => setTimeout(r, 2000))
    setMintingStep('awaiting_payment')
    setIsReserving(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bridge XRP to FXRP</h1>
        <p className="text-sm text-muted-foreground">
          Use FAssets to bring your XRP onto the Flare network as FXRP.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BridgeForm
          onReserve={handleReserve}
          isReserving={isReserving}
          prices={prices}
        />

        <div className="space-y-6">
          <BridgeStatus
            step={mintingStep}
            agentXrplAddress={
              mintingStep === 'awaiting_payment'
                ? 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh'
                : undefined
            }
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">About FAssets Bridge</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>
                FAssets is Flare&apos;s native bridging protocol that brings non-smart-contract
                tokens like XRP onto Flare as fully collateralized ERC-20 tokens (FXRP).
              </p>
              <p>
                Each FXRP is backed by over-collateralization from agents on the Flare network,
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
