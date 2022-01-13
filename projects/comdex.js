const retry = require('./helper/retry')
const axios = require("axios");
const {
    humanizeNumber,
} = require("@defillama/sdk/build/computeTVL/humanizeNumber");

async function fetch() {
    var response = await retry(async bail => await axios.get('https://api-comdex.zenchainlabs.io/staking/pool'))
    var response2 = await retry(async bil => await axios.get('https://api-osmosis.imperator.co/tokens/v1/CMDX'))

    var price = response2.data[0].price
    var liquid = response2.data[0].liquidity

    var bonded_amt = (response.data.result.bonded_tokens / Math.pow(10, 6)) * price

    console.log("---- tvl ----")
    console.log("\Bonded Tokens".padEnd(25, " "), humanizeNumber(bonded_amt), "\n")
    console.log("\Liquidity in Osmosis".padEnd(25, " "), humanizeNumber(liquid), "\n")

    return bonded_amt + liquid;
}

module.exports = {
    fetch
}