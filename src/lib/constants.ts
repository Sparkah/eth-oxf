// FTSOv2 Feed IDs (category 1 = crypto, padded to 21 bytes)
export const FEED_IDS = {
  'FLR/USD': '0x01464c522f55534400000000000000000000000000',
  'XRP/USD': '0x015852502f55534400000000000000000000000000',
  'BTC/USD': '0x014254432f55534400000000000000000000000000',
  'ETH/USD': '0x014554482f55534400000000000000000000000000',
} as const

// Polling intervals (ms)
export const BALANCE_POLL_INTERVAL = 30_000
export const PRICE_POLL_INTERVAL = 10_000

// Demo / fallback data for when chain reads fail
export const DEMO_PRICES: Record<string, number> = {
  FLR: 0.025,
  C2FLR: 0.025,
  WFLR: 0.025,
  XRP: 0.55,
  FXRP: 0.55,
  FTestXRP: 0.55,
  stXRP: 0.58,
  stFXRP: 0.58,
  USDT0: 1.0,
  stUSDT0: 1.05,
}

export const DEMO_YIELDS = [
  {
    protocol: 'FlareVault',
    asset: 'FXRP',
    apy: 8.5,
    tvl: 0,
    risk: 'Low' as const,
    description: 'Stake FTestXRP into the ERC-4626 stFXRP vault. Yield accrues from FTSO delegation rewards.',
    lockPeriod: 'None',
    vaultId: 'StFXRP' as const,
  },
  {
    protocol: 'FlareVault',
    asset: 'USDT0',
    apy: 5.2,
    tvl: 0,
    risk: 'Low' as const,
    description: 'Stake USDT0 into the stUSDT0 vault. Earn yield on your stablecoins through Flare DeFi.',
    lockPeriod: 'None',
    vaultId: 'StUSDT0' as const,
  },
  {
    protocol: 'Mystic Finance',
    asset: 'WFLR',
    apy: 12.4,
    tvl: 2_800_000,
    risk: 'Medium' as const,
    description: 'Provide liquidity on Mystic Finance DEX. Earn swap fees + FLR incentives from concentrated liquidity pools.',
    lockPeriod: 'None',
    curator: 'Mystic Finance' as const,
    url: 'https://mystic.finance',
  },
  {
    protocol: 'Mystic Finance',
    asset: 'USDT0/WFLR',
    apy: 18.7,
    tvl: 1_500_000,
    risk: 'Medium' as const,
    description: 'USDT0/WFLR LP on Mystic Finance. High yield from trading volume and FLR emission rewards.',
    lockPeriod: 'None',
    curator: 'Mystic Finance' as const,
    url: 'https://mystic.finance',
  },
  {
    protocol: 'Kinetic Finance',
    asset: 'WFLR',
    apy: 6.8,
    tvl: 5_200_000,
    risk: 'Low' as const,
    description: 'Lend WFLR on Kinetic Finance money market. Earn variable interest from borrowers with over-collateralized positions.',
    lockPeriod: 'None',
    curator: 'Kinetic Finance' as const,
    url: 'https://kinetic.market',
  },
  {
    protocol: 'Kinetic Finance',
    asset: 'USDT0',
    apy: 9.3,
    tvl: 3_100_000,
    risk: 'Low' as const,
    description: 'Supply USDT0 to Kinetic lending pools. Stable yield from borrowing demand across the Flare ecosystem.',
    lockPeriod: 'None',
    curator: 'Kinetic Finance' as const,
    url: 'https://kinetic.market',
  },
  {
    protocol: 'ClearStar',
    asset: 'FLR',
    apy: 15.2,
    tvl: 980_000,
    risk: 'Medium' as const,
    description: 'ClearStar curated vault strategy. Auto-compounds FTSO delegation rewards + DeFi yield across Flare protocols.',
    lockPeriod: '7 days',
    curator: 'ClearStar' as const,
    url: 'https://clearstar.finance',
  },
  {
    protocol: 'ClearStar',
    asset: 'XRP/FLR',
    apy: 22.1,
    tvl: 640_000,
    risk: 'High' as const,
    description: 'ClearStar leveraged LP strategy on XRP/FLR pair. Higher risk, higher reward via automated rebalancing.',
    lockPeriod: '14 days',
    curator: 'ClearStar' as const,
    url: 'https://clearstar.finance',
  },
]
