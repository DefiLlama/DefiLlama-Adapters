const protocolDataProviderAbi = [
  {
    inputs: [],
    name: "getAllAggregatedReservesData",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "string",
                name: "internalSymbol",
                type: "string",
              },
              {
                internalType: "address",
                name: "internalAddress",
                type: "address",
              },
              {
                internalType: "string",
                name: "externalSymbol",
                type: "string",
              },
              {
                internalType: "address",
                name: "externalAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "aTokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "stableDebtTokenAddress",
                type: "address",
              },
              {
                internalType: "address",
                name: "variableDebtTokenAddress",
                type: "address",
              },
            ],
            internalType:
              "struct ShoebillProtocolDataProvider.TokenDataInternal",
            name: "token",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "ltv",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "liquidationThreshold",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "liquidationBonus",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "reserveFactor",
                type: "uint256",
              },
              {
                internalType: "bool",
                name: "usageAsCollateralEnabled",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "borrowingEnabled",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "stableBorrowRateEnabled",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isActive",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isFrozen",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "decimals",
                type: "uint256",
              },
            ],
            internalType: "struct ShoebillProtocolDataProvider.ReserveConfig",
            name: "configuration",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "availableLiquidity",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalStableDebt",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalVariableDebt",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "liquidityRate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "variableBorrowRate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "stableBorrowRate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "averageStableBorrowRate",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "liquidityIndex",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "variableBorrowIndex",
                type: "uint256",
              },
              {
                internalType: "uint40",
                name: "lastUpdateTimestamp",
                type: "uint40",
              },
              {
                internalType: "bool",
                name: "isCollateral",
                type: "bool",
              },
              {
                internalType: "address",
                name: "yieldAddress",
                type: "address",
              },
            ],
            internalType: "struct ShoebillProtocolDataProvider.ReserveOverview",
            name: "overview",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "oraclePrice",
            type: "uint256",
          },
        ],
        internalType:
          "struct ShoebillProtocolDataProvider.AggregatedReserveData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

module.exports = {
  protocolDataProviderAbi,
};
