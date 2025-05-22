module.exports = {
  getMarketIds: {
    name: 'getMarketIds',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        internalType: 'uint256',
        name: 'offset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'limit',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        internalType: 'MarketId[]',
        name: 'result',
        type: 'bytes32[]',
      },
    ],
  },
  getMarketRelatedContractAddress: {
    name: 'getMarketRelatedContractAddress',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        internalType: 'MarketId',
        name: 'marketId',
        type: 'bytes32',
      },
      {
        internalType: 'enum IContractProvider.MarketRelatedContracts',
        name: 'contractType',
        type: 'uint8',
      },
    ],
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
  },
};