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
  stWFLR: 0.026,
}

export const DEMO_YIELDS = [
  {
    protocol: 'FlareVault',
    asset: 'FXRP',
    apy: 8.5,
    tvl: 0,
    risk: 'Medium' as const,
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
    protocol: 'FlareVault',
    asset: 'WFLR',
    apy: 6.1,
    tvl: 0,
    risk: 'Low' as const,
    description: 'Stake WFLR into the stWFLR vault. Earn yield from FTSO delegation and FlareDrop distributions.',
    lockPeriod: 'None',
    vaultId: 'StWFLR' as const,
  },
]
