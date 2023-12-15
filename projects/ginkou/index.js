

// For testing run
// node test.js projects/ginkou/index.js

const { default: axios } = require("axios");

async function ginkouTvl() {
    let data = await axios.get("https://wrapper-v2.ginkou.io/total-values");
    // data.data.total_locked_value returns price in USDC convert it to the denom value 
    let coinGeckoId = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    return {
        [coinGeckoId]: data.data.total_locked_value * 1000000,
      };
}

module.exports = {
    migaloo: { tvl: () => ginkouTvl() },
};
