'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { NetworkId } from '@/config/contracts'

interface NetworkContextValue {
  network: NetworkId
  setNetwork: (n: NetworkId) => void
  toggleNetwork: () => void
}

const NetworkContext = createContext<NetworkContextValue>({
  network: 'flare',
  setNetwork: () => {},
  toggleNetwork: () => {},
})

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<NetworkId>('flare')

  const toggleNetwork = useCallback(() => {
    setNetwork((prev) => (prev === 'flare' ? 'coston2' : 'flare'))
  }, [])

  return (
    <NetworkContext.Provider value={{ network, setNetwork, toggleNetwork }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  return useContext(NetworkContext)
}
