const { default: axios } = require("axios");
const { toUSDTBalances } = require('../helper/balances');

const api = "https://api-tvl.solrise.finance/api/v1/tvl";

async function tvl() {
    let aumValue = (await axios.get(api)).data.tvl.aumValue;
    return toUSDTBalances(aumValue);
}

async function staking() {
    let staked = (await axios.get(api)).data.tvl.stakedSlrsValue;
    return toUSDTBalances(staked)
}

module.exports = {
    misrepresentedTokens: true,
    solana: {
        tvl,
        staking
    }
}