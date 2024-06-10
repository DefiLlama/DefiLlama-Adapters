const { getResources, function_view } = require("../helper/chain/aptos");
let resourcesCache;
let poolsCache;
async function _getResources() {
  if (!resourcesCache) resourcesCache = getResources("0x3b38735644d0be8ac37ebd84a1e42fa5c2487495ef8782f6c694b1a147f82426")
  return resourcesCache
}
async function _getPools() {
  if (!poolsCache) poolsCache = function_view({ functionStr: "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1::liquidity_pool::all_pool_addresses", type_arguments: [], args: [] })
  return poolsCache
}
const extractCoinAddress = (str) => str.slice(str.indexOf("<") + 1, str.lastIndexOf(">"));
const reserveContrainerFilter = (i) => i.type.includes("0x1::coin::CoinStore")

async function getfungibleAssetBalances(api) {
  const data = await _getPools('0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1')
  const poolsAddresses = data[0];
  for (const pool of poolsAddresses) {
    const fungibleAssetPoolStore = (await getResources(pool.inner)).find(i => i.type.includes('liquidity_pool::LiquidityPool'))?.data
    const fungibleAssetAddressToken1 = fungibleAssetPoolStore?.token_store_1?.inner
    const fungibleAssetAddressToken2 = fungibleAssetPoolStore?.token_store_2?.inner

    const fungibleAssetTokenStore_1 = (await getResources(fungibleAssetAddressToken1)).find(i => i.type.includes('fungible_asset::FungibleStore'))?.data
    const fungibleAssetTokenStore_2 = (await getResources(fungibleAssetAddressToken2)).find(i => i.type.includes('fungible_asset::FungibleStore'))?.data
    const token_1_address = fungibleAssetTokenStore_1?.metadata?.inner
    const token_2_address = fungibleAssetTokenStore_2?.metadata?.inner
    api.add(token_2_address, fungibleAssetTokenStore_2?.balance || 0);
    api.add(token_1_address, fungibleAssetTokenStore_1?.balance || 0);
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts the lamports in each coin container in the Cellena contract account.",
  aptos: {

    tvl: async (_, _1, _2, { api }) => {

      const data = await _getResources()
      const coinContainers = data.filter(reserveContrainerFilter)
        .map((i) => ({
          lamports: i.data.coin.value,
          tokenAddress: extractCoinAddress(i.type),
        }));

      coinContainers.forEach(({ lamports, tokenAddress }) => {
        api.add(tokenAddress, lamports);
      });
      //get funible asset balance
      await getfungibleAssetBalances(api)
      console.log(api)
    }
  }
}