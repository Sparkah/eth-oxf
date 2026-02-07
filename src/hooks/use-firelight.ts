'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { firelightAbi } from '@/lib/abi/firelight'
import { erc20Abi } from '@/lib/abi/erc20'
import { useNetwork } from '@/providers/network-provider'
import { CONTRACTS } from '@/config/contracts'
import { flare, coston2 } from '@/config/chains'

// Placeholder Firelight vault address
const FIRELIGHT_VAULT: Record<string, `0x${string}`> = {
  flare: '0x0000000000000000000000000000000000000000',
  coston2: '0x0000000000000000000000000000000000000000',
}

export function useFirelight() {
  const { network } = useNetwork()
  const chainId = network === 'flare' ? flare.id : coston2.id
  const { address } = useAccount()
  const vaultAddress = FIRELIGHT_VAULT[network]
  const fxrpAddress = CONTRACTS[network].FXRP
  const enabled = vaultAddress !== '0x0000000000000000000000000000000000000000'

  // Read stXRP balance
  const { data: stXrpBalance } = useReadContract({
    address: vaultAddress,
    abi: firelightAbi,
    functionName: 'balanceOf',
    args: [address!],
    chainId,
    query: { enabled: enabled && !!address },
  })

  // Read total assets / supply for APY calc
  const { data: totalAssets } = useReadContract({
    address: vaultAddress,
    abi: firelightAbi,
    functionName: 'totalAssets',
    chainId,
    query: { enabled },
  })

  const { data: totalSupply } = useReadContract({
    address: vaultAddress,
    abi: firelightAbi,
    functionName: 'totalSupply',
    chainId,
    query: { enabled },
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
      abi: firelightAbi,
      functionName: 'deposit',
      args: [amount],
      chainId,
    })
  }

  // Write: withdraw
  const {
    writeContract: writeWithdraw,
    data: withdrawTxHash,
    isPending: isWithdrawing,
  } = useWriteContract()

  const { isSuccess: withdrawConfirmed } = useWaitForTransactionReceipt({ hash: withdrawTxHash })

  const withdraw = (shares: bigint) => {
    writeWithdraw({
      address: vaultAddress,
      abi: firelightAbi,
      functionName: 'withdraw',
      args: [shares],
      chainId,
    })
  }

  // Calculate exchange rate
  const exchangeRate =
    totalAssets && totalSupply && (totalSupply as bigint) > 0n
      ? Number(totalAssets as bigint) / Number(totalSupply as bigint)
      : 1.05 // demo fallback

  return {
    stXrpBalance: stXrpBalance as bigint | undefined,
    totalAssets: totalAssets as bigint | undefined,
    totalSupply: totalSupply as bigint | undefined,
    exchangeRate,
    approve,
    isApproving,
    approveConfirmed,
    deposit,
    isDepositing,
    isDepositConfirming,
    depositConfirmed,
    depositTxHash,
    withdraw,
    isWithdrawing,
    withdrawConfirmed,
    withdrawTxHash,
  }
}
