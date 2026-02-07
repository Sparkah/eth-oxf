'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { assetManagerAbi } from '@/lib/abi/fassets'
import { useNetwork } from '@/providers/network-provider'
import { flare, coston2 } from '@/config/chains'

// Placeholder AssetManager address — would be resolved from ContractRegistry in production
const ASSET_MANAGER: Record<string, `0x${string}`> = {
  flare: '0x0000000000000000000000000000000000000000',
  coston2: '0x0000000000000000000000000000000000000000',
}

export function useFAssets(lots: bigint = 0n) {
  const { network } = useNetwork()
  const chainId = network === 'flare' ? flare.id : coston2.id
  const assetManager = ASSET_MANAGER[network]
  const enabled = assetManager !== '0x0000000000000000000000000000000000000000'

  // Read lot size
  const { data: lotSize } = useReadContract({
    address: assetManager,
    abi: assetManagerAbi,
    functionName: 'lotSize',
    chainId,
    query: { enabled },
  })

  // Read collateral reservation fee (hook called unconditionally at top level)
  const { data: reservationFee } = useReadContract({
    address: assetManager,
    abi: assetManagerAbi,
    functionName: 'getCollateralReservationFee',
    args: [lots],
    chainId,
    query: { enabled: enabled && lots > 0n },
  })

  // Write: reserve collateral
  const { writeContract, data: txHash, isPending: isReserving } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const reserveCollateral = (
    agentVault: `0x${string}`,
    maxFeeBips: bigint,
    feeValue: bigint
  ) => {
    writeContract({
      address: assetManager,
      abi: assetManagerAbi,
      functionName: 'reserveCollateral',
      args: [agentVault, lots, maxFeeBips, '0x0000000000000000000000000000000000000000'],
      value: feeValue,
      chainId,
    })
  }

  return {
    lotSize: lotSize as bigint | undefined,
    reservationFee: reservationFee as bigint | undefined,
    reserveCollateral,
    isReserving,
    isConfirming,
    isConfirmed,
    txHash,
  }
}
