const {_BASE_TOKEN_, _QUOTE_TOKEN_} = require('./abis/dodo.json')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')
const { unwrapUniswapLPs, sumTokensAndLPsSharedOwners } = require('./unwrapLPs');
const masterchefAbi = require("./abis/masterchef.json")
const token0Abi = require("./abis/token0.json")
const token1Abi = require("./abis/token1.json")

function pool2(stakingContract, lpToken, chain = "ethereum", transformAddress) {
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const balances = {}
        if(transformAddress === undefined){
            transformAddress = addr=>`${chain}:${addr}`
        }
        await sumTokensAndLPs(balances, [[lpToken, stakingContract, true]], chainBlocks[chain], chain, transformAddress)
        return balances
    }
}

function pool2s(stakingContracts, lpTokens, chain = "ethereum", transformAddress = undefined){
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const balances = {}
        let transform = transformAddress
        if(transform === undefined){
            transform = addr=>`${chain}:${addr}`
        }
        await sumTokensAndLPsSharedOwners(balances, lpTokens.map(token=>[token, true]), stakingContracts, chainBlocks[chain], chain, transform)
        return balances
    }
}

function pool2Exports(stakingContract, lpTokens, chain, transformAddress) {
    return pool2s([stakingContract], lpTokens, chain, transformAddress)
}

function dodoPool2(stakingContract, lpToken, chain = "ethereum", transformAddress=addr=>addr) {
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const balances = {}
        const block = chainBlocks[chain]
        const [baseToken, quoteToken, totalSupply] = await Promise.all([_BASE_TOKEN_, _QUOTE_TOKEN_, "erc20:totalSupply"].map(abi => sdk.api.abi.call({
            target: lpToken,
            chain,
            block,
            abi
        }).then(r=>r.output)))
        const [baseTokenBalance, quoteTokenBalance, stakedLPBalance] = await Promise.all([
            [baseToken, lpToken], [quoteToken, lpToken], [lpToken, stakingContract]
        ].map(token => sdk.api.abi.call({
            target: token[0],
            params: [token[1]],
            chain,
            block,
            abi: 'erc20:balanceOf'
        }).then(r=>r.output)))
        sdk.util.sumSingleBalance(balances, baseToken, BigNumber(baseTokenBalance).times(stakedLPBalance).div(totalSupply).toFixed(0))
        sdk.util.sumSingleBalance(balances, quoteToken, BigNumber(quoteTokenBalance).times(stakedLPBalance).div(totalSupply).toFixed(0))
        return balances
    }
}


async function pool2BalanceFromMasterChef(balances, masterchef, token, block, chain = "ethereum", transformAddress=(addr)=>addr) {

    let poolLength = (
        await sdk.api.abi.call({
        target: masterchef,
        abi: masterchefAbi.poolLength,
        block,
        chain,
        })
    ).output;

    let poolInfo = (
        await sdk.api.abi.multiCall({
        calls: Array.from({ length: Number(poolLength) }, (_, k) => ({
            target: masterchef,
            params: k,
        })),
        abi: masterchefAbi.poolInfo,
        block,
        chain,
        })
    ).output;

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
        if (
        symbol.output.includes("LP") ||
        symbol.output.includes("PGL") ||
        symbol.output.includes("UNI-V2")){
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
        ){
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

function pool2BalanceFromMasterChefExports(masterchef, token, chain = "ethereum", transformAddress=(addr)=>addr) {
    
    return async (_timestamp, _ethBlock, chainBlocks) => {
        let balances = {};

        await pool2BalanceFromMasterChef(balances, masterchef, token, chainBlocks[chain], chain, transformAddress);

        return balances;
    } 
}

module.exports = {
    pool2,
    pool2Exports,
    dodoPool2,
    pool2s,
    pool2BalanceFromMasterChef,
    pool2BalanceFromMasterChefExports
}