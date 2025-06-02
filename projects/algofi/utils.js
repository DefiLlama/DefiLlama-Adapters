
const { get } = require('../helper/http')
const { getAppGlobalState, getPriceFromAlgoFiLP, } = require("../helper/chain/algorand")

let pricesCache
let snapshotsCache

const marketStrings = {
  underlying_cash: "uc",
  underlying_borrowed: "ub",
  underlying_reserves: "ur",
  active_collateral: "acc",
  active_collateral_v2: "ac",
  lp_circulation: "lc",
  bank_to_underlying_exchange: "bt",
  b_asset_circulation: "bac",
  oracle_price_field_name: "opfn",
  oracle_price_scale_factor: "ops",
  oracle_app_id: "oai",
  total_locked: "tl",
  b_asset_to_underlying_exchange_rate: "baer",
  total_staked: "ts",
}

const appDictionary = {
  "ALGO": {
    "decimals": 6,
    "appIds": [465814065, 818179346],
    "geckoId": "algorand",
  },
  "USDC": {
    "decimals": 6,
    "appIds": [465814103, 818182048],
    "geckoId": "usd-coin",
  },
  "USDT": {
    "decimals": 6,
    "appIds": [818190205],
    "geckoId": "tether",
  },
  "goBTC": {
    "decimals": 8,
    "appIds": [465814149, 818183964],
    "geckoId": "bitcoin",
  },
  "goETH": {
    "decimals": 8,
    "appIds": [465814222, 818188286],
    "geckoId": "ethereum",
  },
  "STBL": {
    "decimals": 6,
    "appIds": [465814278],
    "oracleAppId": 451327550,
    "oracleFieldName": "price",
  },
  "STBL2": {
    "decimals": 6,
    "appIds": [841145020],
    "oracleAppId": 451327550,
    "oracleFieldName": "price",
  },
  "vALGO": {
    "decimals": 6,
    "appIds": [465814318],
    "geckoId": "algorand",
  },
  "vALGO2": {
    "decimals": 6,
    "appIds": [879935316],
    "geckoId": "algorand",
  },
  "BANK": {
    "decimals": 6,
    "appIds": [900883415],
    "assetId": 900652777,
    "algofiLP": 906656179,
  },
  // "AF-NANO-BSTBL2-BUSDC": {
  //   "decimals": 6,
  //   "appIds": [841194726],
  //   "oracleAppId": 841179855,
  //   "oracleFieldName": "latest_twap_price"
  // },
  // "AF-BSTBL2-BALGO": {
  //   "decimals": 6,
  //   "appIds": [856183130],
  //   "oracleAppId": 855726305,
  //   "oracleFieldName": "latest_twap_price"
  // },
  // "AF-BSTBL2-BgoBTC": {
  //   "decimals": 6,
  //   "appIds": [870271921],
  //   "oracleAppId": 870267658,
  //   "oracleFieldName": "latest_twap_price"
  // },
  // "AF-BSTBL2-BgoETH": {
  //   "decimals": 6,
  //   "appIds": [870275741],
  //   "oracleAppId": 870268282,
  //   "oracleFieldName": "latest_twap_price"
  // },
}

async function getDexPrices() {
  let assetSnapshots = await getSnapshots()
  let prices = {}
  for (const assetSnapshot of assetSnapshots) {
    prices[assetSnapshot.asset_id] = assetSnapshot.price
  }
  return prices


  async function getSnapshots() {
    if (!snapshotsCache) snapshotsCache = _getSnapshots()
    return snapshotsCache

    async function _getSnapshots() {
      return get("https://api.algofi.org/assets")
    }
  }
}

async function getPrices() {
  if (!pricesCache) pricesCache = _getPrices()
  return pricesCache

  async function _getPrices() {
    let prices = {}
    await Promise.all(Object.entries(appDictionary).map(setPrice))
    return prices

    async function setPrice([assetName, { geckoId, decimals, oracleAppId, oracleFieldName, assetId, algofiLP, }]) {
      if (geckoId) {
        prices[assetName] = { geckoId, decimals, price: 1 }
      } else if (oracleAppId && oracleFieldName) {
        const res = await getAppGlobalState(oracleAppId)
        if (res[oracleFieldName])
          prices[assetName] = { geckoId: 'tether', decimals, price: res[oracleFieldName] / 1e6 }
      } else if (assetId && algofiLP) {
        prices[assetName] = await getPriceFromAlgoFiLP(algofiLP, assetId)
      }
    }
  }

}

module.exports = {
  appDictionary,
  marketStrings,
  getPrices,
  getDexPrices,
}