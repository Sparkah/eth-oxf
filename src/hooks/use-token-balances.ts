'use client'

import { useReadContracts, useBalance } from 'wagmi'
import { erc20Abi } from '@/lib/abi/erc20'
import { TOKENS } from '@/config/tokens'
import { useNetwork } from '@/providers/network-provider'
import { BALANCE_POLL_INTERVAL } from '@/lib/constants'
import { flare, coston2 } from '@/config/chains'

export interface TokenBalance {
  symbol: string
  name: string
  balance: number
  decimals: number
  logo: string
  address: string | 'native'
}

export function useTokenBalances(address: `0x${string}` | undefined) {
  const { network } = useNetwork()
  const chainId = network === 'flare' ? flare.id : coston2.id

  const { data: nativeBalance } = useBalance({
    address,
    chainId,
    query: {
      enabled: !!address,
      refetchInterval: BALANCE_POLL_INTERVAL,
    },
  })

  const erc20Tokens = TOKENS.filter((t) => {
    const addr = t.address[network]
    return addr && addr !== 'native' && addr !== '0x' && !addr.startsWith('0x000000000000000000000000000000000000')
  })

  const contracts = erc20Tokens.map((token) => ({
    address: token.address[network] as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf' as const,
    args: [address!] as const,
    chainId,
  }))

  const { data: erc20Results, isLoading } = useReadContracts({
    contracts: address ? contracts : [],
    query: {
      enabled: !!address && contracts.length > 0,
      refetchInterval: BALANCE_POLL_INTERVAL,
    },
  })

  const balances: TokenBalance[] = []

  if (nativeBalance) {
    balances.push({
      symbol: network === 'coston2' ? 'C2FLR' : 'FLR',
      name: network === 'coston2' ? 'Coston2 Flare' : 'Flare',
      balance: Number(nativeBalance.value) / 1e18,
      decimals: 18,
      logo: '/tokens/flr.svg',
      address: 'native',
    })
  }

  if (erc20Results) {
    erc20Tokens.forEach((token, i) => {
      const result = erc20Results[i]
      if (result?.status === 'success') {
        balances.push({
          symbol: token.symbol,
          name: token.name,
          balance: Number(result.result as bigint) / 10 ** token.decimals,
          decimals: token.decimals,
          logo: token.logo,
          address: token.address[network] as string,
        })
      }
    })
  }

  return { balances, isLoading }
}

/** Aggregate balances across multiple addresses */
export function useMultiAddressBalances(addresses: `0x${string}`[]) {
  const { network } = useNetwork()
  const chainId = network === 'flare' ? flare.id : coston2.id

  // Native balance calls — one per address
  const nativeCalls = addresses.map((addr) => ({
    address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`, // Multicall3
    abi: [
      {
        type: 'function' as const,
        name: 'getEthBalance' as const,
        stateMutability: 'view' as const,
        inputs: [{ name: 'addr', type: 'address' as const }],
        outputs: [{ name: 'balance', type: 'uint256' as const }],
      },
    ] as const,
    functionName: 'getEthBalance' as const,
    args: [addr] as const,
    chainId,
  }))

  // ERC-20 tokens to check
  const erc20Tokens = TOKENS.filter((t) => {
    const addr = t.address[network]
    return addr && addr !== 'native' && addr !== '0x' && !addr.startsWith('0x000000000000000000000000000000000000')
  })

  // ERC-20 calls — one per (token, address) pair
  const erc20Calls = addresses.flatMap((walletAddr) =>
    erc20Tokens.map((token) => ({
      address: token.address[network] as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: [walletAddr] as const,
      chainId,
    }))
  )

  const allContracts = [...nativeCalls, ...erc20Calls]

  const { data: results, isLoading } = useReadContracts({
    contracts: addresses.length > 0 ? allContracts : [],
    query: {
      enabled: addresses.length > 0,
      refetchInterval: BALANCE_POLL_INTERVAL,
    },
  })

  const balances: TokenBalance[] = []

  if (results) {
    // Aggregate native balances
    let totalNative = 0n
    for (let i = 0; i < addresses.length; i++) {
      const r = results[i]
      if (r?.status === 'success') {
        totalNative += r.result as bigint
      }
    }
    if (totalNative > 0n) {
      balances.push({
        symbol: network === 'coston2' ? 'C2FLR' : 'FLR',
        name: network === 'coston2' ? 'Coston2 Flare' : 'Flare',
        balance: Number(totalNative) / 1e18,
        decimals: 18,
        logo: '/tokens/flr.svg',
        address: 'native',
      })
    }

    // Aggregate ERC-20 balances
    const erc20Start = addresses.length // offset past native calls
    erc20Tokens.forEach((token, tokenIdx) => {
      let total = 0n
      for (let addrIdx = 0; addrIdx < addresses.length; addrIdx++) {
        const resultIdx = erc20Start + addrIdx * erc20Tokens.length + tokenIdx
        const r = results[resultIdx]
        if (r?.status === 'success') {
          total += r.result as bigint
        }
      }
      if (total > 0n) {
        balances.push({
          symbol: token.symbol,
          name: token.name,
          balance: Number(total) / 10 ** token.decimals,
          decimals: token.decimals,
          logo: token.logo,
          address: token.address[network] as string,
        })
      }
    })
  }

  return { balances, isLoading }
}

export function useDemoBalances(): TokenBalance[] {
  return [
    { symbol: 'FLR', name: 'Flare', balance: 15420.5, decimals: 18, logo: '/tokens/flr.svg', address: 'native' },
    { symbol: 'WFLR', name: 'Wrapped Flare', balance: 8200.0, decimals: 18, logo: '/tokens/flr.svg', address: '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d' },
    { symbol: 'FTestXRP', name: 'FXRP', balance: 1250.0, decimals: 6, logo: '/tokens/xrp.svg', address: '0x0b6A3645c240605887a5532109323A3E12273dc7' },
    { symbol: 'USDT0', name: 'USDT0', balance: 500.0, decimals: 6, logo: '/tokens/usdt.svg', address: '0xC1A5B41512496B80903D1f32d6dEa3a73212E71F' },
  ]
}
