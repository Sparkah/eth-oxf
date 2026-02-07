# FlareVault

A portfolio dashboard and DeFi toolkit for the Flare ecosystem. Track token balances with live USD prices from **FTSOv2**, stake FTestXRP into an **ERC-4626 vault** on Coston2, and explore yield opportunities — all from a single UI.

Built for **ETH Oxford 2026** (Flare track).

## Features

- **Portfolio Dashboard** — Enter any wallet address (or connect via RainbowKit) to view FLR, WFLR, FTestXRP, USDT0, and stFXRP balances with live USD valuations from FTSOv2 price feeds.
- **Multi-Wallet Tracking** — Track multiple wallet addresses simultaneously; balances aggregate across all wallets. Addresses persist in localStorage.
- **FXRP Staking (ERC-4626 Vault)** — Deposit FTestXRP into the StFXRP vault to receive stFXRP receipt tokens. The vault follows the ERC-4626 tokenized vault standard with a proper approve → deposit flow.
- **Live FTSO Prices** — Prices are resolved on-chain: ContractRegistry → FtsoV2 → `getFeedsByIdInWei()` for FLR/USD and XRP/USD feeds.
- **Yield Comparison** — Compare yield opportunities across Firelight staking, FTSO delegation, FlareDrops, and earnFXRP.
- **Network Toggle** — Seamlessly switch between Flare mainnet and Coston2 testnet via the RainbowKit chain selector.

## Flare Enshrined Protocols Used

| Protocol | Usage |
|----------|-------|
| **FTSOv2** | Live price feeds for FLR/USD and XRP/USD via `getFeedsByIdInWei()`, resolved through ContractRegistry |
| **FAssets** | FTestXRP (FXRP) token integration — the asset deposited into our staking vault |

## Deployed Contracts

| Contract | Network | Address |
|----------|---------|---------|
| StFXRP Vault (ERC-4626) | Coston2 | `0xd0934f2a08e4f41c9969bb11555653524a75952a` |

The vault accepts FTestXRP (`0x0b6A3645c240605887a5532109323A3E12273dc7`) and mints stFXRP shares proportional to the depositor's share of total vault assets.

## Tech Stack

- **Next.js 16** (App Router)
- **Wagmi v3 + viem** for wallet connection and contract reads/writes
- **RainbowKit** for wallet UI
- **shadcn/ui + Tailwind CSS v4** for components
- **Solidity 0.8.28** (ERC-4626 vault, compiled with solcjs)

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect a wallet on Coston2 testnet.

To get testnet tokens: [Flare Faucet](https://faucet.flare.network/) (request C2FLR, FTestXRP, USDT0).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Portfolio view
│   ├── stake/              # FXRP → stFXRP staking
│   ├── yield/              # Yield comparison
│   └── bridge/             # XRP → FXRP bridge (WIP)
├── components/             # React components
│   ├── layout/             # Header, sidebar
│   ├── portfolio/          # Balance table, charts, address input
│   ├── stake/              # Stake form, stats
│   └── ui/                 # shadcn primitives
├── config/                 # Chain definitions, contract addresses, tokens
├── hooks/                  # Custom hooks for on-chain data
│   ├── use-token-balances  # Multicall3 batched balance reads
│   ├── use-ftso-prices     # FTSOv2 price feed reads
│   ├── use-firelight       # ERC-4626 vault interactions
│   └── use-yield-data      # Yield opportunity aggregation
├── lib/abi/                # Contract ABIs
└── providers/              # Wagmi, RainbowKit, network context
contracts/
└── StFXRP.sol              # ERC-4626 staking vault (deployed to Coston2)
```

## Feedback on Building on Flare

### What worked well

- **ContractRegistry pattern** — Having a single on-chain registry (`0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019`, same address on all networks) that resolves protocol contract addresses is excellent. It means our code doesn't hardcode FTSOv2 addresses and automatically adapts if the implementation is upgraded.
- **FTSOv2 price feeds** — `getFeedsByIdInWei()` is a clean API. Getting prices normalized to 18-decimal wei precision removes the need to handle varying decimals per feed. The feed ID scheme (category byte + ticker) is intuitive.
- **EVM compatibility** — Standard ERC-20 and ERC-4626 patterns work out of the box. We deployed a vanilla Solidity vault with no Flare-specific modifications and it worked immediately on Coston2.
- **Coston2 testnet** — Fast block times (~1.8s), free faucet tokens, same ContractRegistry address as mainnet — testnet experience was smooth.
- **RPC reliability** — `https://coston2-api.flare.network/ext/C/rpc` was stable throughout the hackathon with no rate limiting issues.

### Areas for improvement

- **FAssets documentation** — The FAssets minting flow (collateral reservation → XRPL payment → FDC verification → mint) is complex and the developer documentation could use more end-to-end code examples. The beta ending on Songbird during the hackathon added confusion.
- **Tooling compatibility** — Hardhat v3 had compatibility issues with some Flare tooling. We ultimately used solcjs + viem directly for compilation and deployment, which worked well but isn't the standard developer path.
- **Token discovery** — Finding the correct Coston2 token addresses (FTestXRP, USDT0) required querying the block explorer API rather than having a clear canonical token list. A Flare token registry or well-documented testnet token list would help.
- **FTSOv2 payable functions** — The `payable` modifier on FTSOv2 read functions (for future fee structure) can confuse developers using wagmi's `useReadContract`, since it sends `eth_call` without value. Documentation clarifying this is free for static calls would help.

## License

MIT
