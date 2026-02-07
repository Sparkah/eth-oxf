'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { flare, coston2 } from '@/config/chains'
import type { NetworkId } from '@/config/contracts'

interface NetworkContextValue {
  network: NetworkId
}

const NetworkContext = createContext<NetworkContextValue>({
  network: 'flare',
})

export function NetworkProvider({ children }: { children: ReactNode }) {
  const { chainId } = useAccount()

  const network = useMemo<NetworkId>(() => {
    if (chainId === coston2.id) return 'coston2'
    return 'flare'
  }, [chainId])

  return (
    <NetworkContext.Provider value={{ network }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  return useContext(NetworkContext)
}
