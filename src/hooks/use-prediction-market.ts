'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseEther } from 'viem'
import { flareBetAbi } from '@/lib/abi/flare-bet'
import { useNetwork } from '@/providers/network-provider'
import { CONTRACTS } from '@/config/contracts'
import { flare, coston2 } from '@/config/chains'
import { BALANCE_POLL_INTERVAL } from '@/lib/constants'
import { toast } from 'sonner'

export interface MarketData {
  id: number
  question: string
  feedId: string
  targetPrice: bigint
  deadline: bigint
  yesPool: bigint
  noPool: bigint
  resolvedPrice: bigint
  resolved: boolean
  outcome: boolean
  creator: string
}

export function usePredictionMarket() {
  const { network } = useNetwork()
  const chainId = network === 'flare' ? flare.id : coston2.id
  const { address } = useAccount()

  const flareBetAddress = CONTRACTS[network].FlareBet as `0x${string}`
  const enabled = flareBetAddress !== '0x0000000000000000000000000000000000000000'

  // Read next market ID to know how many markets exist
  const { data: nextMarketId, refetch: refetchMarketCount } = useReadContract({
    address: flareBetAddress,
    abi: flareBetAbi,
    functionName: 'nextMarketId',
    chainId,
    query: { enabled, refetchInterval: BALANCE_POLL_INTERVAL },
  })

  const marketCount = Number(nextMarketId ?? 0n)

  // Build multicall for all markets
  const marketContracts = useMemo(() => {
    if (!enabled || marketCount === 0) return []
    return Array.from({ length: marketCount }, (_, i) => ({
      address: flareBetAddress,
      abi: flareBetAbi,
      functionName: 'getMarket' as const,
      args: [BigInt(i)] as const,
      chainId,
    }))
  }, [enabled, marketCount, flareBetAddress, chainId])

  const { data: marketsRaw, refetch: refetchMarkets } = useReadContracts({
    contracts: marketContracts,
    query: { enabled: marketContracts.length > 0, refetchInterval: BALANCE_POLL_INTERVAL },
  })

  // Parse markets
  const markets: MarketData[] = useMemo(() => {
    if (!marketsRaw) return []
    return marketsRaw
      .map((result, i) => {
        if (result.status !== 'success' || !result.result) return null
        const r = result.result as [string, string, bigint, bigint, bigint, bigint, bigint, boolean, boolean, string]
        return {
          id: i,
          question: r[0],
          feedId: r[1],
          targetPrice: r[2],
          deadline: r[3],
          yesPool: r[4],
          noPool: r[5],
          resolvedPrice: r[6],
          resolved: r[7],
          outcome: r[8],
          creator: r[9],
        }
      })
      .filter((m): m is MarketData => m !== null)
  }, [marketsRaw])

  // User bets multicall
  const userBetContracts = useMemo(() => {
    if (!enabled || marketCount === 0 || !address) return []
    const contracts: Array<{
      address: `0x${string}`
      abi: typeof flareBetAbi
      functionName: 'yesBets' | 'noBets' | 'claimed' | 'calculatePayout'
      args: readonly [bigint, `0x${string}`]
      chainId: number
    }> = []
    for (let i = 0; i < marketCount; i++) {
      contracts.push({
        address: flareBetAddress,
        abi: flareBetAbi,
        functionName: 'yesBets',
        args: [BigInt(i), address] as const,
        chainId,
      })
      contracts.push({
        address: flareBetAddress,
        abi: flareBetAbi,
        functionName: 'noBets',
        args: [BigInt(i), address] as const,
        chainId,
      })
      contracts.push({
        address: flareBetAddress,
        abi: flareBetAbi,
        functionName: 'claimed',
        args: [BigInt(i), address] as const,
        chainId,
      })
      contracts.push({
        address: flareBetAddress,
        abi: flareBetAbi,
        functionName: 'calculatePayout',
        args: [BigInt(i), address] as const,
        chainId,
      })
    }
    return contracts
  }, [enabled, marketCount, address, flareBetAddress, chainId])

  const { data: userBetsRaw, refetch: refetchUserBets } = useReadContracts({
    contracts: userBetContracts,
    query: { enabled: userBetContracts.length > 0, refetchInterval: BALANCE_POLL_INTERVAL },
  })

  // Parse user bets: every 4 entries is [yesBet, noBet, claimed, payout] for a market
  const userBets = useMemo(() => {
    const map: Record<number, { yesBet: bigint; noBet: bigint; claimed: boolean; payout: bigint }> = {}
    if (!userBetsRaw) return map
    for (let i = 0; i < marketCount; i++) {
      const base = i * 4
      map[i] = {
        yesBet: (userBetsRaw[base]?.result as bigint) ?? 0n,
        noBet: (userBetsRaw[base + 1]?.result as bigint) ?? 0n,
        claimed: (userBetsRaw[base + 2]?.result as boolean) ?? false,
        payout: (userBetsRaw[base + 3]?.result as bigint) ?? 0n,
      }
    }
    return map
  }, [userBetsRaw, marketCount])

  // Refetch all data
  const refetchAll = () => {
    refetchMarketCount()
    refetchMarkets()
    refetchUserBets()
  }

  // --- Write: createMarket ---
  const {
    writeContract: writeCreate,
    data: createTxHash,
    isPending: isCreating,
  } = useWriteContract()

  const { isSuccess: createConfirmed } = useWaitForTransactionReceipt({ hash: createTxHash })

  const createMarket = (feedId: string, targetPrice: bigint, deadlineTimestamp: bigint, question: string) => {
    toast.loading('Creating market...', { id: 'create-market' })
    writeCreate(
      {
        address: flareBetAddress,
        abi: flareBetAbi,
        functionName: 'createMarket',
        args: [feedId as `0x${string}`, targetPrice, deadlineTimestamp, question],
        chainId,
      },
      {
        onError: (err) => toast.error(`Create failed: ${err.message.slice(0, 80)}`, { id: 'create-market' }),
        onSuccess: () => toast.loading('Market creation submitted...', { id: 'create-market' }),
      },
    )
  }

  // Track last market ID for each action so confirmation toasts match
  const lastBetMarket = useRef<number>(0)
  const lastResolveMarket = useRef<number>(0)
  const lastClaimMarket = useRef<number>(0)

  // --- Write: bet ---
  const {
    writeContract: writeBet,
    data: betTxHash,
    isPending: isBetting,
  } = useWriteContract()

  const { isSuccess: betConfirmed } = useWaitForTransactionReceipt({ hash: betTxHash })

  const placeBet = (marketId: number, isYes: boolean, amountEther: string) => {
    lastBetMarket.current = marketId
    const side = isYes ? 'YES' : 'NO'
    toast.loading(`Placing ${side} bet...`, { id: `bet-${marketId}` })
    writeBet(
      {
        address: flareBetAddress,
        abi: flareBetAbi,
        functionName: 'bet',
        args: [BigInt(marketId), isYes],
        value: parseEther(amountEther),
        chainId,
      },
      {
        onError: (err) => toast.error(`Bet failed: ${err.message.slice(0, 80)}`, { id: `bet-${marketId}` }),
        onSuccess: () => toast.loading('Bet submitted, confirming...', { id: `bet-${marketId}` }),
      },
    )
  }

  // --- Write: resolve ---
  const {
    writeContract: writeResolve,
    data: resolveTxHash,
    isPending: isResolving,
  } = useWriteContract()

  const { isSuccess: resolveConfirmed } = useWaitForTransactionReceipt({ hash: resolveTxHash })

  const resolveMarket = (marketId: number) => {
    lastResolveMarket.current = marketId
    toast.loading('Resolving via FTSO Oracle...', { id: `resolve-${marketId}` })
    writeResolve(
      {
        address: flareBetAddress,
        abi: flareBetAbi,
        functionName: 'resolve',
        args: [BigInt(marketId)],
        chainId,
      },
      {
        onError: (err) => toast.error(`Resolve failed: ${err.message.slice(0, 80)}`, { id: `resolve-${marketId}` }),
        onSuccess: () => toast.loading('Resolving, confirming...', { id: `resolve-${marketId}` }),
      },
    )
  }

  // --- Write: claim ---
  const {
    writeContract: writeClaim,
    data: claimTxHash,
    isPending: isClaiming,
  } = useWriteContract()

  const { isSuccess: claimConfirmed } = useWaitForTransactionReceipt({ hash: claimTxHash })

  const claimPayout = (marketId: number) => {
    lastClaimMarket.current = marketId
    toast.loading('Claiming payout...', { id: `claim-${marketId}` })
    writeClaim(
      {
        address: flareBetAddress,
        abi: flareBetAbi,
        functionName: 'claim',
        args: [BigInt(marketId)],
        chainId,
      },
      {
        onError: (err) => toast.error(`Claim failed: ${err.message.slice(0, 80)}`, { id: `claim-${marketId}` }),
        onSuccess: () => toast.loading('Claim submitted, confirming...', { id: `claim-${marketId}` }),
      },
    )
  }

  // Toast confirmations
  const toasted = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (createConfirmed && createTxHash && !toasted.current.has(createTxHash)) {
      toasted.current.add(createTxHash)
      refetchAll()
      toast.success('Market created!', { id: 'create-market' })
    }
  }, [createConfirmed, createTxHash])

  useEffect(() => {
    if (betConfirmed && betTxHash && !toasted.current.has(betTxHash)) {
      toasted.current.add(betTxHash)
      refetchAll()
      toast.success('Bet placed!', { id: `bet-${lastBetMarket.current}` })
    }
  }, [betConfirmed, betTxHash])

  useEffect(() => {
    if (resolveConfirmed && resolveTxHash && !toasted.current.has(resolveTxHash)) {
      toasted.current.add(resolveTxHash)
      refetchAll()
      toast.success('Market resolved via FTSO!', { id: `resolve-${lastResolveMarket.current}` })
    }
  }, [resolveConfirmed, resolveTxHash])

  useEffect(() => {
    if (claimConfirmed && claimTxHash && !toasted.current.has(claimTxHash)) {
      toasted.current.add(claimTxHash)
      refetchAll()
      toast.success('Payout claimed!', { id: `claim-${lastClaimMarket.current}` })
    }
  }, [claimConfirmed, claimTxHash])

  return {
    enabled,
    markets,
    userBets,
    marketCount,
    createMarket,
    isCreating,
    placeBet,
    isBetting,
    resolveMarket,
    isResolving,
    claimPayout,
    isClaiming,
    refetchAll,
  }
}
