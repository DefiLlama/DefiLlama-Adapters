const sdk = require("@defillama/sdk");
const abi = require("../helper/abis/masterchef.json");
const {unwrapUniswapLPs} = require("../helper/unwrapLPs.js");

const token = "0xd86Be84feC60Fedf263059BB1581e00d2168e19D";
const masterchef = "0x1610374513e989Fc263A5741A053fa023A6f212A";

const pool2LPs = [
    "0xeA3998615d2Bfe793E84318d5fE9D3Aa3d0F2F3f",
    "0x628C669511C4be30DA1c3C7Da4725eCD074c1c8B",
    "0x961C853477cAc8B9cfef953312331a2bE0C31C67",
    "0x7815A02bf54aa25039cC40Ac63daA84D876D130C"
]

async function tvl(timestamp, block, chainBlocks) {
    let balances = {};

    let { output: poolLength } = await sdk.api.abi.call({
        target: masterchef,
        abi: abi["poolLength"],
        block: chainBlocks.fantom,
        chain: "fantom"
    });

    let { output: poolInfo } = await sdk.api.abi.multiCall({
        calls: Array.from({length: Number(poolLength)}, (v, k) => ({
            target: masterchef,
            params: k
        })),
        abi: abi["poolInfo"],
        block: chainBlocks.fantom,
        chain: "fantom"
    });

    let { output: symbols } = await sdk.api.abi.multiCall({
        calls: poolInfo.map(pool => ({
            target: pool.output.lpToken
        })),
        abi: "erc20:symbol",
        block: chainBlocks.fantom,
        chain: "fantom"
    });

    let {output: balance } =  await sdk.api.abi.multiCall({
        calls: poolInfo.map(pool => ({
            target: pool.output.lpToken,
            params: masterchef
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks.fantom,
        chain: "fantom"
    });

    let lpPositions = [];
    for (let i = 0; i < Number(poolLength); i++) {
        if (balance[i].output === null || poolInfo[i].output.lpToken === token) {
            continue;
        }
        if (symbols[i].output.endsWith("LP")) {
            lpPositions.push({
                balance: balance[i].output,
                token: poolInfo[i].output.lpToken
            })
        } else {
            sdk.util.sumSingleBalance(balances, `fantom:${poolInfo[i].output.lpToken}`, balance[i].output);
        }
    }

    await unwrapUniswapLPs(balances, lpPositions, chainBlocks.fantom, "fantom", addr=>`fantom:${addr}`, [token]);

    return balances;
}

async function pool2(timestamp, block, chainBlocks) {
    let balances = {};

    let {output: balance} = await sdk.api.abi.multiCall({
        calls: pool2LPs.map(pool => ({
            target: pool,
            params: masterchef
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks.fantom,
        chain: "fantom"
    });

    let lpPositions = Array.from({length: pool2LPs.length}, (v, k) => ({
        balance: balance[k].output,
        token: pool2LPs[k]
    }));

    await unwrapUniswapLPs(balances, lpPositions, chainBlocks.fantom, "fantom", addr=>`fantom:${addr}`);

    return balances;
}

async function staking(timestamp, block, chainBlocks) {
    let balances = {}

    let {output: balance} = await sdk.api.erc20.balanceOf({
        target: token,
        owner: masterchef,
        block: chainBlocks.fantom,
        chain: "fantom"
    });

    sdk.util.sumSingleBalance(balances, token, balance);
    
    return balances;
}

module.exports = {
    fantom: {
        tvl,
        pool2,
        staking
    },
    tvl
}