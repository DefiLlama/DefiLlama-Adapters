const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('../helper/balances')
const retry = require("async-retry");
const axios = require("axios");

async function dex() {
    const response = (
        await retry(
          async (bail) =>
            await axios.get("https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_protocol_snapshot/?network=MAINNET")
        )
      ).data.protocol_snapshot.tvl.total_usd;
    return toUSDTBalances(response)
}

module.exports = {
    algorand: {
        tvl: sdk.util.sumChainTvls([ dex])
    }
}
// node test.js projects/algofi-swap/index.js