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
    symbol: 'FXRP',
    name: 'FAsset XRP',
    decimals: 18,
    logo: '/tokens/xrp.svg',
    address: {
      flare: '0x00000000000000000000000000000000000F0001',
      coston2: '0x00000000000000000000000000000000000F0001',
    },
    feedId: '015852502f55534400000000000000000000000000', // XRP/USD
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    decimals: 6,
    logo: '/tokens/xrp.svg',
    address: { flare: 'native', coston2: 'native' }, // not on Flare natively, used for price
    feedId: '015852502f55534400000000000000000000000000',
  },
]

export const FEED_IDS = {
  'FLR/USD': '0x01464c522f55534400000000000000000000000000' as const,
  'XRP/USD': '0x015852502f55534400000000000000000000000000' as const,
  'BTC/USD': '0x014254432f55534400000000000000000000000000' as const,
  'ETH/USD': '0x014554482f55534400000000000000000000000000' as const,
}
