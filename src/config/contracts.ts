export const CONTRACTS = {
  flare: {
    WFLR: '0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d' as const,
    FXRP: '0x96B41289D90444B8adD57e6F265DB5aE8651c470' as const,
    USDT0: '0x0000000000000000000000000000000000000000' as const,
    StFXRP: '0x0000000000000000000000000000000000000000' as const,
    StUSDT0: '0x0000000000000000000000000000000000000000' as const,
    StWFLR: '0x0000000000000000000000000000000000000000' as const,
    AssetManager_FTestXRP: '0x0000000000000000000000000000000000000000' as const,
    ContractRegistry: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019' as const,
    Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11' as const,
    FlareBet: '0x0000000000000000000000000000000000000000' as const,
  },
  coston2: {
    WFLR: '0xC67DCE33e8b36abDD40FdBCA35F4e24CA3AEe78A' as const,
    FXRP: '0x0b6A3645c240605887a5532109323A3E12273dc7' as const,
    USDT0: '0xC1A5B41512496B80903D1f32d6dEa3a73212E71F' as const,
    StFXRP: '0xd0934f2a08e4f41c9969bb11555653524a75952a' as const,
    StUSDT0: '0x698278d81dab910e6cb0e68f8b503ba3a3f08787' as const,
    StWFLR: '0x1adfedc11c41624b4ad28c38ac3fa393f1b879c9' as const,
    AssetManager_FTestXRP: '0xc1Ca88b937d0b528842F95d5731ffB586f4fbDFA' as const,
    ContractRegistry: '0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019' as const,
    Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11' as const,
    FlareBet: '0x0520e5acba367ea35c31325d63838ac4255cb5d8' as const,
  },
} as const

export type NetworkId = keyof typeof CONTRACTS

/** Vault configs: maps vault key → underlying token key + display info */
export const VAULTS = {
  StFXRP: { asset: 'FXRP', symbol: 'stFXRP', name: 'Staked FTestXRP (FXRP)', decimals: 6, apy: 8.5 },
  StUSDT0: { asset: 'USDT0', symbol: 'stUSDT0', name: 'Staked USDT0', decimals: 6, apy: 5.2 },
} as const

export type VaultId = keyof typeof VAULTS
