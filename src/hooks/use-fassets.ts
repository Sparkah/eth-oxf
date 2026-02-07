'use client'

import { useState, useEffect, useRef } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { decodeEventLog, formatEther } from 'viem'
import { toast } from 'sonner'
import { assetManagerAbi } from '@/lib/abi/fassets'
import { CONTRACTS } from '@/config/contracts'
import { useNetwork } from '@/providers/network-provider'
import { coston2 } from '@/config/chains'

export interface AvailableAgent {
  agentVault: `0x${string}`
  feeBIPS: bigint
  freeCollateralLots: bigint
}

export interface PaymentInfo {
  paymentAddress: string
  paymentReference: `0x${string}`
  valueUBA: bigint
  feeUBA: bigint
  reservationId: bigint
}

export function useFAssets(lots: bigint = 1n) {
  const { network } = useNetwork()
  const chainId = coston2.id // FAssets only on Coston2 for now
  const assetManager = CONTRACTS[network].AssetManager_FTestXRP as `0x${string}`
  const enabled = assetManager !== '0x0000000000000000000000000000000000000000'

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const toastedRef = useRef<Set<string>>(new Set())

  // ── Reads ─────────────────────────────────────────────

  // Available agents
  const { data: agentsRaw, isLoading: isLoadingAgents } = useReadContract({
    address: assetManager,
    abi: assetManagerAbi,
    functionName: 'getAvailableAgentsDetailedList',
    args: [0n, 100n],
    chainId,
    query: { enabled },
  })

  // Lot size (in AMG)
  const { data: lotSizeAmg } = useReadContract({
    address: assetManager,
    abi: assetManagerAbi,
    functionName: 'lotSize',
    chainId,
    query: { enabled },
  })

  // Minting granularity (AMG → UBA conversion)
  const { data: granularity } = useReadContract({
    address: assetManager,
    abi: assetManagerAbi,
    functionName: 'assetMintingGranularityUBA',
    chainId,
    query: { enabled },
  })

  // Collateral reservation fee for given lots
  const { data: reservationFeeWei } = useReadContract({
    address: assetManager,
    abi: assetManagerAbi,
    functionName: 'collateralReservationFee',
    args: [lots],
    chainId,
    query: { enabled: enabled && lots > 0n },
  })

  // ── Derived data ──────────────────────────────────────

  // Parse agents from raw contract response
  const agents: AvailableAgent[] = (() => {
    if (!agentsRaw) return []
    const [list] = agentsRaw as unknown as [readonly {
      agentVault: `0x${string}`
      feeBIPS: bigint
      freeCollateralLots: bigint
    }[], bigint]
    return list
      .filter((a) => a.freeCollateralLots > 0n)
      .map((a) => ({
        agentVault: a.agentVault,
        feeBIPS: a.feeBIPS,
        freeCollateralLots: a.freeCollateralLots,
      }))
      .sort((a, b) => Number(a.feeBIPS - b.feeBIPS)) // cheapest first
  })()

  // Lot size in XRP (drops = UBA for XRP, 6 decimals)
  const lotSizeXRP =
    lotSizeAmg && granularity
      ? Number((lotSizeAmg as bigint) * (granularity as bigint)) / 1e6
      : undefined

  // Fee in C2FLR
  const reservationFeeFLR = reservationFeeWei
    ? Number(formatEther(reservationFeeWei as bigint))
    : undefined

  // ── Write: reserve collateral ─────────────────────────

  const {
    writeContract,
    data: txHash,
    isPending: isReserving,
    error: writeError,
  } = useWriteContract()

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({ hash: txHash })

  const reserveCollateral = (agentVault: `0x${string}`, maxFeeBips: bigint) => {
    if (!reservationFeeWei) return
    setPaymentInfo(null)
    const toastId = 'fassets-reserve'
    toast.loading('Submitting collateral reservation...', { id: toastId })

    writeContract({
      address: assetManager,
      abi: assetManagerAbi,
      functionName: 'reserveCollateral',
      args: [agentVault, lots, maxFeeBips, '0x0000000000000000000000000000000000000000'],
      value: reservationFeeWei as bigint,
      chainId,
    })
  }

  // Toast on write error
  useEffect(() => {
    if (writeError) {
      toast.error('Reservation failed', {
        id: 'fassets-reserve',
        description: writeError.message.slice(0, 120),
      })
    }
  }, [writeError])

  // Parse CollateralReserved event from receipt
  useEffect(() => {
    if (!receipt || !isConfirmed) return
    const hash = receipt.transactionHash
    if (toastedRef.current.has(hash)) return
    toastedRef.current.add(hash)

    // Parse logs for CollateralReserved event
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: assetManagerAbi,
          data: log.data,
          topics: log.topics,
        })
        if (decoded.eventName === 'CollateralReserved') {
          const args = decoded.args as {
            collateralReservationId: bigint
            valueUBA: bigint
            feeUBA: bigint
            paymentAddress: string
            paymentReference: `0x${string}`
          }
          setPaymentInfo({
            paymentAddress: args.paymentAddress,
            paymentReference: args.paymentReference,
            valueUBA: args.valueUBA,
            feeUBA: args.feeUBA,
            reservationId: args.collateralReservationId,
          })
          toast.success('Collateral reserved!', {
            id: 'fassets-reserve',
            description: `Send XRP to ${args.paymentAddress}`,
          })
          return
        }
      } catch {
        // Not our event, skip
      }
    }

    // If we didn't find the event, still mark success
    toast.success('Transaction confirmed', { id: 'fassets-reserve' })
  }, [receipt, isConfirmed])

  return {
    enabled,
    agents,
    isLoadingAgents,
    lotSizeXRP,
    reservationFeeFLR,
    reservationFeeWei: reservationFeeWei as bigint | undefined,
    reserveCollateral,
    isReserving,
    isConfirming,
    isConfirmed,
    paymentInfo,
    txHash,
  }
}
