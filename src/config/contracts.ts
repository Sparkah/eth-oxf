export const CONTRACTS = {
  flare: {
    WFLR: '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d' as const,
    FXRP: '0x00000000000000000000000000000000000F0001' as const, // placeholder - real address TBD
    stXRP: '0x00000000000000000000000000000000000F0002' as const, // placeholder
    ContractRegistry: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019' as const,
    Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11' as const,
    FtsoV2: '0x' as const, // resolved via ContractRegistry at runtime
  },
  coston2: {
    WFLR: '0xC67DCE33e8b36abDD40FdBCA35F4e24CA3AEe78A' as const,
    FXRP: '0x00000000000000000000000000000000000F0001' as const,
    stXRP: '0x00000000000000000000000000000000000F0002' as const,
    ContractRegistry: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019' as const,
    Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11' as const,
    FtsoV2: '0x' as const,
  },
} as const

export type NetworkId = keyof typeof CONTRACTS
