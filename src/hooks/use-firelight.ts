'use client'

import { useEffect } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { stfxrpVaultAbi } from '@/lib/abi/stfxrp-vault'
import { erc20Abi } from '@/lib/abi/erc20'
import { useNetwork } from '@/providers/network-provider'
import { CONTRACTS } from '@/config/contracts'
import { flare, coston2 } from '@/config/chains'
import { BALANCE_POLL_INTERVAL } from '@/lib/constants'

export function useStaking() {
  const { network } = useNetwork()
  const chainId = network === 'flare' ? flare.id : coston2.id
  const { address } = useAccount()
  const vaultAddress = CONTRACTS[network].StFXRP as `0x${string}`
  const fxrpAddress = CONTRACTS[network].FXRP as `0x${string}`
  const enabled = vaultAddress !== '0x0000000000000000000000000000000000000000'

  // Read stFXRP balance
  const { data: stFxrpBalance, refetch: refetchBalance } = useReadContract({
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

  // Read total supply of stFXRP
  const { data: totalSupply } = useReadContract({
    address: vaultAddress,
    abi: stfxrpVaultAbi,
    functionName: 'totalSupply',
    chainId,
    query: { enabled, refetchInterval: BALANCE_POLL_INTERVAL },
  })

  // Read user's FXRP balance
  const { data: fxrpBalance, refetch: refetchFxrp } = useReadContract({
    address: fxrpAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address!],
    chainId,
    query: { enabled: !!address, refetchInterval: BALANCE_POLL_INTERVAL },
  })

  // Read current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract({
    address: fxrpAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, vaultAddress],
    chainId,
    query: { enabled: enabled && !!address },
  })

  // Write: approve FXRP spending
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApproving,
  } = useWriteContract()

  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveTxHash })

  const approve = (amount: bigint) => {
    writeApprove({
      address: fxrpAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [vaultAddress, amount],
      chainId,
    })
  }

  // Write: deposit FXRP
  const {
    writeContract: writeDeposit,
    data: depositTxHash,
    isPending: isDepositing,
  } = useWriteContract()

  const { isLoading: isDepositConfirming, isSuccess: depositConfirmed } =
    useWaitForTransactionReceipt({ hash: depositTxHash })

  const deposit = (amount: bigint) => {
    writeDeposit({
      address: vaultAddress,
      abi: stfxrpVaultAbi,
      functionName: 'deposit',
      args: [amount],
      chainId,
    })
  }

  // Write: redeem stFXRP
  const {
    writeContract: writeRedeem,
    data: redeemTxHash,
    isPending: isRedeeming,
  } = useWriteContract()

  const { isSuccess: redeemConfirmed } = useWaitForTransactionReceipt({ hash: redeemTxHash })

  const redeem = (shares: bigint) => {
    writeRedeem({
      address: vaultAddress,
      abi: stfxrpVaultAbi,
      functionName: 'redeem',
      args: [shares],
      chainId,
    })
  }

  // Refetch allowance after approval confirms
  useEffect(() => {
    if (approveConfirmed) refetchAllowance()
  }, [approveConfirmed, refetchAllowance])

  // Refetch balances after deposit confirms
  useEffect(() => {
    if (depositConfirmed) {
      refetchBalance()
      refetchFxrp()
      refetchAllowance()
    }
  }, [depositConfirmed, refetchBalance, refetchFxrp, refetchAllowance])

  // Refetch balances after redeem confirms
  useEffect(() => {
    if (redeemConfirmed) {
      refetchBalance()
      refetchFxrp()
    }
  }, [redeemConfirmed, refetchBalance, refetchFxrp])

  // Calculate exchange rate
  const exchangeRate =
    totalAssets !== undefined && totalSupply !== undefined && (totalSupply as bigint) > 0n
      ? Number(totalAssets as bigint) / Number(totalSupply as bigint)
      : 1.0 // 1:1 when vault is empty

  return {
    vaultAddress,
    enabled,
    stFxrpBalance: stFxrpBalance as bigint | undefined,
    fxrpBalance: fxrpBalance as bigint | undefined,
    totalAssets: totalAssets as bigint | undefined,
    totalSupply: totalSupply as bigint | undefined,
    currentAllowance: currentAllowance as bigint | undefined,
    exchangeRate,
    approve,
    isApproving,
    approveConfirmed,
    approveTxHash,
    deposit,
    isDepositing,
    isDepositConfirming,
    depositConfirmed,
    depositTxHash,
    redeem,
    isRedeeming,
    redeemConfirmed,
    redeemTxHash,
    refetchBalance,
    refetchFxrp,
    refetchAllowance,
  }
}
