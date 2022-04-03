const sdk = require('@defillama/sdk');
// const { getTokenPrices } = require('@defillama/sdk/build/computeTVL/prices');
const { toUSDTBalances } = require('../helper/balances')
const utils = require("../helper/utils");

const COINS_LIST = `dai,bitcoin,ethereum,wrapped-bitcoin,frax,usd-coin,tether,fei-usd,true-usd,maker`;

const poolLength = {
    "inputs": [],
    "name": "poolLength",
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

// ethereum
async function getPoolLength(contractAddress) {
    return (await sdk.api.abi.call({
        target: contractAddress,
        params: [],
        abi: poolLength,
    })).output;
}

async function getPools(contractAddress, total, abi) {
    const output = (await sdk.api.abi.multiCall({
        abi: abi,
        calls: [...Array(total)].map((_, i) => {
            return {
                target: contractAddress,
                params: i
            }
        })
    })).output;

    return output;
}

function format(pools) {
    return pools.map((pool) => {
        return pool.output;
    })
}

// [`0x8fffffd4afb6115b954bd326cbe7b4ba576818f6`, `0x3e7d1eab13ad0104d2750b8863b489d65364e32d`]
async function getChainlinkPrices(contractAddresses) {
    const output = (await sdk.api.abi.multiCall({
        abi: { "inputs": [], "name": "latestAnswer", "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }], "stateMutability": "view", "type": "function" },
        calls: contractAddresses.map((target, _) => {
            return {
                target: target
            }
        })
    })).output;

    return output;
}

async function getPricesfromString() {
    return utils.getPricesfromString(COINS_LIST)
}

module.exports = {
    getPoolLength,
    getPools,
    toUSDTBalances,
    format,
    getChainlinkPrices,
    getPricesfromString
};
