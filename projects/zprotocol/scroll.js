const sdk = require('@defillama/sdk');
const abi = require('./abi/farmmaster.json')
const uniswapAbi = require('../helper/abis/uniswap')
const { unwrapUniswapLPs, isLP } = require('../helper/unwrapLPs')
const token0Abi = 'address:token0'
const token1Abi = 'address:token1'
const getReservesAbi = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform, } = require('../helper/portedTokens');
const {getSymbolsAndBalances} = require("../helper/masterchef");

async function getFarmingPoolInfo(farmMaster, block, chain, poolInfoAbi = abi.poolInfo) {
    const poolLength = (
        await sdk.api.abi.call({
            abi: abi.poolsLength,
            target: farmMaster,
            block,
            chain,
        })
    ).output;

    return (
      await sdk.api.abi.multiCall({
          block,
          calls: Array.from(Array(Number(poolLength)).keys()).map(i => ({
              target: farmMaster,
              params: i,
          })),
          abi: poolInfoAbi,
          chain,
      })
    ).output
}

async function getAllUniV2PairAddresses(factory, block, chain) {
    const poolLength = (
      await sdk.api.abi.call({
          abi: uniswapAbi.allPairsLength,
          target: factory,
          block,
          chain,
      })
    ).output;

    return (
      await sdk.api.abi.multiCall({
          block,
          calls: Array.from(Array(Number(poolLength)).keys()).map(i => ({
              target: factory,
              params: i,
          })),
          abi: uniswapAbi.allPairs,
          chain,
      })
    ).output.map(e => e.output.toLowerCase())
}

function zProtocolScrollFarmingExports(farmMaster, factory, chain, stakingTokenRaw, tokenIsOnCoingecko = true, poolInfoAbi = abi.poolInfo) {
    const stakingToken = stakingTokenRaw.toLowerCase();
    let balanceResolve;

    async function getTvl(timestamp, ethBlock, {[chain]: block}) {
        // This will be used to ignore dex LP tokens that has already been counted as TVL
        const pairAddresses = await getAllUniV2PairAddresses(factory, block, chain);
        const transformAddress = await getChainTransform(chain);

        const poolInfo = await getFarmingPoolInfo(farmMaster, block, chain, poolInfoAbi)
        const [symbols, tokenBalances] = await getSymbolsAndBalances(farmMaster, block, chain, poolInfo);

        const balances = {
            staking: {},
            pool2: {},
            tvl: {}
        }

        const lpPositions = [];

        await Promise.all(symbols.output.map(async (symbol, idx) => {
            const balance = tokenBalances.output[idx].output;
            const token = symbol.input.target.toLowerCase();
            if (token === stakingToken) {
                sdk.util.sumSingleBalance(balances.staking, transformAddress(token), balance)
            } else if (isLP(symbol.output, symbol.input.target, chain)) {
                lpPositions.push({
                    balance,
                    token
                });
            } else {
                sdk.util.sumSingleBalance(balances.tvl, transformAddress(token), balance)
            }
        }));

        const [token0, token1] = await Promise.all([
            sdk.api.abi.multiCall({
                calls: lpPositions.map(p => ({
                    target: p.token
                })),
                abi: token0Abi,
                block,
                chain
            }),
            sdk.api.abi.multiCall({
                calls: lpPositions.map(p => ({
                    target: p.token
                })),
                abi: token1Abi,
                block,
                chain
            }),
        ]);

        const pool2LpPositions = []
        const outsideLpPositions = []
        lpPositions.forEach((position, idx) => {
            if (token0.output[idx].output.toLowerCase() === stakingToken || token1.output[idx].output.toLowerCase() === stakingToken) {
                pool2LpPositions.push(position);
            } else {
                outsideLpPositions.push(position);
            }
        })
        await Promise.all([unwrapUniswapLPs(
            balances.tvl,
            // Filtering out tvl included in dex liquidity
            outsideLpPositions.filter(pool => !pairAddresses.includes(pool.token)),
            block,
            chain,
            transformAddress
        ), unwrapUniswapLPs(
            balances.pool2,
            // Filtering out tvl included in dex liquidity
            pool2LpPositions.filter(pool => !pairAddresses.includes(pool.token)),
            block,
            chain,
            transformAddress
        )]);

        if (!tokenIsOnCoingecko && pool2LpPositions.length) {
            const response = (await sdk.api.abi.multiCall({
                calls: pool2LpPositions.map(p => ({
                    target: stakingToken,
                    params: [p.token]
                })),
                abi: "erc20:balanceOf",
                block,
                chain
            })).output
            const maxPool2ByToken = response.reduce((max, curr) => {
                if (BigNumber(curr.output).gt(max.output)) {
                    return curr
                }
                return max
            });
            const poolAddress = maxPool2ByToken.input.params[0].toLowerCase()
            const poolReserves = await sdk.api.abi.call({
                block,
                chain,
                abi: getReservesAbi,
                target: poolAddress
            })
            const posToken0 = token0.output.find(t => t.input.target.toLowerCase() === poolAddress).output;
            const posToken1 = token1.output.find(t => t.input.target.toLowerCase() === poolAddress).output;
            let price, otherToken;
            if (posToken0.toLowerCase() === stakingToken) {
                price = poolReserves.output[1] / poolReserves.output[0]
                otherToken = transformAddress(posToken1)
            } else {
                price = poolReserves.output[0] / poolReserves.output[1]
                otherToken = transformAddress(posToken0)
            }
            const transformedStakingToken = transformAddress(stakingToken)
            Object.values(balances).forEach(balance => {
                Object.entries(balance).forEach(([addr, bal]) => {
                    if (addr.toLowerCase() === transformedStakingToken) {
                        balance[otherToken] = BigNumber(bal).times(price).toFixed(0)
                        delete balance[addr]
                    }
                })
            })
        }

        return balances
    }

    function getTvlPromise(key) {
        return async (ts, _block, chainBlocks) => {
            if (!balanceResolve)
                balanceResolve = getTvl(ts, _block, chainBlocks)
            return (await balanceResolve)[key]
        }
    }

    return {
        methodology: "TVL includes all farms in Z Protocol FarmMaster contract, filtering out farms featuring LP tokens from Z Protocol's DEX, to not double-count",
        [chain]: {
            staking: getTvlPromise("staking"),
            pool2: getTvlPromise("pool2"),
            tvl: getTvlPromise("tvl"),
        }
    };
}


module.exports = {
    zProtocolScrollFarmingExports,
}
