export const CONTRACTS = {
  flare: {
    WFLR: '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d' as const,
    FXRP: '0x96B41289D90444B8adD57e6F265DB5aE8651c470' as const,
    StFXRP: '0x0000000000000000000000000000000000000000' as const, // not deployed on mainnet
    ContractRegistry: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019' as const,
    Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11' as const,
  },
  coston2: {
    WFLR: '0xC67DCE33e8b36abDD40FdBCA35F4e24CA3AEe78A' as const,
    FXRP: '0x0b6A3645c240605887a5532109323A3E12273dc7' as const,
    StFXRP: '0xd0934f2a08e4f41c9969bb11555653524a75952a' as const,
    ContractRegistry: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019' as const,
    Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11' as const,
  },
} as const

export type NetworkId = keyof typeof CONTRACTS
