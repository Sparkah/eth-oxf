'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, Loader2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type MintingStep = 'idle' | 'reserving' | 'awaiting_payment' | 'verifying' | 'minted'

interface BridgeStatusProps {
  step: MintingStep
  agentXrplAddress?: string
  paymentReference?: string
  xrpAmount?: number
  txHash?: string
}

const steps = [
  { key: 'reserving', label: 'Collateral Reserved' },
  { key: 'awaiting_payment', label: 'Awaiting XRP Payment' },
  { key: 'verifying', label: 'FDC Verification' },
  { key: 'minted', label: 'FTestXRP Minted' },
] as const

const stepOrder: Record<MintingStep, number> = {
  idle: -1,
  reserving: 0,
  awaiting_payment: 1,
  verifying: 2,
  minted: 3,
}

function CopyButton({ text, label }: { text: string; label: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={() => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied`)
      }}
    >
      <Copy className="h-3 w-3" />
    </Button>
  )
}

export function BridgeStatus({ step, agentXrplAddress, paymentReference, xrpAmount, txHash }: BridgeStatusProps) {
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

        {/* Payment details after reservation */}
        {step === 'awaiting_payment' && agentXrplAddress && (
          <div className="rounded-lg bg-muted p-3 space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Send XRP to this XRPL address:</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-mono break-all">{agentXrplAddress}</p>
                <CopyButton text={agentXrplAddress} label="Address" />
              </div>
            </div>

            {xrpAmount !== undefined && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Amount to send:</p>
                <p className="text-sm font-mono font-bold">{xrpAmount.toFixed(6)} XRP</p>
              </div>
            )}

            {paymentReference && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Payment reference (include in memo):</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-mono break-all">{paymentReference}</p>
                  <CopyButton text={paymentReference} label="Reference" />
                </div>
              </div>
            )}

            <p className="text-xs text-yellow-500 mt-2">
              Send the exact amount with the payment reference included as a memo on the XRPL testnet.
              After FDC verification (~5 min), FTestXRP will mint to your Flare wallet.
            </p>
          </div>
        )}

        {txHash && (
          <p className="text-xs text-muted-foreground">
            Reservation tx:{' '}
            <a
              href={`https://coston2-explorer.flare.network/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono underline"
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
