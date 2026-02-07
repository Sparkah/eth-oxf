'use client'

import { useEffect, useRef } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { stfxrpVaultAbi } from '@/lib/abi/stfxrp-vault'
import { erc20Abi } from '@/lib/abi/erc20'
import { useNetwork } from '@/providers/network-provider'
import { CONTRACTS, VAULTS, type VaultId } from '@/config/contracts'
import { flare, coston2 } from '@/config/chains'
import { BALANCE_POLL_INTERVAL } from '@/lib/constants'
import { toast } from 'sonner'

export function useStaking(vaultId: VaultId = 'StFXRP') {
  const { network } = useNetwork()
  const chainId = network === 'flare' ? flare.id : coston2.id
  const { address } = useAccount()

  const vault = VAULTS[vaultId]
  const vaultAddress = CONTRACTS[network][vaultId] as `0x${string}`
  const assetAddress = CONTRACTS[network][vault.asset as keyof (typeof CONTRACTS)[typeof network]] as `0x${string}`
  const enabled = vaultAddress !== '0x0000000000000000000000000000000000000000'

  // Read vault share balance
  const { data: shareBalance, refetch: refetchBalance } = useReadContract({
    address: vaultAddress,
    abi: stfxrpVaultAbi,
    functionName: 'balanceOf',
    args: [address!],
    chainId,
    query: { enabled: enabled && !!address, refetchInterval: BALANCE_POLL_INTERVAL },
  })

  // Read total assets in vault
  const { data: totalAssets } = useReadContract({
    address: vaultAddress,
    abi: stfxrpVaultAbi,
    functionName: 'totalAssets',
    chainId,
    query: { enabled, refetchInterval: BALANCE_POLL_INTERVAL },
  })

  // Read total supply of vault shares
  const { data: totalSupply } = useReadContract({
    address: vaultAddress,
    abi: stfxrpVaultAbi,
    functionName: 'totalSupply',
    chainId,
    query: { enabled, refetchInterval: BALANCE_POLL_INTERVAL },
  })

  // Read user's underlying asset balance
  const { data: assetBalance, refetch: refetchAsset } = useReadContract({
    address: assetAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address!],
    chainId,
    query: { enabled: !!address, refetchInterval: BALANCE_POLL_INTERVAL },
  })

  // Read current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: assetAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, vaultAddress],
    chainId,
    query: { enabled: enabled && !!address },
  })

  // Write: approve asset spending
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApproving,
  } = useWriteContract()

  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash })

  const approve = (amount: bigint) => {
    toast.loading('Waiting for approval...', { id: `approve-${vaultId}` })
    writeApprove(
      {
        address: assetAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [vaultAddress, amount],
        chainId,
      },
      {
        onError: () => toast.error('Approval failed', { id: `approve-${vaultId}` }),
        onSuccess: () => toast.loading('Approval submitted, confirming...', { id: `approve-${vaultId}` }),
      },
    )
  }

  // Write: deposit asset
  const {
    writeContract: writeDeposit,
    data: depositTxHash,
    isPending: isDepositing,
  } = useWriteContract()

  const { isLoading: isDepositConfirming, isSuccess: depositConfirmed } =
    useWaitForTransactionReceipt({ hash: depositTxHash })

  const deposit = (amount: bigint) => {
    toast.loading(`Waiting for ${vault.symbol} deposit...`, { id: `deposit-${vaultId}` })
    writeDeposit(
      {
        address: vaultAddress,
        abi: stfxrpVaultAbi,
        functionName: 'deposit',
        args: [amount],
        chainId,
      },
      {
        onError: () => toast.error('Deposit failed', { id: `deposit-${vaultId}` }),
        onSuccess: () => toast.loading('Deposit submitted, confirming...', { id: `deposit-${vaultId}` }),
      },
    )
  }

  // Write: redeem shares
  const {
    writeContract: writeRedeem,
    data: redeemTxHash,
    isPending: isRedeeming,
  } = useWriteContract()

  const { isSuccess: redeemConfirmed } = useWaitForTransactionReceipt({ hash: redeemTxHash })

  const redeem = (shares: bigint) => {
    toast.loading('Waiting for unstake...', { id: `redeem-${vaultId}` })
    writeRedeem(
      {
        address: vaultAddress,
        abi: stfxrpVaultAbi,
        functionName: 'redeem',
        args: [shares],
        chainId,
      },
      {
        onError: () => toast.error('Unstake failed', { id: `redeem-${vaultId}` }),
        onSuccess: () => toast.loading('Unstake submitted, confirming...', { id: `redeem-${vaultId}` }),
      },
    )
  }

  // Track which tx hashes we've already toasted to avoid duplicate notifications
  const toasted = useRef<Set<string>>(new Set())

  // Refetch allowance + toast after approval confirms
  useEffect(() => {
    if (approveConfirmed && approveTxHash && !toasted.current.has(approveTxHash)) {
      toasted.current.add(approveTxHash)
      refetchAllowance()
      toast.success('Approval confirmed', {
        id: `approve-${vaultId}`,
        description: `You can now deposit into the ${vault.symbol} vault.`,
      })
    }
  }, [approveConfirmed, approveTxHash, refetchAllowance, vaultId, vault.symbol])

  // Refetch balances + toast after deposit confirms
  useEffect(() => {
    if (depositConfirmed && depositTxHash && !toasted.current.has(depositTxHash)) {
      toasted.current.add(depositTxHash)
      refetchBalance()
      refetchAsset()
      refetchAllowance()
      toast.success('Stake successful!', {
        id: `deposit-${vaultId}`,
        description: `You received ${vault.symbol} tokens.`,
        duration: 6000,
      })
    }
  }, [depositConfirmed, depositTxHash, refetchBalance, refetchAsset, refetchAllowance, vaultId, vault.symbol])

  // Refetch balances + toast after redeem confirms
  useEffect(() => {
    if (redeemConfirmed && redeemTxHash && !toasted.current.has(redeemTxHash)) {
      toasted.current.add(redeemTxHash)
      refetchBalance()
      refetchAsset()
      toast.success('Unstake successful!', {
        id: `redeem-${vaultId}`,
        description: `Your ${vault.symbol} has been redeemed.`,
        duration: 6000,
      })
    }
  }, [redeemConfirmed, redeemTxHash, refetchBalance, refetchAsset, vaultId, vault.symbol])

  // Calculate exchange rate
  const exchangeRate =
    totalAssets !== undefined && totalSupply !== undefined && (totalSupply as bigint) > 0n
      ? Number(totalAssets as bigint) / Number(totalSupply as bigint)
      : 1.0

  return {
    vaultId,
    vault,
    vaultAddress,
    enabled,
    shareBalance: shareBalance as bigint | undefined,
    assetBalance: assetBalance as bigint | undefined,
    totalAssets: totalAssets as bigint | undefined,
    totalSupply: totalSupply as bigint | undefined,
    currentAllowance: currentAllowance as bigint | undefined,
    exchangeRate,
    approve,
    isApproving,
    deposit,
    isDepositing,
    isDepositConfirming,
    redeem,
    isRedeeming,
  }
}
