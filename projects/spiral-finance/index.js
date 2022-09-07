const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const spr = "0x8c739564345dfcb7e4c7e520b0e8fa142c358a78";
const mastermind = "0x0Ff4c81489fbaFf02201b55636Df5889b43972e9";

async function calcTvl (block, spr, mastermind, pool2) {
    let balances = {};
    const chain = "fantom";

    const poolLength = (await sdk.api.abi.call({
        target: mastermind, 
        abi: abi["poolLength"],
        block,
        chain
    })).output;

    const poolInfos = (await sdk.api.abi.multiCall({
        calls: Array.from({length: Number(poolLength)}, (_,k) => ({
            target: mastermind,
            params: k
        })),
        abi: abi["poolInfo"],
        block,
        chain
    })).output;

    const tokens = (await sdk.api.abi.multiCall({
        calls: poolInfos.map(p => ({
            target: p.output.target,
            params: p.output.targetPoolId
        })),
        abi: abi["lockableToken"],
        block,
        chain
    })).output;

    const symbols = (await sdk.api.abi.multiCall({
        calls: tokens.map(p => ({
            target: p.output
        })),
        abi: "erc20:symbol",
        block,
        chain
    })).output;

    const lps = [];

    for (let i = 0; i < Number(poolLength); i++) {
        if (tokens[i].output === null) continue;
        const token = tokens[i].output.toLowerCase();
        const symbol = symbols[i].output;
        const balance = poolInfos[i].output.totalDeposits;
        if (token === spr) continue;
        if (!symbol.endsWith("LP") && pool2) continue;
        if (symbol.endsWith("LP")) {
            lps.push([token, balance]);
        } else {
            sdk.util.sumSingleBalance(balances, `fantom:${token}`, balance);
        }
    }

    const lpToken0 = (await sdk.api.abi.multiCall({
        calls: lps.map( p => ({
            target: p[0]
        })),
        abi: abi["token0"],
        block,
        chain
    })).output;

    const lpToken1 = (await sdk.api.abi.multiCall({
        calls: lps.map( p => ({
            target: p[0]
        })),
        abi: abi["token1"],
        block,
        chain
    })).output;

    let lpPositions = [];
    for (let i = 0; i < lps.length; i++) {
        const token = lps[i][0].toLowerCase();
        const token0 = lpToken0[i].output.toLowerCase();
        const token1 = lpToken1[i].output.toLowerCase();
        if (pool2) {
            if (token0 !== spr && token1 !== spr ) continue;
            lpPositions.push({
                token,
                balance: lps[i][1]
            });
        } else {
            if (token0 === spr || token1 === spr ) continue;
            lpPositions.push({
                token,
                balance: lps[i][1]
            });
        }
    }

    await unwrapUniswapLPs(balances, lpPositions, block, chain, addr=>`fantom:${addr}`);

    return balances;
}

async function tvl(timestamp, block, chainBlocks) {
    return await calcTvl(chainBlocks.fantom, spr, mastermind, false);
}

async function pool2(timestamp, block, chainBlocks) {
    return await calcTvl(chainBlocks.fantom, spr, mastermind, true);
}

module.exports = {
    fantom: {
        tvl,
        pool2
    }
}
