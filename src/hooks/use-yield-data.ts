'use client'

import { DEMO_YIELDS } from '@/lib/constants'
import type { VaultId } from '@/config/contracts'

export interface YieldOpportunity {
  protocol: string
  asset: string
  apy: number
  tvl: number
  risk: 'Low' | 'Medium' | 'High'
  description: string
  lockPeriod: string
  vaultId?: VaultId
  curator?: string
  url?: string
}

export function useYieldData() {
  const yields: YieldOpportunity[] = DEMO_YIELDS.map((y) => ({
    ...y,
    risk: y.risk as 'Low' | 'Medium' | 'High',
  }))

  const sorted = [...yields].sort((a, b) => b.apy - a.apy)

  return {
    yields: sorted,
    isLoading: false,
    bestYield: sorted[0] ?? null,
  }
}
