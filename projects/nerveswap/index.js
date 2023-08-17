const utils = require('../helper/utils');
const { BigNumber } = require("bignumber.js");

async function fetch() {
  let total = await utils.fetchURL('https://api.swap.nerve.network/swap/total/info');
  let tvl = new BigNumber(total.data.data.tvl);
  tvl = tvl.shiftedBy(-18).toFixed(6);
  return tvl;
}

module.exports = {
  methodology: "A NerveDeFi platform that integrates consensus, swap, cross-chain swap,liquidity, farm and cross-chain bridge.",
  nuls: {
    fetch
  },
  fetch
}
