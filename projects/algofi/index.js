const algosdk = require("algosdk")
const { toUSDTBalances } = require('../helper/balances')

const marketStrings = {
    underlying_cash : "uc",
    underlying_borrowed : "ub",
    underlying_reserves : "ur",
    active_collateral : "acc",
    oracle_price_scale_factor: "ops"
}

const orderedAssets = ["ALGO", "STBL", "USDC", "goBTC", "goETH"]

const assetDictionary = {
    "ALGO": {
        "decimals": 6,
        "marketAppId": 465814065,
        "oracleAppId": 451324964,
        "oracleFieldName": "latest_twap_price"
    },
    "USDC": {
        "decimals": 6,
        "marketAppId": 465814103,
        "oracleAppId": 451327550,
        "oracleFieldName": "price"
    },
    "goBTC": {
        "decimals": 8,
        "marketAppId": 465814149,
        "oracleAppId": 451325630,
        "oracleFieldName": "latest_twap_price"
    },
    "goETH": {
        "decimals": 8,
        "marketAppId": 465814222,
        "oracleAppId": 451326395,
        "oracleFieldName": "latest_twap_price"
    },
    "STBL": {
        "decimals": 6,
        "marketAppId": 465814278,
        "oracleAppId": 451327550,
        "oracleFieldName": "price"
    },
}

async function getGlobalMarketState(algodClient, marketId) {
  let response = await algodClient.getApplicationByID(marketId).do()
  let results = {}
  response.params["global-state"].forEach(x => {
    let decodedKey = atob(x.key)
    results[decodedKey] = x.value.uint
  })

  return results
}

async function getPrices(algodClient) {
  let prices = {}
  for (const assetName of orderedAssets) {
    let response = await algodClient.getApplicationByID(assetDictionary[assetName]["oracleAppId"]).do()
    for (const y of response.params["global-state"]) {
      let decodedKey = atob(y.key)
      if (decodedKey === assetDictionary[assetName]["oracleFieldName"]) {
        prices[assetName] = y.value.uint / 1000000
      }
    }
  }

  return prices
}

function getMarketSupply(assetName, marketGlobalState, prices) {
    underlying_cash = assetName === "STBL" ? marketGlobalState[marketStrings.active_collateral] : marketGlobalState[marketStrings.underlying_cash]
    supplyUnderlying = underlying_cash - marketGlobalState[marketStrings.underlying_reserves]
    supplyUnderlying /= Math.pow(10, assetDictionary[assetName]['decimals'])

    return supplyUnderlying * prices[assetName]
}

function getMarketBorrow(assetName, marketGlobalState, prices) {
    borrowUnderlying = marketGlobalState[marketStrings.underlying_borrowed]
    borrowUnderlying /= Math.pow(10, assetDictionary[assetName]['decimals'])

    return borrowUnderlying * prices[assetName]
}

async function getTvl() {
    let client = new algosdk.Algodv2("", "https://algoexplorerapi.io/", "")
    let prices = await getPrices(client)

    let tvl = {
        supply: 0,
        borrow: 0,
    }

    for (const assetName of orderedAssets) {
        marketGlobalState = await getGlobalMarketState(client, assetDictionary[assetName]["marketAppId"])
        tvl.supply += getMarketSupply(assetName, marketGlobalState, prices)
        tvl.borrow += getMarketBorrow(assetName, marketGlobalState, prices)
    }

    return tvl
}

async function tvl() {
    tvlDict = await getTvl();
    return toUSDTBalances(tvlDict.supply + tvlDict.borrow)
}

async function borrow() {
    tvlDict = await getTvl();
    return toUSDTBalances(tvlDict.borrow)
}

async function supply() {
    tvlDict = await getTvl();
    return toUSDTBalances(tvlDict.supply)
}

module.exports = {
    algorand: {
        tvl,
        borrow,
        supply
    }
}
