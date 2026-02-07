'use client'

import { useReadContract } from 'wagmi'
import { contractRegistryAbi } from '@/lib/abi/contract-registry'
import { ftsoV2Abi } from '@/lib/abi/ftso-v2'
import { CONTRACTS } from '@/config/contracts'
import { useNetwork } from '@/providers/network-provider'
import { FEED_IDS, PRICE_POLL_INTERVAL, DEMO_PRICES } from '@/lib/constants'
import { flare, coston2 } from '@/config/chains'

export function useFtsoPrices() {
  const { network } = useNetwork()
  const chainId = network === 'flare' ? flare.id : coston2.id
  const registryAddress = CONTRACTS[network].ContractRegistry

  // Step 1: Resolve FtsoV2 address from ContractRegistry
  const { data: ftsoV2Address } = useReadContract({
    address: registryAddress,
    abi: contractRegistryAbi,
    functionName: 'getContractAddressByName',
    args: ['FtsoV2'],
    chainId,
  })

  // Step 2: Fetch prices from FtsoV2
  const feedIds = [FEED_IDS['FLR/USD'], FEED_IDS['XRP/USD']] as `0x${string}`[]

  const { data: priceData, isLoading, error } = useReadContract({
    address: ftsoV2Address as `0x${string}`,
    abi: ftsoV2Abi,
    functionName: 'getFeedsByIdInWei',
    args: [feedIds],
    chainId,
    query: {
      enabled: !!ftsoV2Address && ftsoV2Address !== '0x0000000000000000000000000000000000000000',
      refetchInterval: PRICE_POLL_INTERVAL,
    },
  })

  // Parse results into a price map
  const prices: Record<string, number> = { ...DEMO_PRICES } // fallback

  if (priceData) {
    const [values, _timestamp] = priceData as [bigint[], bigint]
    const symbols = ['FLR', 'XRP']
    symbols.forEach((sym, i) => {
      if (values[i]) {
        // getFeedsByIdInWei returns value in wei (1e18 precision)
        prices[sym] = Number(values[i]) / 1e18
      }
    })
    // Derived prices
    prices['C2FLR'] = prices['FLR']
    prices['WFLR'] = prices['FLR']
    prices['FXRP'] = prices['XRP']
    prices['FTestXRP'] = prices['XRP']
    prices['stFXRP'] = prices['XRP'] * 1.05 // stFXRP slightly above due to accrued yield
    prices['stXRP'] = prices['XRP'] * 1.05
  }

  return { prices, isLoading, error, isLive: !!priceData }
}
