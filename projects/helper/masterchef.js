const sdk = require('@defillama/sdk');
const abi = require('./abis/masterchef.json')
const { unwrapUniswapLPs } = require('./unwrapLPs')
const token0Abi = require("./abis/token0.json");
const token1Abi = require("./abis/token1.json");
const { getBlock } = require('./getBlock')

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
    return symbol.includes('LP') || symbol.includes('PGL') || symbol.includes('UNI-V2')
}

async function addFundsInMasterChef(balances, masterChef, block, chain = 'ethereum', transformAddress = id => id, poolInfoAbi = abi.poolInfo, ignoreAddresses = [], includeLPs = true, excludePool2 = false, stakingToken = undefined) {
    const poolInfo = await getPoolInfo(masterChef, block, chain, poolInfoAbi)
    const [symbols, tokenBalances] = await getPoolInfo(masterChef, block, chain, poolInfo);

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
    return async ()=>balancePromise.then(b => b[section])
}

function masterChefExports(masterChef, chain, stakingTokenRaw) {
    const stakingToken = stakingTokenRaw.toLowerCase();
    const poolInfoAbi = abi.poolInfo;
    let balanceResolve;
    const balancePromise = new Promise((resolve) => { balanceResolve = resolve })

    async function tvl(timestamp, ethBlock, chainBlocks) {
        const block = await getBlock(timestamp, chain, chainBlocks, true)
        const transformAddress = addr => `${chain}:${addr}`;

        const poolInfo = await getPoolInfo(masterChef, block, chain, poolInfoAbi)
        const [symbols, tokenBalances] = await getSymbolsAndBalances(masterChef, block, chain, poolInfo);

        const balances = {
            staking: {},
            pool2: {},
            tvl: {}
        }

        const lpPositions = [];

        symbols.output.forEach((symbol, idx) => {
            const balance = tokenBalances.output[idx].output;
            const token = symbol.input.target.toLowerCase();
            if (token === stakingToken) {
                sdk.util.sumSingleBalance(balances.staking, transformAddress(token), balance)
            } else if (isLP(symbol.output)) {
                lpPositions.push({
                    balance,
                    token
                });
            } else {
                sdk.util.sumSingleBalance(balances.tvl, transformAddress(token), balance)
            }
        })

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



module.exports = {
    addFundsInMasterChef,
    masterChefExports
}