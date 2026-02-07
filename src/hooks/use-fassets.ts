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

export function useFAssets() {
  const { network } = useNetwork()
  const chainId = network === 'flare' ? flare.id : coston2.id
  const assetManager = ASSET_MANAGER[network]

  // Read lot size
  const { data: lotSize } = useReadContract({
    address: assetManager,
    abi: assetManagerAbi,
    functionName: 'lotSize',
    chainId,
    query: { enabled: assetManager !== '0x0000000000000000000000000000000000000000' },
  })

  // Read collateral reservation fee
  const getReservationFee = (lots: bigint) => {
    return useReadContract({
      address: assetManager,
      abi: assetManagerAbi,
      functionName: 'getCollateralReservationFee',
      args: [lots],
      chainId,
      query: { enabled: assetManager !== '0x0000000000000000000000000000000000000000' && lots > 0n },
    })
  }

  // Write: reserve collateral
  const { writeContract, data: txHash, isPending: isReserving } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const reserveCollateral = (
    agentVault: `0x${string}`,
    lots: bigint,
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
    getReservationFee,
    reserveCollateral,
    isReserving,
    isConfirming,
    isConfirmed,
    txHash,
  }
}
