'use client'

import { DEMO_YIELDS } from '@/lib/constants'

export interface YieldOpportunity {
  protocol: string
  asset: string
  apy: number
  tvl: number
  risk: 'Low' | 'Medium' | 'High'
  description: string
  lockPeriod: string
}

export function useYieldData() {
  // For hackathon: return curated demo data
  // In production: read from Firelight, earnXRP, FTSO delegation contracts
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
