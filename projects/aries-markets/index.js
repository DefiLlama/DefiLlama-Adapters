const { getResources, getTableData, } = require("../helper/chain/aptos");
const toHex = (str) => Buffer.from(str, 'utf-8').toString('hex');

let resourcesCache

async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources("0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3")
  return resourcesCache
}
const extractCoinAddress = (str) => str.slice(str.indexOf("<") + 1, str.lastIndexOf(">"));
const reserveContrainerFilter = (i) => i.type.includes("0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::reserve::ReserveCoinContainer");
const faWrapperFilter = (i) => i.type.includes("0x9770fa9c725cbd97eb50b2be5f7416efdfd1f1554beb0750d4dae4c64e860da3::fa_to_coin_wrapper::WrapperCoinInfo");

module.exports = {
  timetravel: false,
  methodology: "Counts the lamports in each coin container in the Aries contract account.",
  aptos: {
    tvl: async (api) => {
      const data = await _getResources()
      const coinContainers = data.filter(reserveContrainerFilter)
        .map((i) => ({
          lamports: i.data.underlying_coin.value,
          tokenAddress: extractCoinAddress(i.type),
        }));
      const faWrappers = data.filter(faWrapperFilter)
        .map((i) => ({
          lamports: i.data.fa_amount,
          faAddress: i.data.metadata.inner,
        }));

      coinContainers.forEach(({ lamports, tokenAddress }) => {
        api.add(tokenAddress, lamports);
      });

      faWrappers.forEach(({ lamports, faAddress }) => {
        api.add(faAddress, lamports);
      });
    },
    borrowed: () => ({}) // markets wound down in July 2026 and liquidity was removed
  },
};
