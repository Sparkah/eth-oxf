import { createWalletClient, createPublicClient, http, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { readFileSync } from 'fs'

const coston2 = defineChain({
  id: 114,
  name: 'Coston2',
  nativeCurrency: { name: 'Coston2 Flare', symbol: 'C2FLR', decimals: 18 },
  rpcUrls: { default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] } },
})

const TOKENS = {
  USDT0: '0xC1A5B41512496B80903D1f32d6dEa3a73212E71F' as const,
  WFLR: '0xC67DCE33e8b36abDD40FdBCA35F4e24CA3AEe78A' as const,
}

async function main() {
  const pk = process.env.PRIVATE_KEY
  if (!pk) {
    console.error('Set PRIVATE_KEY env var (with 0x prefix)')
    process.exit(1)
  }

  const account = privateKeyToAccount(pk as `0x${string}`)
  console.log('Deployer:', account.address)

  const walletClient = createWalletClient({
    account,
    chain: coston2,
    transport: http(),
  })

  const publicClient = createPublicClient({
    chain: coston2,
    transport: http(),
  })

  const abi = JSON.parse(readFileSync('artifacts/contracts_StFXRP_sol_StFXRP.abi', 'utf8'))
  const bytecode = ('0x' + readFileSync('artifacts/contracts_StFXRP_sol_StFXRP.bin', 'utf8')) as `0x${string}`

  for (const [name, tokenAddress] of Object.entries(TOKENS)) {
    console.log(`\nDeploying vault for ${name} (${tokenAddress})...`)

    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args: [tokenAddress],
    })

    console.log('Deploy tx:', hash)

    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log(`${name} vault deployed to:`, receipt.contractAddress)
  }
}

main().catch(console.error)
