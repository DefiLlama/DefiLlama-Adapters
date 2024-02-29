const sdk = require("@defillama/sdk");
const { getResources, } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");

let resourcesCache

async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources("0x3b38735644d0be8ac37ebd84a1e42fa5c2487495ef8782f6c694b1a147f82426")
  return resourcesCache
}
const extractCoinAddress = (str) => str.slice(str.indexOf("<") + 1, str.lastIndexOf(">"));
const reserveContrainerFilter = (i) => i.type.includes("0x1::coin::CoinStore")

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "Counts the lamports in each coin container in the Aries contract account.",
  aptos: {
    tvl: async () => {
      const balances = {};
      const data = await _getResources()
      const coinContainers = data.filter(reserveContrainerFilter)
        .map((i) => ({
          lamports: i.data.coin.value,
          tokenAddress: extractCoinAddress(i.type),
        }));

      coinContainers.forEach(({ lamports, tokenAddress }) => {
        sdk.util.sumSingleBalance(balances, tokenAddress, lamports);
      });

      return transformBalances("aptos", balances);
    },

  },
};
