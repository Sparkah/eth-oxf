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
  USDT0: 1.0,
}

export const DEMO_YIELDS = [
  {
    protocol: 'Firelight',
    asset: 'FXRP',
    apy: 8.5,
    tvl: 2_400_000,
    risk: 'Medium' as const,
    description: 'Stake FXRP to earn stXRP with auto-compounding yield from FTSO delegation rewards.',
    lockPeriod: 'None',
  },
  {
    protocol: 'FTSO Delegation',
    asset: 'WFLR',
    apy: 5.2,
    tvl: 18_000_000,
    risk: 'Low' as const,
    description: 'Delegate WFLR to FTSO data providers and earn inflation rewards every reward epoch.',
    lockPeriod: 'None',
  },
  {
    protocol: 'FlareDrops',
    asset: 'WFLR',
    apy: 3.8,
    tvl: 45_000_000,
    risk: 'Low' as const,
    description: 'Wrap FLR and hold to receive monthly FlareDrop distributions over 36 months.',
    lockPeriod: 'None',
  },
  {
    protocol: 'earnFXRP',
    asset: 'FXRP',
    apy: 6.1,
    tvl: 800_000,
    risk: 'Medium' as const,
    description: 'Provide FXRP liquidity to earn trading fees and FAsset minting rewards.',
    lockPeriod: '7 days',
  },
]
