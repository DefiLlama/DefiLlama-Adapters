/**
 * MetacoinSwap is a decentralized trading platform based on EVM multi-chain construction.
 *
 * @see https://metacoinswap.io/
 */


const axios = require("axios");
const { toUSDTBalances } = require("../helper/balances");

async function bsc() {
  return toUSDTBalances(
    (await axios("http://defillama.metacoinswap.io/statistics/Metacoin")).data.tvl

  );
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bsc,
  },
};

