const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const web3 = require('../config/web3')

const graphUrl_ftm =
    'https://api.thegraph.com/subgraphs/name/sturdyfi/sturdy-fantom';
const graphUrl_eth =
    'https://api.thegraph.com/subgraphs/name/sturdyfi/sturdy-ethereum';

const graphQuery = gql`
    query get_tvl {
        reserves {
            name
            symbol
            decimals
            price {
                priceInEth
            }
            totalDeposits
            totalLiquidity
            availableLiquidity
            totalCurrentVariableDebt
        }
    }
`;

const priceInUSD = (value, decimals, price) => {
    return (value / Math.pow(10, decimals) * price / Math.pow(10, 8)).toFixed(2);
}

async function fetch(borrow, chain) {
    const graphUrl = chain == 'fantom' ? graphUrl_ftm : graphUrl_eth;
    const { reserves } = await request(graphUrl, graphQuery);
    let tvl = reserves.reduce((sum, reserve) => {
        const value = borrow ? reserve.totalCurrentVariableDebt : reserve.totalLiquidity;
        return sum + +priceInUSD(value, reserve.decimals, reserve.price.priceInEth);        
    }, 0);

    if (chain != 'ethereum')
        return toUSDTBalances(tvl);

    const ethPrice = await getEthPrice();
    tvl = tvl / Math.pow(10, 10) * ethPrice;
    return toUSDTBalances(tvl);
}

const borrowed = (chain) => async (_timestamp, _ethBlock, chainBlocks) => {
    return await fetch(true, chain);
}

const tvl = (chain) => async (_timestamp, _ethBlock, chainBlocks) => {
    return await fetch(false, chain);
}

module.exports = {
    fantom: {
        tvl: tvl('fantom'),
        borrowed: borrowed('fantom'),
    },
    ethereum: {
        tvl: tvl('ethereum'),
        borrowed: borrowed('ethereum'),
    },
};

const getEthPrice = async () => {
    const abi = [
        {
            "inputs": [
                {
                    "internalType": "contract ILendingPoolAddressesProvider",
                    "name": "provider",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "user",
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
                            "name": "stableBorrowRateEnabled",
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
                            "internalType": "uint128",
                            "name": "stableBorrowRate",
                            "type": "uint128"
                        },
                        {
                            "internalType": "uint40",
                            "name": "lastUpdateTimestamp",
                            "type": "uint40"
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
                            "internalType": "uint256",
                            "name": "availableLiquidity",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "totalPrincipalStableDebt",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "averageStableRate",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "stableDebtLastUpdateTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "totalScaledVariableDebt",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "priceInEth",
                            "type": "uint256"
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
                            "name": "stableRateSlope1",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "stableRateSlope2",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "capacity",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "aEmissionPerSecond",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "vEmissionPerSecond",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "sEmissionPerSecond",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "aIncentivesLastUpdateTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "vIncentivesLastUpdateTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "sIncentivesLastUpdateTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "aTokenIncentivesIndex",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "vTokenIncentivesIndex",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "sTokenIncentivesIndex",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct IUiPoolDataProvider.AggregatedReserveData[]",
                    "name": "",
                    "type": "tuple[]"
                },
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "underlyingAsset",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "scaledATokenBalance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bool",
                            "name": "usageAsCollateralEnabledOnUser",
                            "type": "bool"
                        },
                        {
                            "internalType": "uint256",
                            "name": "stableBorrowRate",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "scaledVariableDebt",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "principalStableDebt",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "stableBorrowLastUpdateTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "aTokenincentivesUserIndex",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "vTokenincentivesUserIndex",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "sTokenincentivesUserIndex",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct IUiPoolDataProvider.UserReserveData[]",
                    "name": "",
                    "type": "tuple[]"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "userUnclaimedRewards",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "emissionEndTimestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct IUiPoolDataProvider.IncentivesControllerData",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
    ];
    const contract = new web3.eth.Contract(abi, '0x51A43906AA02973D05C4c259AB46a58616085162');
    const results = await contract.methods.getReservesData('0xb7499a92fc36e9053a4324aFfae59d333635D9c3', '0x06A2EeD383cC6cb1C3778dbbB6Be9e407c81C426').call()
    return +results[2] / 10**8;
}