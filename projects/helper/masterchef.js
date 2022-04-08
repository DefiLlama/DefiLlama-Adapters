const sdk = require('@defillama/sdk');
const abi = require('./abis/masterchef.json')
const { unwrapUniswapLPs, unwrapLPsAuto, } = require('./unwrapLPs')
const tokenAbi = require("./abis/token.json");
const token0Abi = require("./abis/token0.json");
const token1Abi = require("./abis/token1.json");
const getReservesAbi = require("./abis/getReserves.json");
const userInfoAbi = require("./abis/userInfo.json");
const { getBlock } = require('./getBlock');
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform } = require('../helper/portedTokens');
const { requery, setPrice, sum } = require('./getUsdUniTvl');

async function getPoolInfo(masterChef, block, chain, poolInfoAbi) {
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
        }),
        sdk.api.abi.multiCall({
            block,
            calls: poolInfo.map(p => ({
                target: p.output[0],
                params: masterChef
            })),
            abi: 'erc20:balanceOf',
            chain,
        })
    ])
    return [symbols, tokenBalances]
}

function isLP(symbol) {
    return symbol.includes('LP') || symbol.includes('PGL') || symbol.includes('UNI-V2') || symbol === "PNDA-V2" || symbol.includes('GREEN-V2')
}

function isYV(symbol) {
    return symbol.includes('yv')
}

async function addFundsInMasterChef(balances, masterChef, block, chain = 'ethereum', transformAddress = id => id, poolInfoAbi = abi.poolInfo, ignoreAddresses = [], includeLPs = true, excludePool2 = false, stakingToken = undefined) {
    const poolInfo = await getPoolInfo(masterChef, block, chain, poolInfoAbi)
    const [symbols, tokenBalances] = await getSymbolsAndBalances(masterChef, block, chain, poolInfo);

    const lpPositions = [];
    const lpTokens = [];

    symbols.output.forEach((symbol, idx) => {
        const balance = tokenBalances.output[idx].output;
        const token = symbol.input.target;
        if (ignoreAddresses.some(addr => addr.toLowerCase() === token.toLowerCase()) || symbol.output === null) {
            return
        }
        if (isLP(symbol.output)) {
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


function awaitBalanceUpdate(balancePromise, section) {
    return async () => balancePromise.then(b => b[section])
}

function masterChefExports(masterChef, chain, stakingTokenRaw, tokenIsOnCoingecko = true, poolInfoAbi = abi.poolInfo, includeYVTokens = false) {
    const stakingToken = stakingTokenRaw.toLowerCase();
    let balanceResolve;
    const balancePromise = new Promise((resolve) => { balanceResolve = resolve })

    async function tvl(timestamp, ethBlock, chainBlocks) {
        const block = await getBlock(timestamp, chain, chainBlocks, true)
        const transformAddress = await getChainTransform(chain);

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
            } else if (isLP(symbol.output)) {
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

        if (!tokenIsOnCoingecko) {
            const maxPool2ByToken = (await sdk.api.abi.multiCall({
                calls: pool2LpPositions.map(p => ({
                    target: stakingToken,
                    params: [p.token]
                })),
                abi: "erc20:balanceOf",
                block,
                chain
            })).output.reduce((max, curr) => {
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

        balanceResolve(balances)
        return balances.tvl
    };

    return {
        methodology: "TVL includes all farms in MasterChef contract",
        [chain]: {
            staking: awaitBalanceUpdate(balancePromise, "staking"),
            pool2: awaitBalanceUpdate(balancePromise, "pool2"),
            masterchef: awaitBalanceUpdate(balancePromise, "tvl"),
            tvl
        }
    };
}

function masterChefExportsUnknownLP(masterChef, chain, stakingTokenRaw, coreAssetRaw, whitelistRaw, coreAssetName, decimals = 18, poolInfoAbi = abi.poolInfo) {
    const stakingToken = stakingTokenRaw.toLowerCase();
    const coreAsset = coreAssetRaw.toLowerCase();
    const whitelist = whitelistRaw.map(t => t.toLowerCase());
    let balanceResolve;
    if (!whitelist.includes(stakingToken)) {
        whitelistRaw.push(stakingToken)
    }
    const balancePromise = new Promise((resolve) => { balanceResolve = resolve })

    async function tvl(timestamp, ethBlock, chainBlocks) {
        const block = await getBlock(timestamp, chain, chainBlocks, true)

        const poolInfo = await getPoolInfo(masterChef, block, chain, poolInfoAbi)
        const [symbols, tokenBalances] = await getSymbolsAndBalances(masterChef, block, chain, poolInfo);

        const lpPositions = [];
        let singlePositions = {};

        await Promise.all(symbols.output.map(async (symbol, idx) => {
            const balance = tokenBalances.output[idx].output;
            const token = symbol.input.target.toLowerCase();
            if (isLP(symbol.output)) {
                lpPositions.push({
                    balance,
                    token
                });
            } else {
                singlePositions[token] = balance
            }
        }));

        const [token0, token1, reserves, totalSupply] = await Promise.all([
            sdk.api.abi.multiCall({
                calls: lpPositions.map(p => ({
                    target: p.token
                })),
                abi: token0Abi,
                block,
                chain
            }).then(({ output }) => output),
            sdk.api.abi.multiCall({
                calls: lpPositions.map(p => ({
                    target: p.token
                })),
                abi: token1Abi,
                block,
                chain
            }).then(({ output }) => output),
            sdk.api.abi.multiCall({
                calls: lpPositions.map(p => ({
                    target: p.token
                })),
                abi: getReservesAbi,
                block,
                chain
            }).then(({ output }) => output),
            sdk.api.abi.multiCall({
                calls: lpPositions.map(p => ({
                    target: p.token
                })),
                abi: 'erc20:totalSupply',
                block,
                chain
            }).then(({ output }) => output),
        ]);
        await requery(token0, chain, block, token0Abi);
        await requery(token1, chain, block, token1Abi);
        await requery(reserves, chain, block, getReservesAbi);
        await requery(totalSupply, chain, block, 'erc20:totalSupply');

        const pairs = {};
        // add token0Addresses
        token0.forEach((token0Address) => {
            const tokenAddress = token0Address.output.toLowerCase();

            const pairAddress = token0Address.input.target.toLowerCase();
            pairs[pairAddress] = {
                token0Address: tokenAddress,
            }
        });

        // add token1Addresses
        token1.forEach((token1Address) => {
            const tokenAddress = token1Address.output.toLowerCase();
            const pairAddress = token1Address.input.target.toLowerCase();
            pairs[pairAddress] = {
                ...(pairs[pairAddress] || {}),
                token1Address: tokenAddress,
            }
        });

        let coreBalance = 0
        let pool2Balance = 0
        let stakingBalance = 0
        const whitelistBalances = {};
        const prices = {};

        for (let i = 0; i < reserves.length; i++) {
            const pairAddress = reserves[i].input.target.toLowerCase();
            const pair = pairs[pairAddress];
            const supply = totalSupply[i].output
            const token0Address = pair.token0Address.toLowerCase()
            const token1Address = pair.token1Address.toLowerCase()
            const reserveAmounts = reserves[i].output

            if (token0Address === stakingToken) {
                pool2Balance += Number(reserveAmounts[0]) * 2 * lpPositions[i].balance / supply
            } else if (token1Address === stakingToken) {
                pool2Balance += Number(reserveAmounts[1]) * 2 * lpPositions[i].balance / supply
            }

            if (token0Address === coreAsset) {
                coreBalance += Number(reserveAmounts[0]) * 2 * lpPositions[i].balance / supply
                if (whitelist.includes(token1Address)) {
                    setPrice(prices, token1Address, reserveAmounts[0], reserveAmounts[1])
                }
            } else if (token1Address === coreAsset) {
                coreBalance += Number(reserveAmounts[1]) * 2 * lpPositions[i].balance / supply
                if (whitelist.includes(token0Address)) {
                    // no whitelist currently but we need prices for all of the coins in the market 
                    setPrice(prices, token0Address, reserveAmounts[1], reserveAmounts[0])
                }
            } else {
                const whitelistedToken0 = whitelist.find(t => t === token0Address)
                const whitelistedToken1 = whitelist.find(t => t === token1Address)
                if (whitelistedToken0 !== undefined) {
                    sum(whitelistBalances, whitelistedToken0, Number(reserveAmounts[0]) * 2 * lpPositions[i].balance / supply)
                } else if (whitelistedToken1 !== undefined) {
                    sum(whitelistBalances, whitelistedToken1, Number(reserveAmounts[1]) * 2 * lpPositions[i].balance / supply)
                }
            }
        }
        Object.entries(whitelistBalances).forEach(([address, amount]) => {
            const price = prices[address];
            if (price !== undefined) {
                coreBalance += price[1] * (amount ?? 0)
            }
        })

        Object.entries(singlePositions).forEach(([address, amount]) => {
            const price = prices[address];
            if (price !== undefined) {
                stakingBalance += price[1] * (amount ?? 0)
            }
        })

        // balanceResolve(whitelistBalances)

        const allBalances = {
            staking: { [coreAssetName]: stakingBalance / 10 ** decimals },
            pool2: { [coreAssetName]: pool2Balance / 10 ** decimals },
            masterchef: { [coreAssetName]: coreBalance / 10 ** decimals },
            tvl: { [coreAssetName]: coreBalance / 10 ** decimals }
        };

        balanceResolve(allBalances)
        return allBalances.tvl
    };


    return {
        methodology: "TVL includes all farms in MasterChef contract",
        [chain]: {
            staking: awaitBalanceUpdate(balancePromise, "staking"),
            pool2: awaitBalanceUpdate(balancePromise, "pool2"),
            masterchef: awaitBalanceUpdate(balancePromise, "masterchef"),
            tvl
        }
    };
}

const standardPoolInfoAbi = { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "poolInfo", "outputs": [{ "internalType": "contract IERC20", "name": "lpToken", "type": "address" }, { "internalType": "uint256", "name": "allocPoint", "type": "uint256" }, { "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" }, { "internalType": "uint256", "name": "accWeVEPerShare", "type": "uint256" }], "stateMutability": "view", "type": "function" }

async function getUserMasterChefBalances({ balances = {}, masterChefAddress, userAddres, block, chain = 'ethereum', transformAddress, excludePool2 = false, onlyPool2 = false, pool2Tokens= [], poolInfoABI = abi.poolInfo }) {
    if (!transformAddress)
        transformAddress = await getChainTransform(chain)

    const tempBalances = {}
    const poolLength = (await sdk.api.abi.call({ abi: abi.poolLength, target: masterChefAddress, block, chain, })).output
    const dummyArray = Array.from(Array(Number(poolLength)).keys())
    const poolInfoCalls = dummyArray.map(i => ({ target: masterChefAddress, params: i, }))
    const userInfoCalls = dummyArray.map(i => ({ target: masterChefAddress, params: [i, userAddres], }))
    const lpTokens = (await sdk.api.abi.multiCall({ block, calls: poolInfoCalls, abi: poolInfoABI, chain, })).output
        .map(a => a.output && a.output[0])
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
    masterChefExportsUnknownLP,
    getPoolInfo,
    isLP,
    standardPoolInfoAbi,
    getSymbolsAndBalances,
    isYV,
    getUserMasterChefBalances,
}
