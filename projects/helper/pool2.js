const { _BASE_TOKEN_, _QUOTE_TOKEN_ } = require('./abis/dodo.json')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')
const { unwrapUniswapLPs, sumTokensAndLPsSharedOwners, sumTokensExport, } = require('./unwrapLPs');
const { getFixBalancesSync } = require('../helper/portedTokens')
const masterchefAbi = require("./abis/masterchef.json")
const token0Abi = 'address:token0'
const token1Abi = 'address:token1'
const { isLP, getPoolInfo } = require('./masterchef')
const { sumTokensExport: uSumExport } = require('./unknownTokens')

function pool2(stakingContract, lpToken, chain, transformAddress) {
    if (!Array.isArray(stakingContract)) stakingContract = [stakingContract]
    if (!Array.isArray(lpToken)) lpToken = [lpToken]
    if (arguments.length === 2) return uSumExport({ tokens: lpToken, owners: stakingContract, useDefaultCoreAssets: true })
    return pool2s(stakingContract, lpToken, chain, transformAddress)
}

function pool2s(stakingContracts, lpTokens, chain = "ethereum", transformAddress = undefined) {
    return async (api) => {
        chain = api.chain ?? chain
        const block = api.block
        const balances = {}
        let transform = transformAddress
        if (transform === undefined) {
            transform = addr => `${chain}:${addr}`
        }
        await sumTokensAndLPsSharedOwners(balances, lpTokens.map(token => [token, true]), stakingContracts, block, chain, transform)
        const fixBalances = getFixBalancesSync(chain)
        fixBalances(balances)
        return balances
    }
}

function pool2Exports(stakingContract, lpTokens, chain, transformAddress) {
    return pool2s([stakingContract], lpTokens, chain, transformAddress)
}

function dodoPool2(stakingContract, lpToken, chain = "ethereum", transformAddress = addr => addr) {
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const balances = {}
        const block = chainBlocks[chain]
        const [baseToken, quoteToken, totalSupply] = await Promise.all([_BASE_TOKEN_, _QUOTE_TOKEN_, "erc20:totalSupply"].map(abi => sdk.api.abi.call({
            target: lpToken,
            chain,
            block,
            abi
        }).then(r => r.output)))
        const [baseTokenBalance, quoteTokenBalance, stakedLPBalance] = await Promise.all([
            [baseToken, lpToken], [quoteToken, lpToken], [lpToken, stakingContract]
        ].map(token => sdk.api.abi.call({
            target: token[0],
            params: [token[1]],
            chain,
            block,
            abi: 'erc20:balanceOf'
        }).then(r => r.output)))
        sdk.util.sumSingleBalance(balances, baseToken, BigNumber(baseTokenBalance).times(stakedLPBalance).div(totalSupply).toFixed(0))
        sdk.util.sumSingleBalance(balances, quoteToken, BigNumber(quoteTokenBalance).times(stakedLPBalance).div(totalSupply).toFixed(0))
        return balances
    }
}


async function pool2BalanceFromMasterChef(balances, masterchef, token, block, chain = "ethereum", transformAddress = (addr) => addr, poolInfoAbi = masterchefAbi.poolInfo) {
    const poolInfo = await getPoolInfo(masterchef, block, chain, poolInfoAbi)

    let symbols = (
        await sdk.api.abi.multiCall({
            calls: poolInfo.map((p) => ({
                target: p.output.lpToken,
            })),
            abi: "erc20:symbol",
            block,
            chain,
        })
    ).output;

    let lpTokens = [];

    for (let i = 0; i < symbols.length; i++) {
        let symbol = symbols[i];
        if (symbol.output === null) {
            continue;
        }
        if (isLP(symbol.output, symbol.input.target, chain)) {
            lpTokens.push(symbol.input.target);
        }
    }

    let [tokens0, tokens1] = await Promise.all([
        sdk.api.abi.multiCall({
            calls: lpTokens.map((p) => ({
                target: p,
            })),
            abi: token0Abi,
            block,
            chain,
        }),
        sdk.api.abi.multiCall({
            calls: lpTokens.map((p) => ({
                target: p,
            })),
            abi: token1Abi,
            block,
            chain,
        }),
    ]);

    let pool2LPs = [];

    for (let i = 0; i < lpTokens.length; i++) {
        if (
            tokens0.output[i].output.toLowerCase() === token.toLowerCase() ||
            tokens1.output[i].output.toLowerCase() === token.toLowerCase()
        ) {
            pool2LPs.push(lpTokens[i]);
        }
    }

    let lpBalances = (await sdk.api.abi.multiCall({
        calls: pool2LPs.map((p) => ({
            target: p,
            params: masterchef
        })),
        abi: "erc20:balanceOf",
        block,
        chain,
    })).output;

    let lpPositions = lpBalances.map((p) => ({
        balance: p.output,
        token: p.input.target
    }));

    await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAddress);

}

function pool2BalanceFromMasterChefExports(masterchef, token, chain = "ethereum", transformAddress = (addr) => addr, poolInfoAbi = masterchefAbi.poolInfo) {

    return async (_timestamp, _ethBlock, chainBlocks) => {
        let balances = {};

        await pool2BalanceFromMasterChef(balances, masterchef, token, chainBlocks[chain], chain, transformAddress, poolInfoAbi);

        return balances;
    }
}

function pool2UniV3({ stakingAddress, chain = 'ethereum' }) {
    return sumTokensExport({ owner: stakingAddress, resolveUniV3: true })
}

module.exports = {
    pool2,
    pool2Exports,
    dodoPool2,
    pool2s,
    pool2BalanceFromMasterChef,
    pool2BalanceFromMasterChefExports,
    pool2UniV3,
}