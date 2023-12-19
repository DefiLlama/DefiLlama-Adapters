const abi = {
    "inputs": [
        {
            "internalType": "contract IPoolAddressesProvider",
            "name": "provider",
            "type": "address"
        }
    ],
    "name": "getReservesData",
    "outputs": [
        {
            "components": [
                {
                    "internalType": "address",
                    "name": "underlyingAsset",
                    "type": "address"
                },
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "decimals",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "baseLTVasCollateral",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "reserveLiquidationThreshold",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "reserveLiquidationBonus",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "reserveFactor",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "usageAsCollateralEnabled",
                    "type": "bool"
                },
                {
                    "internalType": "bool",
                    "name": "borrowingEnabled",
                    "type": "bool"
                },
                {
                    "internalType": "bool",
                    "name": "isActive",
                    "type": "bool"
                },
                {
                    "internalType": "bool",
                    "name": "isFrozen",
                    "type": "bool"
                },
                {
                    "internalType": "bool",
                    "name": "isPaused",
                    "type": "bool"
                },
                {
                    "internalType": "uint128",
                    "name": "liquidityIndex",
                    "type": "uint128"
                },
                {
                    "internalType": "uint128",
                    "name": "variableBorrowIndex",
                    "type": "uint128"
                },
                {
                    "internalType": "uint128",
                    "name": "liquidityRate",
                    "type": "uint128"
                },
                {
                    "internalType": "uint128",
                    "name": "variableBorrowRate",
                    "type": "uint128"
                },
                {
                    "internalType": "uint40",
                    "name": "lastUpdateTimestamp",
                    "type": "uint40"
                },
                {
                    "internalType": "address",
                    "name": "yTokenAddress",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "variableDebtTokenAddress",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "interestRateStrategyAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "availableLiquidity",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "totalScaledVariableDebt",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "priceInMarketReferenceCurrency",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "priceOracle",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "variableRateSlope1",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "variableRateSlope2",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "baseVariableBorrowRate",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "optimalUsageRatio",
                    "type": "uint256"
                },
                {
                    "internalType": "uint128",
                    "name": "accruedToTreasury",
                    "type": "uint128"
                },
                {
                    "internalType": "bool",
                    "name": "flashLoanEnabled",
                    "type": "bool"
                },
                {
                    "internalType": "uint256",
                    "name": "borrowCap",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "supplyCap",
                    "type": "uint256"
                }
            ],
            "internalType": "struct IUIPoolDataProvider.AggregatedReserveData[]",
            "name": "reservesData",
            "type": "tuple[]"
        },
        {
            "components": [
                {
                    "internalType": "uint256",
                    "name": "marketReferenceCurrencyUnit",
                    "type": "uint256"
                },
                {
                    "internalType": "int256",
                    "name": "marketReferenceCurrencyPriceInUsd",
                    "type": "int256"
                },
                {
                    "internalType": "int256",
                    "name": "networkBaseTokenPriceInUsd",
                    "type": "int256"
                },
                {
                    "internalType": "uint8",
                    "name": "networkBaseTokenPriceDecimals",
                    "type": "uint8"
                }
            ],
            "internalType": "struct IUIPoolDataProvider.BaseCurrencyInfo",
            "name": "baseCurrencyInfo",
            "type": "tuple"
        }
    ],
    "stateMutability": "view",
    "type": "function"
};

module.exports = { abi };