const { getResources, } = require("../helper/chain/aptos");

let resourcesCache

async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources("0xc0188ad3f42e66b5bd3596e642b8f72749b67d84e6349ce325b27117a9406bdf")
  return resourcesCache
}
const extractCoinAddress = (str) => str.slice(str.indexOf("<") + 1, str.lastIndexOf(">"));
const reserveContrainerFilter = (i) => i.type.includes("0xc0188ad3f42e66b5bd3596e642b8f72749b67d84e6349ce325b27117a9406bdf::acoin::ACoinInfo")

module.exports = {
  timetravel: false,
  methodology:
    "Counts the lamports in each coin container in the Aries contract account.",
  aptos: {
    tvl: async (api) => {
      const data = await _getResources()
      const coinContainers = data.filter(reserveContrainerFilter)
        .map((i) => ({
          lamports: i.data.total_supply - i.data.total_borrows,
          tokenAddress: extractCoinAddress(i.type),
        }));

      coinContainers.forEach(({ lamports, tokenAddress }) => {
        api.add(tokenAddress, lamports);
      });
    },
    borrowed: async (api) => {
      const data = await _getResources()
      const coinContainers = data.filter(reserveContrainerFilter)
        .map((i) => ({
          lamports: i.data.total_borrows,
          tokenAddress: extractCoinAddress(i.type),
        }));

      coinContainers.forEach(({ lamports, tokenAddress }) => {
        api.add(tokenAddress, lamports);
      });
    },
  },
};
