const addresses = require('../helper/coreAssets.json')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function tvl(_, _1, _2, {api}) {
    const result = await axios.get("https://referral-dev.m-safe-dev.link/tvl")
    const data = result.data
    return {
        [`ethereum:${addresses.null}`]: new BigNumber(data.coins.find(it => it.coinType === "ethereum").amount).times(1e18).toString(),
        [`ethereum:${addresses.ethereum.USDT}`]: new BigNumber(data.coins.find(it => it.coinType === "usdt").amount).times(1e6).toString(),
        [`ethereum:${addresses.ethereum.USDC}`]: new BigNumber(data.coins.find(it => it.coinType === "usdc").amount).times(1e6).toString(),
    }
}

module.exports = {
    start: 1713892926,
    ethereum: {
        tvl
    },
};