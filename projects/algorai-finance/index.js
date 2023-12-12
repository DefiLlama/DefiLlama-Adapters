const sdk = require('@defillama/sdk')

const {
  vaults,
} = require("./constants");
const { getAppGlobalState } = require("../helper/chain/algorand");
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
  const balances = {}
  const promises = vaults.map(async (vault) => {
    const state = await getAppGlobalState(vault.vaultID);
    let totalTvl = state.vtv ? state.vtv / 10 ** vault.assetDecimals : 0;
    if (vault.originCoin !== '') {
      const mAlgoToAlgo = await fetchMAlgoToAlgoBalance();
      if (mAlgoToAlgo && mAlgoToAlgo.algo) {
        // Calculate mAlgo to algo price from messina
        totalTvl = totalTvl * Number(mAlgoToAlgo.algo)
      }
    }
    sdk.util.sumSingleBalance(balances, vault.coingecko, totalTvl)
  });
  await Promise.all(promises)

  return balances
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl,
  },
};