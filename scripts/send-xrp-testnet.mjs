#!/usr/bin/env node
/**
 * Send XRP on XRPL testnet to complete an FAssets collateral reservation.
 *
 * Usage:
 *   node scripts/send-xrp-testnet.mjs <destination> <drops> <paymentReference>
 *
 * Example:
 *   node scripts/send-xrp-testnet.mjs r4uKJRy9mjxGHw1yzS1SrtaKCUwT66MCcP 10025000 0x464250...
 *
 * The script will:
 * 1. Connect to XRPL testnet
 * 2. Fund a new wallet from the testnet faucet
 * 3. Send the exact amount with the payment reference as memo
 * 4. Print the result
 */

import { Client, Wallet } from 'xrpl'

const [destination, dropsStr, paymentRef] = process.argv.slice(2)

if (!destination || !dropsStr || !paymentRef) {
  console.error('Usage: node scripts/send-xrp-testnet.mjs <destination> <drops> <paymentReference>')
  console.error('')
  console.error('  destination      - Agent XRPL address (from bridge UI)')
  console.error('  drops            - Amount in drops (1 XRP = 1,000,000 drops)')
  console.error('  paymentReference - Hex string from CollateralReserved event')
  process.exit(1)
}

const drops = dropsStr.replace(/,/g, '')
const memoHex = paymentRef.startsWith('0x') ? paymentRef.slice(2) : paymentRef

async function main() {
  console.log('Connecting to XRPL testnet...')
  const client = new Client('wss://s.altnet.rippletest.net:51233')
  await client.connect()

  console.log('Funding new wallet from testnet faucet...')
  const { wallet } = await client.fundWallet()
  console.log(`Wallet address: ${wallet.address}`)
  console.log(`Wallet balance: ~1000 test XRP`)

  console.log('')
  console.log(`Sending ${Number(drops) / 1_000_000} XRP to ${destination}`)
  console.log(`Payment reference: ${paymentRef}`)
  console.log('')

  const tx = {
    TransactionType: 'Payment',
    Account: wallet.address,
    Destination: destination,
    Amount: drops,
    Memos: [
      {
        Memo: {
          MemoData: memoHex.toUpperCase(),
          MemoType: Buffer.from('text/plain').toString('hex').toUpperCase(),
        },
      },
    ],
  }

  console.log('Submitting transaction...')
  const result = await client.submitAndWait(tx, { wallet })

  const meta = result.result.meta
  const txResult = typeof meta === 'object' ? meta.TransactionResult : meta

  if (txResult === 'tesSUCCESS') {
    console.log('')
    console.log('=== SUCCESS ===')
    console.log(`TX hash: ${result.result.hash}`)
    console.log(`Explorer: https://testnet.xrpl.org/transactions/${result.result.hash}`)
    console.log('')
    console.log('Now wait ~5 minutes for FDC verification.')
    console.log('FTestXRP will mint to your Flare wallet automatically.')
  } else {
    console.error('')
    console.error(`=== FAILED: ${txResult} ===`)
    console.error(JSON.stringify(result.result, null, 2))
  }

  await client.disconnect()
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
