'use client'

import { useState, useEffect } from 'react'
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

interface LlamaPool {
  project: string
  symbol: string
  tvlUsd: number
  apy: number | null
  apyBase: number | null
  apyReward: number | null
  chain: string
}

// Only protocols the Flare team specifically mentioned + verified working URLs
const CURATED_PROTOCOLS: Record<string, { name: string; url: string }> = {
  'kinetic': { name: 'Kinetic Finance', url: 'https://kinetic.market' },
  'spectra-v2': { name: 'Spectra', url: 'https://app.spectra.finance' },
  'sceptre-liquid': { name: 'Sceptre', url: 'https://sceptre.fi' },
  'clearpool-lending': { name: 'Clearpool', url: 'https://clearpool.finance' },
}

function classifyRisk(apy: number, tvl: number): 'Low' | 'Medium' | 'High' {
  if (apy > 50 || tvl < 50_000) return 'High'
  if (apy > 20 || tvl < 200_000) return 'Medium'
  return 'Low'
}

function describePool(name: string, symbol: string, apyBase: number | null, apyReward: number | null): string {
  const parts: string[] = []
  if (symbol.includes('-') || symbol.includes('/')) {
    parts.push(`Provide liquidity in the ${symbol} pool on ${name}.`)
  } else {
    parts.push(`Supply ${symbol} on ${name}.`)
  }
  if (apyBase && apyBase > 0) parts.push(`Base APY: ${apyBase.toFixed(2)}%.`)
  if (apyReward && apyReward > 0) parts.push(`Reward APY: ${apyReward.toFixed(2)}%.`)
  return parts.join(' ')
}

export function useYieldData() {
  const [liveYields, setLiveYields] = useState<YieldOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchYields() {
      try {
        const res = await fetch('https://yields.llama.fi/pools')
        const json = await res.json()
        const flarePools: LlamaPool[] = (json.data ?? []).filter(
          (p: LlamaPool) =>
            p.chain === 'Flare' &&
            (p.apy ?? 0) > 0 &&
            p.tvlUsd > 0 &&
            p.project in CURATED_PROTOCOLS
        )

        if (cancelled) return

        const mapped: YieldOpportunity[] = flarePools.map((pool) => {
          const meta = CURATED_PROTOCOLS[pool.project]
          const apy = pool.apy ?? 0
          return {
            protocol: meta.name,
            asset: pool.symbol,
            apy: Math.round(apy * 100) / 100,
            tvl: Math.round(pool.tvlUsd),
            risk: classifyRisk(apy, pool.tvlUsd),
            description: describePool(meta.name, pool.symbol, pool.apyBase, pool.apyReward),
            lockPeriod: 'None',
            curator: meta.name,
            url: meta.url,
          }
        })

        setLiveYields(mapped)
      } catch (err) {
        console.warn('DeFiLlama fetch failed, using fallback data', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchYields()
    return () => { cancelled = true }
  }, [])

  // Native vaults always included
  const nativeYields: YieldOpportunity[] = DEMO_YIELDS
    .filter((y) => y.vaultId)
    .map((y) => ({
      ...y,
      risk: y.risk as 'Low' | 'Medium' | 'High',
    }))

  const allYields = [...nativeYields, ...liveYields]
  const sorted = allYields.sort((a, b) => b.apy - a.apy)

  return {
    yields: sorted,
    isLoading,
    bestYield: sorted[0] ?? null,
  }
}
