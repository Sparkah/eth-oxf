import { createWalletClient, createPublicClient, http, defineChain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { readFileSync } from 'fs'

const coston2 = defineChain({
  id: 114,
  name: 'Coston2',
  nativeCurrency: { name: 'Coston2 Flare', symbol: 'C2FLR', decimals: 18 },
  rpcUrls: { default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] } },
})

const FXRP_ADDRESS = '0x0b6A3645c240605887a5532109323A3E12273dc7' as const

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

  // Read compiled artifacts
  const abi = JSON.parse(readFileSync('artifacts/contracts_StFXRP_sol_StFXRP.abi', 'utf8'))
  const bytecode = ('0x' + readFileSync('artifacts/contracts_StFXRP_sol_StFXRP.bin', 'utf8')) as `0x${string}`

  console.log('Deploying StFXRP vault...')
  console.log('Underlying asset (FTestXRP):', FXRP_ADDRESS)

  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [FXRP_ADDRESS],
  })

  console.log('Deploy tx:', hash)

  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log('StFXRP vault deployed to:', receipt.contractAddress)
  console.log('')
  console.log('Update src/config/contracts.ts with:', receipt.contractAddress)
}

main().catch(console.error)
