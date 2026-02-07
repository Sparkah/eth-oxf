import { createWalletClient, createPublicClient, http, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { readFileSync } from 'fs'

const coston2 = defineChain({
  id: 114,
  name: 'Coston2',
  nativeCurrency: { name: 'Coston2 Flare', symbol: 'C2FLR', decimals: 18 },
  rpcUrls: { default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] } },
})

const CONTRACT_REGISTRY = '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019' as const

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

  const abi = JSON.parse(readFileSync('artifacts/contracts_FlareBet_sol_FlareBet.abi', 'utf8'))
  const bytecode = ('0x' + readFileSync('artifacts/contracts_FlareBet_sol_FlareBet.bin', 'utf8')) as `0x${string}`

  console.log('\nDeploying FlareBet...')
  console.log('ContractRegistry:', CONTRACT_REGISTRY)

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [CONTRACT_REGISTRY],
  })

  console.log('Deploy tx:', hash)

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('FlareBet deployed to:', receipt.contractAddress)
  console.log('\nUpdate src/config/contracts.ts with this address!')
}

main().catch(console.error)
