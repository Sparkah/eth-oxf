'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { AddressInput } from '@/components/portfolio/address-input'
import { TokenBalances } from '@/components/portfolio/token-balances'
import { PortfolioChart } from '@/components/portfolio/portfolio-chart'
import { useMultiAddressBalances, useDemoBalances } from '@/hooks/use-token-balances'
import { useFtsoPrices } from '@/hooks/use-ftso-prices'

export default function DashboardPage() {
  const { address: connectedAddress } = useAccount()
  const [trackedAddresses, setTrackedAddresses] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from localStorage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flarevault-addresses')
      if (saved) setTrackedAddresses(JSON.parse(saved))
    } catch {}
    setMounted(true)
  }, [])

  // Persist to localStorage on change (only after initial load)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('flarevault-addresses', JSON.stringify(trackedAddresses))
    }
  }, [trackedAddresses, mounted])

  // Auto-add connected wallet on first connect
  useEffect(() => {
    if (connectedAddress && !trackedAddresses.includes(connectedAddress)) {
      setTrackedAddresses((prev) =>
        prev.includes(connectedAddress) ? prev : [...prev, connectedAddress]
      )
    }
  }, [connectedAddress]) // eslint-disable-line react-hooks/exhaustive-deps

  const hexAddresses = trackedAddresses.filter(
    (a) => /^0x[a-fA-F0-9]{40}$/.test(a)
  ) as `0x${string}`[]

  const { balances: liveBalances, isLoading } = useMultiAddressBalances(hexAddresses)
  const demoBalances = useDemoBalances()
  const { prices } = useFtsoPrices()

  // Only show demo data when no wallets are tracked at all
  const hasWallets = hexAddresses.length > 0
  const balances = hasWallets ? liveBalances : demoBalances
  const showingDemo = !hasWallets

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {showingDemo && !isLoading
            ? 'Showing demo data — add wallet addresses to see live balances.'
            : `Tracking ${hexAddresses.length} wallet${hexAddresses.length !== 1 ? 's' : ''} with live FTSOv2 prices.`}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <TokenBalances balances={balances} prices={prices} isLoading={isLoading} />
        </div>
        <div className="space-y-6">
          <AddressInput
            addresses={trackedAddresses}
            onAddressesChange={setTrackedAddresses}
          />
          <PortfolioChart balances={balances} prices={prices} />
        </div>
      </div>
    </div>
  )
}
