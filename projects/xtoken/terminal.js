const CONST = require("./constants");
const utils = require('../helper/utils');
const ethers = require("ethers");
const {toUSDTBalances} = require("../helper/balances");

exports.fetchChain = async (chain) => {
  let totalTvl = 0;
  let response = (await utils.fetchURL(CONST.TERMINALAPI)).data;
  Object.keys(response).forEach((key) => {
    let pool = response[key];
    if (pool.network !== chain) return;
    totalTvl = totalTvl + Number(ethers.utils.formatEther(pool.tvl));
  });

  return toUSDTBalances(Math.round(totalTvl));
}
