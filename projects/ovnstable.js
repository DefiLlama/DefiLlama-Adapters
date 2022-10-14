const sdk = require("@defillama/sdk");

const m2m = {
    polygon: "0x33efB0868A6f12aEce19B451e0fcf62302Ec4A72",
    bsc: "0x9Af655c4DBe940962F776b685d6700F538B90fcf",
    optimism: "0x9Af655c4DBe940962F776b685d6700F538B90fcf",
    avax: "0x9Af655c4DBe940962F776b685d6700F538B90fcf",
}

const assets = {
    polygon: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", //USDC
    bsc: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", //BUSD
    optimism: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", //USDC
    avax: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", //USDC
}

const abi = {
    "inputs": [],
    "name": "totalNetAssets",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}


async function polygonTvl(timestamp, _block, {polygon: block }) {
    const balances = {}

    const totalNetAssets = (await sdk.api.abi.call({
        target: m2m.polygon,
        abi: abi,
        block: block,
        chain: 'polygon',
    })).output;

    sdk.util.sumSingleBalance(balances, `polygon:${assets.polygon}`, totalNetAssets);
    return balances;
}

async function bscTvl(timestamp, _block, {bsc: block }) {
    const balances = {}

    const totalNetAssets = (await sdk.api.abi.call({
        target: m2m.bsc,
        abi: abi,
        block: block,
        chain: 'bsc',
    })).output;

    sdk.util.sumSingleBalance(balances, `bsc:${assets.bsc}`, totalNetAssets);
    return balances;
}

async function optimismTvl(timestamp, _block, {optimism: block }) {
    const balances = {}

    const totalNetAssets = (await sdk.api.abi.call({
        target: m2m.optimism,
        abi: abi,
        block: block,
        chain: 'optimism',
    })).output;

    sdk.util.sumSingleBalance(balances, `optimism:${assets.optimism}`, totalNetAssets);
    return balances;
}

async function avaxTvl(timestamp, _block, {avax: block }) {
    const balances = {}

    const totalNetAssets = (await sdk.api.abi.call({
        target: m2m.avax,
        abi: abi,
        block: block,
        chain: 'avax',
    })).output;

    sdk.util.sumSingleBalance(balances, `avax:${assets.avax}`, totalNetAssets);
    return balances;
}

module.exports = {
    polygon: {
        tvl: polygonTvl,
    },
    bsc: {
        tvl: bscTvl,
    },
    optimism: {
        tvl: optimismTvl,
    },
    avax: {
        tvl: avaxTvl,
    },
};
