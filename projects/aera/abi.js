module.exports = {
    getReserveDataABI: {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            }
        ],
        "name": "getReserveData",
        "outputs": [
            {
                "components": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "data",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct DataTypes.ReserveConfigurationMap",
                        "name": "configuration",
                        "type": "tuple"
                    },
                    {
                        "internalType": "uint128",
                        "name": "liquidityIndex",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "currentLiquidityRate",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "variableBorrowIndex",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "currentVariableBorrowRate",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "currentStableBorrowRate",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint40",
                        "name": "lastUpdateTimestamp",
                        "type": "uint40"
                    },
                    {
                        "internalType": "uint16",
                        "name": "id",
                        "type": "uint16"
                    },
                    {
                        "internalType": "address",
                        "name": "aTokenAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "stableDebtTokenAddress",
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
                        "internalType": "uint128",
                        "name": "accruedToTreasury",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "unbacked",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "isolationModeTotalDebt",
                        "type": "uint128"
                    }
                ],
                "internalType": "struct DataTypes.ReserveData",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    assetsABI: {
        "inputs": [],
        "name": "assets",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "contract IERC20",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "heartbeat",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isERC4626",
                        "type": "bool"
                    },
                    {
                        "internalType": "contract AggregatorV2V3Interface",
                        "name": "oracle",
                        "type": "address"
                    }
                ],
                "internalType": "struct IAssetRegistry.AssetInformation[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },


    convertToAssetsABI: {
        "type": "function",
        "name": "convertToAssets",
        "inputs": [
            {
                "name": "shares",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "assets",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },

    getUserReserveDataABI: {
        "inputs": [
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserReserveData",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "currentATokenBalance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentStableDebt",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentVariableDebt",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "principalStableDebt",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "scaledVariableDebt",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "stableBorrowRate",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "liquidityRate",
                "type": "uint256"
            },
            {
                "internalType": "uint40",
                "name": "stableRateLastUpdated",
                "type": "uint40"
            },
            {
                "internalType": "bool",
                "name": "usageAsCollateralEnabled",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    getReservesListABI: {
        "inputs": [],
        "name": "getReservesList",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },

    getAssetInfoABI: {
        "inputs": [
            {
                "internalType": "uint8",
                "name": "i",
                "type": "uint8"
            }
        ],
        "name": "getAssetInfo",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint8",
                        "name": "offset",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "asset",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "priceFeed",
                        "type": "address"
                    },
                    {
                        "internalType": "uint64",
                        "name": "scale",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "borrowCollateralFactor",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "liquidateCollateralFactor",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "liquidationFactor",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint128",
                        "name": "supplyCap",
                        "type": "uint128"
                    }
                ],
                "internalType": "struct CometCore.AssetInfo",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },

    borrowBalanceOfABI: {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "borrowBalanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },

    getRewardOwedABI: {
        "inputs": [
            {
                "internalType": "address",
                "name": "comet",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "getRewardOwed",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "owed",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct CometRewards.RewardOwed",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    collateralBalanceOfABI: {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "asset",
                "type": "address"
            }
        ],
        "name": "collateralBalanceOf",
        "outputs": [
            {
                "internalType": "uint128",
                "name": "",
                "type": "uint128"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
}