const sdk = require('@defillama/sdk')

const {
  vaults,
} = require("./constants");
const { readGlobalState } = require("./utils");

/**
 * @desc Return tvl
 *
 * @returns {Promise<{"[usdtAddress]": *}>}
 */
async function tvl() {
  const balances = {}
  const promises = vaults.map(async (vault) => {
    const state = await readGlobalState(vault.vaultID, ["vtv"]);
    const totalTvl = state[0] ? state[0] / 10 ** vault.assetDecimals : 0;
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