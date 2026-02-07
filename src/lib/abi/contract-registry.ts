export const contractRegistryAbi = [
  {
    type: 'function',
    name: 'getContractAddressByName',
    stateMutability: 'view',
    inputs: [{ name: '_name', type: 'string' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const
