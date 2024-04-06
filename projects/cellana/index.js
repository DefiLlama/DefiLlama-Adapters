const { getResources, } = require("../helper/chain/aptos");
const ADDRESSES = require('../helper/coreAssets.json')
const CELL_fungible_asset_address = '0x2ebb2ccac5e027a87fa0e2e5f656a3a4238d6a48d93ec9b610d570fc0aa0df12'
const APT_fungible_asset_address = '0xedc2704f2cef417a06d1756a04a16a9fa6faaed13af469be9cdfcac5a21a8e2e'

async function _getResources() {
  let resourcesCache;
  if (!resourcesCache) resourcesCache = getResources("0x3b38735644d0be8ac37ebd84a1e42fa5c2487495ef8782f6c694b1a147f82426")
  return resourcesCache
}

const extractCoinAddress = (str) => str.slice(str.indexOf("<") + 1, str.lastIndexOf(">"));
const reserveContrainerFilter = (i) => i.type.includes("0x1::coin::CoinStore")

async function _getCELLbalances(api) {
  const data = await getResources('0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1')
  const poolsAddresses = data.find(i => i.type.includes('::liquidity_pool::LiquidityPoolConfigs'))?.data.all_pools?.inline_vec
  for (const pool of poolsAddresses) {
    const fungibleAssetPoolStore = (await getResources(pool.inner)).find(i => i.type.includes('liquidity_pool::LiquidityPool'))?.data
    const fungibleAssetAddressToken1 = fungibleAssetPoolStore?.token_store_1?.inner
    const fungibleAssetAddressToken2 = fungibleAssetPoolStore?.token_store_2?.inner

    const fungibleAssetTokenStore_1 = (await getResources(fungibleAssetAddressToken1)).find(i => i.type.includes('fungible_asset::FungibleStore'))?.data
    const fungibleAssetTokenStore_2 = (await getResources(fungibleAssetAddressToken2)).find(i => i.type.includes('fungible_asset::FungibleStore'))?.data
    const token_1_address = fungibleAssetTokenStore_1?.metadata?.inner
    const token_2_address = fungibleAssetTokenStore_2?.metadata?.inner
    if (token_1_address == CELL_fungible_asset_address) {
      addBalance(token_2_address, fungibleAssetTokenStore_2?.balance || 0);
    } else if (token_2_address == CELL_fungible_asset_address) {
      addBalance(token_1_address, fungibleAssetTokenStore_1?.balance || 0);
    }
  }

  async function addBalance(token, balance) {
    if (token === APT_fungible_asset_address)
      api.add(ADDRESSES.aptos.APT, balance)
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Counts the lamports in each coin container in the Cellena contract account.",
  aptos: {
    tvl: async (api) => {
      const data = await _getResources()
      const coinContainers = data.filter(reserveContrainerFilter)
        .map((i) => ({
          lamports: i.data.coin.value,
          tokenAddress: extractCoinAddress(i.type),
        }));

      coinContainers.forEach(({ lamports, tokenAddress }) => {
        api.add(tokenAddress, lamports);
      });
      await _getCELLbalances(api)
    }
  }
}