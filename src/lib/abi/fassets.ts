export const assetManagerAbi = [
  // ── Reads ──────────────────────────────────────────────
  {
    type: 'function',
    name: 'lotSize',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'assetMintingGranularityUBA',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'collateralReservationFee',
    stateMutability: 'view',
    inputs: [{ name: '_lots', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getAvailableAgentsDetailedList',
    stateMutability: 'view',
    inputs: [
      { name: '_start', type: 'uint256' },
      { name: '_end', type: 'uint256' },
    ],
    outputs: [
      {
        name: '_agents',
        type: 'tuple[]',
        components: [
          { name: 'agentVault', type: 'address' },
          { name: 'ownerManagementAddress', type: 'address' },
          { name: 'feeBIPS', type: 'uint256' },
          { name: 'mintingVaultCollateralRatioBIPS', type: 'uint256' },
          { name: 'mintingPoolCollateralRatioBIPS', type: 'uint256' },
          { name: 'freeCollateralLots', type: 'uint256' },
          { name: 'status', type: 'uint8' },
        ],
      },
      { name: '_totalLength', type: 'uint256' },
    ],
  },
  // ── Writes ─────────────────────────────────────────────
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
    outputs: [{ name: '', type: 'uint256' }],
  },
  // ── Events ─────────────────────────────────────────────
  {
    type: 'event',
    name: 'CollateralReserved',
    inputs: [
      { name: 'agentVault', type: 'address', indexed: true },
      { name: 'minter', type: 'address', indexed: true },
      { name: 'collateralReservationId', type: 'uint256', indexed: true },
      { name: 'valueUBA', type: 'uint256', indexed: false },
      { name: 'feeUBA', type: 'uint256', indexed: false },
      { name: 'firstUnderlyingBlock', type: 'uint256', indexed: false },
      { name: 'lastUnderlyingBlock', type: 'uint256', indexed: false },
      { name: 'lastUnderlyingTimestamp', type: 'uint256', indexed: false },
      { name: 'paymentAddress', type: 'string', indexed: false },
      { name: 'paymentReference', type: 'bytes32', indexed: false },
      { name: 'executor', type: 'address', indexed: false },
      { name: 'executorFeeNatWei', type: 'uint256', indexed: false },
    ],
  },
] as const
