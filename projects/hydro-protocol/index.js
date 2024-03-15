const { queryContract, totalSupply } = require("../helper/chain/cosmos");
const ADDRESSES = require("../helper/coreAssets.json");
const { getClient } = require("../helper/chain/injective");
const { spotPriceFromChainPrice, spotQuantityFromChainQuantity, IndexerGrpcSpotApi } = require('@injectivelabs/sdk-ts')
const BigNumber = require("bignumber.js");
const { get } = require("../helper/http");

const hinj = "inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc"
const autoCompound = "inj1mjcg8a73904rj4w7t5qkgn0apua98n059nufma"
const hdro = "factory/inj1etz0laas6h7vemg3qtd67jpr6lh8v7xz7gfzqw/hdro"
const xhdro = "inj1qc2tw477wwuvkad0h3g78xqgwx4k8knat6vz0h"
const hdroInjMarket = "0xc8fafa1fcab27e16da20e98b4dc9dda45320418c27db80663b21edac72f3b597"

const injectiveSpotApi = new IndexerGrpcSpotApi("https://sentry.exchange.grpc-web.injective.network:443")
const injectiveClient = getClient()

async function tvl(_, _1, _2, { api }) {
  const { total_supply } = await queryContract({ chain: api.chain, contract: hinj, data: { token_info: {} } })
  const { total_bonded } = await queryContract({ chain: api.chain, contract: autoCompound, data: { state: {} } })
  const hdroInjPrice = await loadHdroInjPrice()
  const hdroLiquidity = await loadMarketHdroQuantity()

  const { total_supply: xHdroTotalSuuply } = await queryContract({ chain: api.chain, contract: xhdro, data: { token_info: {} } })
  const hdroQuantity = hdroLiquidity
    .plus(new BigNumber(xHdroTotalSuuply))

  api.add(
    ADDRESSES.injective.INJ,
    new BigNumber(total_supply)
      .plus(new BigNumber(total_bonded))
      .plus(hdroQuantity.multipliedBy(hdroInjPrice))
      .toFixed(0)
  )
}

async function loadMarketInjQuantity() {
  const orderBooks = await injectiveClient.fetchOrderbookV2(hdroInjMarket)
  let marketInjQuantity = new BigNumber(0)

  for (const buy of orderBooks.buys) {
    const price = spotPriceFromChainPrice({value: buy.price, baseDecimals: 6, quoteDecimals: 18})
    const quantity = spotQuantityFromChainQuantity({value: buy.quantity, baseDecimals: 6})
    const injValue = price.multipliedBy(quantity)
    marketInjQuantity = marketInjQuantity.plus(injValue)
  }

  return marketInjQuantity
}

async function loadMarketHdroQuantity() {
  const orderBooks = await injectiveClient.fetchOrderbookV2(hdroInjMarket)
  let marketHdroQuantity = new BigNumber(0)

  for (const sell of orderBooks.sells) {
    const quantity = spotQuantityFromChainQuantity({value: sell.quantity, baseDecimals: 6})
    marketHdroQuantity = marketHdroQuantity.plus(quantity)
  }

  return marketHdroQuantity
}

async function loadHdroInjPrice() {
  const trades = await injectiveSpotApi.fetchTrades({marketId: "0xc8fafa1fcab27e16da20e98b4dc9dda45320418c27db80663b21edac72f3b597"})
  return spotPriceFromChainPrice({ value: trades.trades[0].price, baseDecimals: 6, quoteDecimals: 18 })
}

module.exports = {
  methodology: "Liquidity on hydro-protocol",
  injective: {
    tvl,
    pool2,
  },
};