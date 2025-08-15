const vaultAdapterAbi = {
  inputs: [{ internalType: 'address[]', name: 'bankrollIndexes', type: 'address[]' }],
  name: 'getAllDataBatch',
  outputs: [
    {
      components: [
        { internalType: 'uint256', name: 'vaultIndex', type: 'uint256' },
        { internalType: 'address', name: 'bankrollBytesIdentifier', type: 'address' },
        { internalType: 'address', name: 'vaultAddress', type: 'address' },
        { internalType: 'address', name: 'bankrollTokenAddress', type: 'address' },
        { internalType: 'address', name: 'shareTokenAddress', type: 'address' },
        { internalType: 'address', name: 'controllerAddress', type: 'address' },
        { internalType: 'address', name: 'liquidityManagerAddress', type: 'address' }
      ],
      internalType: 'struct IVaultAdapter.VaultDetails[]',
      name: 'vaultDetails_',
      type: 'tuple[]'
    },
    {
      components: [
        { internalType: 'uint256', name: 'bankrollAmount', type: 'uint256' },
        { internalType: 'uint256', name: 'shareTokenAmount', type: 'uint256' },
        { internalType: 'uint256', name: 'epochAmount', type: 'uint256' },
        { internalType: 'uint256', name: 'totalAmount', type: 'uint256' },
        { internalType: 'uint256', name: 'totalAmountExcluding', type: 'uint256' },
        { internalType: 'uint64', name: 'bankrollTokenPrice', type: 'uint64' },
        { internalType: 'bool', name: 'isProfitEpcoh', type: 'bool' },
        { internalType: 'bool', name: 'isProfitTotal', type: 'bool' },
        { internalType: 'bool', name: 'isProfitTotalExcluding', type: 'bool' }
      ],
      internalType: 'struct IVaultAdapter.VaultAmounts[]',
      name: 'vaultAmounts_',
      type: 'tuple[]'
    }
  ],
  stateMutability: 'view',
  type: 'function'
};

module.exports = {
  vaultAdapterAbi
}