# FlareVault

A DeFi toolkit and prediction market platform for the Flare ecosystem. FTSO-resolved prediction markets, ERC-4626-style staking vaults, FAssets bridge, live curated yield aggregation, and multi-wallet portfolio tracking — all in one UI.

Built for **ETH Oxford 2026** — submitting to **Flare Main Track** + **Prediction Markets & DeFi**.

> **Pitch Video:** [TODO — add link]
>
> **Live Demo:** Deployed on Coston2 testnet. Clone, `npm install --legacy-peer-deps`, `npm run dev`.

## What We Built

### FTSO-Resolved Prediction Markets (FlareBet)
Binary outcome prediction markets where users bet with native C2FLR on whether an asset will hit a target price by a deadline. Markets resolve **trustlessly on-chain** by reading Flare's FTSO price oracle — no centralized resolver needed.

- Create markets for any FTSO feed (FLR, XRP, BTC, ETH)
- Bet YES or NO with native C2FLR (no approve step needed)
- After deadline, anyone calls `resolve()` which reads `FtsoV2.getFeedByIdInWei()` via ContractRegistry
- Winners split the entire pot proportionally. No platform fee.
- Live probability estimates derived from current FTSO price vs target + time remaining

### ERC-4626-Style Staking Vaults
Deposit FTestXRP (FXRP) or USDT0 into tokenized vaults to receive yield-bearing receipt tokens (stFXRP, stUSDT0). Exchange rate increases as rewards accrue. Follows the ERC-4626 deposit/redeem pattern with share-based accounting.

### FAssets Bridge (XRP to Flare)
Real on-chain FAssets integration — discover available agents, reserve collateral via AssetManager, and receive XRPL payment instructions from the `CollateralReserved` event.

### Curated Yield Aggregation
Live yield data fetched from DeFiLlama for Flare ecosystem protocols: **Kinetic Finance**, **Spectra**, **Sceptre**, and **Clearpool**. Real APY, TVL, and risk classification alongside native FlareVault staking.

### Multi-Wallet Portfolio Dashboard
Track multiple wallet addresses with live FTSOv2 price valuations. Connected wallet shown with badge, balances aggregated across all tracked wallets.

## Flare Enshrined Protocols Used

| Protocol | Usage |
|----------|-------|
| **FTSOv2** | Price feeds for prediction market resolution (`getFeedByIdInWei`), dashboard valuations (`getFeedsByIdInWei`), and probability estimates. Resolved via ContractRegistry. |
| **FAssets** | Bridge integration — `reserveCollateral` on AssetManager, agent discovery, `CollateralReserved` event parsing for XRPL payment details. |
| **ContractRegistry** | Used on-chain by FlareBet contract to dynamically resolve FtsoV2 address. Same pattern used in frontend for price reads. |

## Deployed Contracts (Coston2)

| Contract | Address | Purpose |
|----------|---------|---------|
| **FlareBet** | [`0x0520e5acba367ea35c31325d63838ac4255cb5d8`](https://coston2-explorer.flare.network/address/0x0520e5acba367ea35c31325d63838ac4255cb5d8) | Prediction markets |
| StFXRP Vault | [`0xd0934f2a08e4f41c9969bb11555653524a75952a`](https://coston2-explorer.flare.network/address/0xd0934f2a08e4f41c9969bb11555653524a75952a) | FTestXRP (FXRP) vault |
| StUSDT0 Vault | [`0x698278d81dab910e6cb0e68f8b503ba3a3f08787`](https://coston2-explorer.flare.network/address/0x698278d81dab910e6cb0e68f8b503ba3a3f08787) | USDT0 vault |
| StWFLR Vault | [`0x1adfedc11c41624b4ad28c38ac3fa393f1b879c9`](https://coston2-explorer.flare.network/address/0x1adfedc11c41624b4ad28c38ac3fa393f1b879c9) | WFLR vault |

## Architecture

```
FlareBet.sol (on-chain, Coston2)
  ├── createMarket(feedId, targetPrice, deadline, question)
  ├── bet(marketId, isYes) payable     ← users send C2FLR
  ├── resolve(marketId)                ← reads FTSO via ContractRegistry
  └── claim(marketId)                  ← winners split pot

Frontend (Next.js)
  ├── /markets     ← Create/bet/resolve/claim prediction markets
  ├── /dashboard   ← Multi-wallet portfolio with FTSO prices
  ├── /yield       ← Live curated yield from DeFiLlama
  ├── /stake       ← ERC-4626 vault deposit/withdraw
  └── /bridge      ← FAssets XRP → FTestXRP
```

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **Wagmi v3 + viem** — wallet connection, contract reads/writes, multicall
- **RainbowKit** — wallet UI
- **shadcn/ui + Tailwind CSS v4** — components
- **Solidity 0.8.20** — FlareBet prediction market + ERC-4626-style vaults
- **DeFiLlama API** — live yield data for curated Flare protocols
- **sonner** — toast notifications for tx lifecycle

## Getting Started

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect a wallet on Coston2 testnet.

**Testnet tokens:** [Flare Faucet](https://faucet.flare.network/coston2) — request C2FLR, then use the app.

### Deploy FlareBet yourself

```bash
# Compile
npx solc --abi --bin contracts/FlareBet.sol -o artifacts/

# Deploy (set your private key)
PRIVATE_KEY=0x... npx tsx scripts/deploy-flarebet.ts
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Multi-wallet portfolio
│   ├── markets/            # Prediction markets (FlareBet)
│   ├── stake/              # ERC-4626 vault staking
│   ├── yield/              # Curated yield aggregation
│   └── bridge/             # FAssets XRP → FTestXRP
├── components/
│   ├── layout/             # Header, sidebar
│   ├── portfolio/          # Balance table, charts, wallet input
│   ├── stake/              # Stake form, stats
│   └── ui/                 # shadcn primitives
├── config/                 # Chains, contract addresses
├── hooks/
│   ├── use-prediction-market  # FlareBet reads/writes
│   ├── use-token-balances     # Multicall3 batched balance reads
│   ├── use-ftso-prices        # FTSOv2 price feed reads
│   ├── use-firelight          # ERC-4626 vault interactions
│   ├── use-fassets            # FAssets bridge
│   └── use-yield-data         # DeFiLlama yield aggregation
├── lib/abi/                # Contract ABIs
└── providers/              # Wagmi, RainbowKit, network context

contracts/
├── FlareBet.sol            # FTSO-resolved prediction markets
└── StFXRP.sol              # ERC-4626-style staking vault
```

## Feedback on Building on Flare

### What worked well

- **ContractRegistry pattern** — Having a single on-chain registry (`0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019`, same address on all networks) that resolves protocol addresses is excellent. Our FlareBet contract uses it on-chain to dynamically resolve the FtsoV2 address, meaning it automatically adapts if the implementation is upgraded. This is a great design pattern more chains should adopt.

- **FTSOv2 for prediction market resolution** — Using `getFeedByIdInWei()` on-chain to resolve prediction markets is clean and trustless. The 18-decimal wei precision meant no decimal conversion needed. The feed ID scheme (category byte + ASCII ticker + zero-padding) is straightforward once you understand the encoding.

- **EVM compatibility** — Standard Solidity patterns work out of the box. We deployed ERC-4626-style vaults and a custom prediction market contract with no Flare-specific modifications needed. The EVM execution environment is fully compatible.

- **Coston2 testnet** — Fast block times (~1.8s), reliable faucet, same ContractRegistry address as mainnet. Deployment and testing was smooth throughout the hackathon.

- **Ecosystem protocols on DeFiLlama** — Kinetic Finance, Spectra, Sceptre, and Clearpool are all indexed on DeFiLlama with Flare chain data. This let us build live yield aggregation with real TVL and APY data from the ecosystem.

### Areas for improvement

- **FAssets documentation** — The minting flow (collateral reservation → XRPL payment → FDC verification → mint) is complex. Finding the correct Coston2 AssetManager address required digging through GitHub repos. More end-to-end frontend examples for the `reserveCollateral` → `CollateralReserved` event flow would help.

- **Tooling** — Hardhat v3 had compatibility issues. We used solcjs/solc + viem directly for compilation and deployment, which worked but isn't the documented developer path.

- **Token discovery** — Finding correct Coston2 token addresses required block explorer queries. A canonical testnet token list or registry would save time.

- **FTSOv2 payable functions** — The `payable` modifier on read functions confused our wagmi integration initially. Clarifying in docs that static calls (eth_call) are free would help.

## License

MIT
