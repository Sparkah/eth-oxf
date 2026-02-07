export const assetManagerAbi = [
  {
    type: 'function',
    name: 'reserveCollateral',
    stateMutability: 'payable',
    inputs: [
      { name: '_agentVault', type: 'address' },
      { name: '_lots', type: 'uint256' },
      { name: '_maxMintingFeeBIPS', type: 'uint256' },
      { name: '_executorAddress', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getCollateralReservationFee',
    stateMutability: 'view',
    inputs: [{ name: '_lots', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getAgentInfo',
    stateMutability: 'view',
    inputs: [{ name: '_agentVault', type: 'address' }],
    outputs: [
      { name: 'status', type: 'uint8' },
      { name: 'ownerManagementAddress', type: 'address' },
      { name: 'mintingFeeBIPS', type: 'uint256' },
      { name: 'availableCollateralLots', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'lotSize',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const
