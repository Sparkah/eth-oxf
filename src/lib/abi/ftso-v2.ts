export const ftsoV2Abi = [
  {
    type: 'function',
    name: 'getFeedById',
    stateMutability: 'payable',
    inputs: [{ name: '_feedId', type: 'bytes21' }],
    outputs: [
      { name: '_value', type: 'uint256' },
      { name: '_decimals', type: 'int8' },
      { name: '_timestamp', type: 'uint64' },
    ],
  },
  {
    type: 'function',
    name: 'getFeedsById',
    stateMutability: 'payable',
    inputs: [{ name: '_feedIds', type: 'bytes21[]' }],
    outputs: [
      { name: '_values', type: 'uint256[]' },
      { name: '_decimals', type: 'int8[]' },
      { name: '_timestamp', type: 'uint64' },
    ],
  },
  {
    type: 'function',
    name: 'getFeedByIdInWei',
    stateMutability: 'payable',
    inputs: [{ name: '_feedId', type: 'bytes21' }],
    outputs: [
      { name: '_value', type: 'uint256' },
      { name: '_timestamp', type: 'uint64' },
    ],
  },
  {
    type: 'function',
    name: 'getFeedsByIdInWei',
    stateMutability: 'payable',
    inputs: [{ name: '_feedIds', type: 'bytes21[]' }],
    outputs: [
      { name: '_values', type: 'uint256[]' },
      { name: '_timestamp', type: 'uint64' },
    ],
  },
] as const
