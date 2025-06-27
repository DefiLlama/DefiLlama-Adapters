module.exports = {
  getAllMarketIds: {
    name: 'getAllMarketIds',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
    ],
  },
  totalAssets: {
    name: 'totalAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        name: 'marketsOraclePackages',
        type: 'tuple[]',
        components: [
          {
            name: 'marketId',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'packages',
            type: 'tuple[]',
            internalType: 'struct OraclePackage[]',
            components: [
              {
                name: 'marketId',
                type: 'bytes32',
                internalType: 'bytes32',
              },
              {
                name: 'timestamp',
                type: 'uint64',
                internalType: 'uint64',
              },
              {
                name: 'signature',
                type: 'bytes',
                internalType: 'bytes',
              },
              {
                name: 'indexValue',
                type: 'int256',
                internalType: 'int256',
              },
            ],
          },
        ],
        internalType: 'struct MarketOraclePackages[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
};