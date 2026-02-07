'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, Clock, Loader2 } from 'lucide-react'

type MintingStep = 'idle' | 'reserving' | 'awaiting_payment' | 'verifying' | 'minted'

interface BridgeStatusProps {
  step: MintingStep
  agentXrplAddress?: string
  txHash?: string
}

const steps = [
  { key: 'reserving', label: 'Collateral Reserved' },
  { key: 'awaiting_payment', label: 'Awaiting XRP Payment' },
  { key: 'verifying', label: 'FDC Verification' },
  { key: 'minted', label: 'FXRP Minted' },
] as const

const stepOrder: Record<MintingStep, number> = {
  idle: -1,
  reserving: 0,
  awaiting_payment: 1,
  verifying: 2,
  minted: 3,
}

export function BridgeStatus({ step, agentXrplAddress, txHash }: BridgeStatusProps) {
  if (step === 'idle') return null

  const currentIdx = stepOrder[step]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Minting Progress</CardTitle>
          <Badge variant="outline">
            {step === 'minted' ? 'Complete' : 'In Progress'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {steps.map((s, i) => {
            const isDone = i < currentIdx || step === 'minted'
            const isCurrent = i === currentIdx && step !== 'minted'
            return (
              <div key={s.key} className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                )}
                <span
                  className={
                    isDone
                      ? 'text-sm text-foreground'
                      : isCurrent
                        ? 'text-sm font-medium text-foreground'
                        : 'text-sm text-muted-foreground'
                  }
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>

        {step === 'awaiting_payment' && agentXrplAddress && (
          <div className="rounded-lg bg-muted p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Send XRP to this XRPL address:</p>
            <p className="text-sm font-mono break-all">{agentXrplAddress}</p>
          </div>
        )}

        {txHash && (
          <p className="text-xs text-muted-foreground">
            Tx: <span className="font-mono">{txHash}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
