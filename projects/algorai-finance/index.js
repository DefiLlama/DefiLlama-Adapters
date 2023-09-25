const sdk = require('@defillama/sdk')

const {
  vaults,
} = require("./constants");
const { getAppGlobalState } = require("../helper/chain/algorand");

/**
 * @desc Return tvl
 *
 * @returns {Promise<{"[usdtAddress]": *}>}
 */
async function tvl() {
  const balances = {}
  const promises = vaults.map(async (vault) => {
    const state = await getAppGlobalState(vault.vaultID);
    const totalTvl = state.vtv ? state.vtv / 10 ** vault.assetDecimals : 0;
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