const utils = require('../helper/utils');
const { BigNumber } = require("bignumber.js");
const baseURL = "https://api.swap.nerve.network/swap";

async function fetch() {
  let total = await utils.fetchURL(baseURL + '/total/info');
  let tvl = new BigNumber(total.data.data.tvl);
  tvl = tvl.shiftedBy(-18).toFixed(6);
  return tvl;
}

async function nuls() {
  let total = await utils.fetchURL(baseURL + '/nuls/info');
  let tvl = new BigNumber(total.data.data.tvl);
  tvl = tvl.shiftedBy(-18).toFixed(6);
  return tvl;
}

async function kava() {
  let total = await utils.fetchURL(baseURL + '/kava/info');
  let tvl = new BigNumber(total.data.data.tvl);
  tvl = tvl.shiftedBy(-18).toFixed(6);
  return tvl;
}

module.exports = {
  methodology: "A NerveDeFi platform that integrates consensus, swap, cross-chain swap,liquidity, farm and cross-chain bridge.",
  nuls: {
    fetch: nuls
  },
  kava: {
    fetch: kava
  },
  fetch
}
