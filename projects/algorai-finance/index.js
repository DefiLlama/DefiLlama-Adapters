const { toUSDTBalances } = require("../helper/balances");

const {
  vaults,
} = require("./constants");
const { readGlobalState} = require("./utils");
const { getPrices } = require("./prices");

/**
 * @desc Get total tvl in usd currency
 *
 * @param prices
 * @returns {Promise<unknown>}
 */
async function getTotalTvl(prices) {
  const promises = vaults.map(async (vault) => {
    try {
      const state = await readGlobalState(vault.vaultID, ["vtv"]);
      const totalTvl = state[0] ? state[0] / 10 ** vault.assetDecimals : 0;

      return vault.stable ? totalTvl : totalTvl * prices[vault.depositAssetID];
    } catch (e) {
      return 0;
    }
  });

  const totalTvl = await Promise.all(promises);
  return totalTvl.reduce((a, b) => a + b, 0);
}

/**
 * @desc Return tvl
 *
 * @returns {Promise<{"[usdtAddress]": *}>}
 */
async function tvl() {
  const prices = await getPrices();

  const [
    tvl,
  ] = await Promise.all([
    getTotalTvl(prices),
  ]);
  return toUSDTBalances(
      tvl
  );
}


module.exports = {
  algorand: {
    tvl,
  },
};
