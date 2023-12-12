const {  vaults, } = require("./constants");
const { sumTokens } = require("../helper/chain/algorand");
const axios = require("axios");

async function fetchMAlgoToAlgoBalance() {
  return (await axios('https://messina.one/api/ls/exchange-rate')).data;
}

/**
 * @desc Return tvl
 *
 * @returns {Promise<{"[usdtAddress]": *}>}
 */
async function tvl() {
  return sumTokens({ owners: vaults, blacklistedTokens: ['1145958888', '1145959061',] })
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
  },
};