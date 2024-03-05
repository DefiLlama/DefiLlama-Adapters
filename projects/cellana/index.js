const sdk = require("@defillama/sdk");
const http = require('../helper/http')
const { getResources, } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");
const coinGecKoApi = 'https://api.coingecko.com/api/v3/simple/price?ids=aptos%2Captos&vs_currencies=usd';
async function query(api) {
  return http.get(`${api}`)
}
const util = require("util")
const CELL_fungible_asset_address = '0x2ebb2ccac5e027a87fa0e2e5f656a3a4238d6a48d93ec9b610d570fc0aa0df12'
const APT_fungible_asset_address = '0xedc2704f2cef417a06d1756a04a16a9fa6faaed13af469be9cdfcac5a21a8e2e'

async function _getResources() {
  let resourcesCache;
  if (!resourcesCache) resourcesCache = getResources("0x3b38735644d0be8ac37ebd84a1e42fa5c2487495ef8782f6c694b1a147f82426")
  return resourcesCache
}
const extractCoinAddress = (str) => str.slice(str.indexOf("<") + 1, str.lastIndexOf(">"));
const reserveContrainerFilter = (i) => i.type.includes("0x1::coin::CoinStore")

async function _getCELLbalances() {
  const balances = {}
  const data = await getResources('0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1')
  const { aptos } = await query(coinGecKoApi);
  const aptosPrice = aptos.usd;
  const poolsAddresses = data.find(i => i.type.includes('::liquidity_pool::LiquidityPoolConfigs'))?.data.all_pools?.inline_vec
  for (const pool of poolsAddresses) {
    const fungibleAssetPoolStore = (await getResources(pool.inner)).find(i => i.type.includes('liquidity_pool::LiquidityPool'))?.data
    const fungibleAssetAddressToken1 = fungibleAssetPoolStore?.token_store_1?.inner
    const fungibleAssetAddressToken2 = fungibleAssetPoolStore?.token_store_2?.inner

    const fungibleAssetTokenStore_1 = (await getResources(fungibleAssetAddressToken1)).find(i => i.type.includes('fungible_asset::FungibleStore'))?.data
    const fungibleAssetTokenStore_2 = (await getResources(fungibleAssetAddressToken2)).find(i => i.type.includes('fungible_asset::FungibleStore'))?.data
    const token_1_address = fungibleAssetTokenStore_1?.metadata?.inner
    const token_2_address = fungibleAssetTokenStore_2?.metadata?.inner
    // sdk.util.sumSingleBalance(balances, fungibleAssetTokenStore_1?.metadata?.inner, fungibleAssetTokenStore_1?.balance||0);
    // sdk.util.sumSingleBalance(balances, fungibleAssetTokenStore_2?.metadata?.inner, fungibleAssetTokenStore_2?.balance||0);
    if (token_1_address == CELL_fungible_asset_address) {
      const cell_balance = fungibleAssetTokenStore_1?.balance;
      sdk.util.sumSingleBalance(balances, token_1_address, cell_balance || 0);
      // //caculator CELL price
      // if (token_2_address == APT_fungible_asset_address) {
      //   const apt_balance = fungibleAssetTokenStore_2?.balance;
      //   const cell_price = (new BigNumber(apt_balance)).div(new BigNumber(cell_balance)).toNumber() * aptosPrice
      // }

    } else if (token_2_address == CELL_fungible_asset_address) {
      const cell_balance = fungibleAssetTokenStore_2?.balance;
      sdk.util.sumSingleBalance(balances, token_2_address, cell_balance || 0);

    }

    return balances;

  }


}
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "Counts the lamports in each coin container in the Cellena contract account.",
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
      let cellBlanaces = await _getCELLbalances();
      sdk.util.mergeBalances(balances, cellBlanaces)
      return transformBalances("aptos", balances);
    }
  }
}