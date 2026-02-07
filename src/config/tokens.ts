export interface TokenMeta {
  symbol: string
  name: string
  decimals: number
  logo: string
  address: Record<string, `0x${string}` | 'native'>
  feedId: string // FTSOv2 feed category + hex
}

export const TOKENS: TokenMeta[] = [
  {
    symbol: 'FLR',
    name: 'Flare',
    decimals: 18,
    logo: '/tokens/flr.svg',
    address: { flare: 'native', coston2: 'native' },
    feedId: '01464c522f55534400000000000000000000000000', // FLR/USD
  },
  {
    symbol: 'WFLR',
    name: 'Wrapped Flare',
    decimals: 18,
    logo: '/tokens/flr.svg',
    address: {
      flare: '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d',
      coston2: '0xC67DCE33e8b36abDD40FdBCA35F4e24CA3AEe78A',
    },
    feedId: '01464c522f55534400000000000000000000000000',
  },
  {
    symbol: 'FTestXRP',
    name: 'FXRP',
    decimals: 6,
    logo: '/tokens/xrp.svg',
    address: {
      flare: '0x96B41289D90444B8adD57e6F265DB5aE8651c470', // mainnet FXRP
      coston2: '0x0b6A3645c240605887a5532109323A3E12273dc7',
    },
    feedId: '015852502f55534400000000000000000000000000', // XRP/USD
  },
  {
    symbol: 'USDT0',
    name: 'USDT0',
    decimals: 6,
    logo: '/tokens/usdt.svg',
    address: {
      flare: '0x0000000000000000000000000000000000000000', // TBD mainnet
      coston2: '0xC1A5B41512496B80903D1f32d6dEa3a73212E71F',
    },
    feedId: '01555344542f555344000000000000000000000000', // USDT/USD
  },
]

export const FEED_IDS = {
  'FLR/USD': '0x01464c522f55534400000000000000000000000000' as const,
  'XRP/USD': '0x015852502f55534400000000000000000000000000' as const,
  'BTC/USD': '0x014254432f55534400000000000000000000000000' as const,
  'ETH/USD': '0x014554482f55534400000000000000000000000000' as const,
}
