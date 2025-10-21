const sdk = require('@defillama/sdk');
const abi = require('./abis/masterchef.json')
const { unwrapUniswapLPs, unwrapLPsAuto, isLP } = require('./unwrapLPs')
const tokenAbi = 'address:token'
const token0Abi = 'address:token0'
const token1Abi = 'address:token1'
const getReservesAbi = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
const userInfoAbi = 'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)'
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform, } = require('../helper/portedTokens');

async function getPoolInfo(masterChef, block, chain, poolInfoAbi = abi.poolInfo) {
    const poolLength = (
        await sdk.api.abi.call({
            abi: abi.poolLength,
            target: masterChef,
            block,
            chain,
        })
    ).output;

    const poolInfo = (
        await sdk.api.abi.multiCall({
            block,
            calls: Array.from(Array(Number(poolLength)).keys()).map(i => ({
                target: masterChef,
                params: i,
            })),
            abi: poolInfoAbi,
            chain,
        })
    ).output;

    return poolInfo
}

async function getSymbolsAndBalances(masterChef, block, chain, poolInfo) {
    const [symbols, tokenBalances] = await Promise.all([
        sdk.api.abi.multiCall({
            block,
            calls: poolInfo.map(p => ({
                target: p.output[0]
            })),
            abi: 'erc20:symbol',
            chain,
            permitFailure: true,
        }),
        sdk.api.abi.multiCall({
            block,
            calls: poolInfo.map(p => ({
                target: p.output[0],
                params: masterChef
            })),
            abi: 'erc20:balanceOf',
            chain,
            permitFailure: true,
        })
    ])
    return [symbols, tokenBalances]
}

function isYV(symbol) {
    return symbol.includes('yv')
}

async function addFundsInMasterChef(balances, masterChef, block, chain = 'ethereum', transformAddress = undefined, poolInfoAbi = abi.poolInfo, ignoreAddresses = [], includeLPs = true, excludePool2 = false, stakingToken = undefined) {
    const poolInfo = await getPoolInfo(masterChef, block, chain, poolInfoAbi)
    if (!transformAddress) transformAddress = getChainTransform(chain)
    const [symbols, tokenBalances] = await getSymbolsAndBalances(masterChef, block, chain, poolInfo);

    const lpPositions = [];
    const lpTokens = [];

    symbols.output.forEach((symbol, idx) => {
        const balance = tokenBalances.output[idx].output;
        const token = symbol.input.target;
        if (ignoreAddresses.some(addr => addr.toLowerCase() === token.toLowerCase()) || symbol.output === null) {
            return
        }
        if (isLP(symbol.output, symbol.input.target, chain)) {
            if (includeLPs && balance && !excludePool2) {
                lpPositions.push({
                    balance,
                    token
                });
            }
            else if (includeLPs && balance && excludePool2) {
                lpTokens.push(token);
            }
        } else {
            sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
        }
    })

    if (excludePool2) {
        const [token0, token1, balance] = await Promise.all([
            sdk.api.abi.multiCall({
                calls: lpTokens.map(p => ({
                    target: p
                })),
                abi: token0Abi,
                block,
                chain
            }),
            sdk.api.abi.multiCall({
                calls: lpTokens.map(p => ({
                    target: p
                })),
                abi: token1Abi,
                block,
                chain
            }),
            sdk.api.abi.multiCall({
                calls: lpTokens.map(p => ({
                    target: p,
                    params: masterChef
                })),
                abi: "erc20:balanceOf",
                block,
                chain
            })
        ]);

        [token0, token1, balance].forEach((_, idx) => {
            if (lpTokens[idx] === undefined || token0.output[idx].output.toLowerCase() === stakingToken.toLowerCase() || token1.output[idx].output.toLowerCase() === stakingToken.toLowerCase()) {
                return
            }
            lpPositions.push({
                balance: balance.output[idx].output,
                token: balance.output[idx].input.target
            });
        });
    }


    await unwrapUniswapLPs(
        balances,
        lpPositions,
        block,
        chain,
        transformAddress
    );
}

function masterChefExports(masterChef, chain, stakingTokenRaw, tokenIsOnCoingecko = true, poolInfoAbi = abi.poolInfo, includeYVTokens = false) {
    const stakingToken = stakingTokenRaw.toLowerCase();
    let balanceResolve;

    async function getTvl(timestamp, ethBlock, {[chain]: block}) {
        const transformAddress = getChainTransform(chain);

        const poolInfo = await getPoolInfo(masterChef, block, chain, poolInfoAbi)
        const [symbols, tokenBalances] = await getSymbolsAndBalances(masterChef, block, chain, poolInfo);

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
            } else if (includeYVTokens && isYV(symbol.output)) {
                let underlyingToken = (await sdk.api.abi.call({
                    target: token,
                    abi: tokenAbi,
                    block,
                    chain,
                })).output;
                sdk.util.sumSingleBalance(balances.tvl, transformAddress(underlyingToken), balance)
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
            outsideLpPositions,
            block,
            chain,
            transformAddress
        ), unwrapUniswapLPs(
            balances.pool2,
            pool2LpPositions,
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
        methodology: "TVL includes all farms in MasterChef contract",
        [chain]: {
            staking: getTvlPromise("staking"),
            pool2: getTvlPromise("pool2"),
            // masterchef: getTvlPromise("tvl"),
            tvl: getTvlPromise("tvl"),
        }
    };
}

const standardPoolInfoAbi = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)'

async function getUserMasterChefBalances({ balances = {}, masterChefAddress, userAddres, block, chain = 'ethereum', transformAddress, excludePool2 = false, onlyPool2 = false, pool2Tokens= [], poolInfoABI = abi.poolInfo, getLPAddress = null }) {
    if (!transformAddress)
        transformAddress = getChainTransform(chain)

    const tempBalances = {}
    const poolLength = (await sdk.api.abi.call({ abi: abi.poolLength, target: masterChefAddress, block, chain, })).output
    const dummyArray = Array.from(Array(Number(poolLength)).keys())
    const poolInfoCalls = dummyArray.map(i => ({ target: masterChefAddress, params: i, }))
    const userInfoCalls = dummyArray.map(i => ({ target: masterChefAddress, params: [i, userAddres], }))
    const lpTokens = (await sdk.api.abi.multiCall({ block, calls: poolInfoCalls, abi: poolInfoABI, chain, })).output
        .map(a => getLPAddress ? getLPAddress(a.output) : (a.output && a.output[0]))
    const userBalances = (await sdk.api.abi.multiCall({ block, calls: userInfoCalls, abi: userInfoAbi, chain, })).output
        .map(a => a.output[0])

    userBalances.forEach((balance, idx) => {
        if (isNaN(+balance) || +balance <= 0) return;
        tempBalances[transformAddress(lpTokens[idx])] = balance
    })

    await unwrapLPsAuto({ balances: tempBalances, chain, block, transformAddress, excludePool2, onlyPool2, pool2Tokens })

    Object.keys(tempBalances).forEach(key => sdk.util.sumSingleBalance(balances, key, tempBalances[key]))

    return balances
}


module.exports = {
    addFundsInMasterChef,
    masterChefExports,
    getPoolInfo,
    isLP,
    standardPoolInfoAbi,
    getSymbolsAndBalances,
    isYV,
    getUserMasterChefBalances,
}
