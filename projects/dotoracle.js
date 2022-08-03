const retry = require('./helper/retry');
const axios = require('axios');

async function fetch() {
  const response = (
    await retry(
      async (bail) => await axios.get('https://bridge-mainnet.dotoracle.network/tvl')
    )
  ).data;

  return response.tvl.tvl;
}

module.exports = {
  timetravel: false,
  methodology: "The DotOracle API endpoint fetches on-chain data listed at https://github.com/dotoracle/casper-contract-hash/blob/master/config.json from the supported EVM chains (Ethereum, BSC...) and Casper, then uses prices from Coingecko to aggregate total TVL.",
  fetch,
};
