const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('../helper/balances')
const axios = require("axios");
const { lookupApplications, } = require("../helper/algorand");

const marketStrings = {
    underlying_cash : "uc",
    underlying_borrowed : "ub",
    underlying_reserves : "ur",
    active_collateral : "acc",
    active_collateral_v2 : "ac",
    lp_circulation: "lc",
    bank_to_underlying_exchange: "bt",
    b_asset_circulation: "bac",
    oracle_price_field_name: "opfn",
    oracle_price_scale_factor: "ops",
    oracle_app_id: "oai",
}

const orderedAssets = [
    "ALGO",
    "STBL",
    "USDC",
    "goBTC",
    "goETH",
    "vALGO",
    "vALGO2",
    "USDT",
    "STBL2",
    "AF-NANO-BSTBL2-BUSDC",
    "AF-BSTBL2-BALGO",
    "AF-BSTBL2-BgoBTC",
    "AF-BSTBL2-BgoETH"]


const appDictionary = {
    "ALGO": {
        "decimals": 6,
        "appIds": [465814065, 818179346],
        "oracleAppId": 531724540,
        "oracleFieldName": "latest_twap_price"
    },
    "USDC": {
        "decimals": 6,
        "appIds": [465814103, 818182048],
        "oracleAppId": 451327550,
        "oracleFieldName": "price"
    },
    "USDT": {
        "decimals": 6,
        "appIds": [818190205],
        "oracleAppId": 451327550,
        "oracleFieldName": "price"
    },
    "goBTC": {
        "decimals": 8,
        "appIds": [465814149, 818183964],
        "oracleAppId": 531725044,
        "oracleFieldName": "latest_twap_price"
    },
    "goETH": {
        "decimals": 8,
        "appIds": [465814222, 818188286],
        "oracleAppId": 531725449,
        "oracleFieldName": "latest_twap_price"
    },
    "STBL": {
        "decimals": 6,
        "appIds": [465814278],
        "oracleAppId": 451327550,
        "oracleFieldName": "price"
    },
    "STBL2": {
        "decimals": 6,
        "appIds": [841145020],
        "oracleAppId": 451327550,
        "oracleFieldName": "price"
    },
    "vALGO": {
        "decimals": 6,
        "appIds": [465814318],
        "oracleAppId": 531724540,
        "oracleFieldName": "latest_twap_price",
    },
    "vALGO2": {
        "decimals": 6,
        "appIds": [879935316],
        "oracleAppId": 531724540,
        "oracleFieldName": "latest_twap_price",
    },
    "AF-NANO-BSTBL2-BUSDC": {
        "decimals": 6,
        "appIds": [841194726],
        "oracleAppId": 841179855,
        "oracleFieldName": "latest_twap_price"
    },
    "AF-BSTBL2-BALGO": {
        "decimals": 6,
        "appIds": [856183130],
        "oracleAppId": 855726305,
        "oracleFieldName": "latest_twap_price"
    },
    "AF-BSTBL2-BgoBTC": {
        "decimals": 6,
        "appIds": [870271921],
        "oracleAppId": 870267658,
        "oracleFieldName": "latest_twap_price"
    },
    "AF-BSTBL2-BgoETH": {
        "decimals": 6,
        "appIds": [870275741],
        "oracleAppId": 870268282,
        "oracleFieldName": "latest_twap_price"
    },
    "STAKING_CONTRACTS": {
        "STBL": {
            "decimals": 6,
            "assetId": 465865291,
            "appId": 482608867,
        },
        "AF-USDC-STBL-NANO-SUPER-STAKING" : {
            "decimals": 6,
            "appId" : 705657303,
            "poolAppId": 658337046,
        },
        "TINYMAN11_STBL_USDC_LP_STAKING" : {
            "decimals": 6,
            "appId" : 553866305,
        },
        "ALGOFI-STBL-USDC-LP": {
            "appId": 611867642,
            "decimals": 6,
        },
        "ALGOFI-STBL-ALGO-LP": {
            "poolAppId": 607645439,
            "appId": 611801333,
            "decimals": 6,
        },
        "AF-XET-STBL-75BP-STAKING" : {
            "appId" : 635812850,
            "poolAppId": 635256627,
            "decimals": 6,
        },
        "AF-GOBTC-STBL-25BP-STAKING" : {
            "appId" : 635860537,
            "poolAppId": 635846127,
            "decimals": 6
        },
        "AF-GOETH-STBL-25BP-STAKING" : {
            "appId" : 635864509,
            "poolAppId": 635853824,
            "decimals": 6
        },
        "AF-OPUL-STBL-75BP-STAKING" : {
            "appId" : 637793356,
            "poolAppId": 637801923,
            "decimals": 6
        },
        "AF-DEFLY-STBL-75BP-STAKING" : {
            "appId" : 639747119,
            "poolAppId": 624956175,
            "decimals": 6
        },
        "AF-NANO-USDC-STBL-5BP-STAKING" : {
            "appId" : 661192413,
            "poolAppId": 658337046,
            "decimals": 6
        },
        "AF-NANO-USDT-STBL-5BP-STAKING" : {
            "appId" : 661199805,
            "poolAppId": 659677335,
            "decimals": 6
        },
        "AF-NANO-USDT-USDC-5BP-STAKING" : {
            "appId" : 661207804,
            "poolAppId": 659678644,
            "decimals": 6
        },
        "AF-TINY-STBL-75BP-STAKING" : {
            "appId" : 647757513,
            "poolAppId": 624950291,
            "decimals": 6
        },
        "AF-ZONE-STBL-75BP-STAKING" : {
            "appId" : 647785158,
            "poolAppId": 647799801,
            "decimals": 6
        },
        "AF-GOMINT-STBL-25BP-STAKING" : {
            "appId" : 764406975,
            "poolAppId": 764420932,
            "decimals": 6
        },
        "DEFLY" : {
            "appId" : 641499935,
            "assetId": 470842789,
            "decimals": 6
        },
        "OPUL" : {
            "appId" : 674526408,
            "assetId": 287867876,
            "decimals": 10
        },
        "AF-BANK-USDC-STANDARD" : {
            "appId" : 821882730,
            "assetId" : 818182311,
            "marketAppId": 818182048,
            "decimals": 6,
            "oracleFieldName": "price"

        },
        "AF-BANK-USDt-STANDARD" : {
            "appId" : 821882927,
            "assetId" : 818190568,
            "marketAppId": 818190205,
            "decimals": 6,
            "oracleFieldName": "price",
        },
    }
}


async function getAppGlobalState(marketId) {
  let response = await lookupApplications(marketId);
  let results = {}
  response.application.params["global-state"].forEach(x => {
    let decodedKey =  Buffer.from(x.key, "base64").toString("binary")
    results[decodedKey] = x.value.uint
  })

  return results
}

async function getPrices(marketDictionary, orderedAssets) {
  let prices = {}
  for (const assetName of orderedAssets) {
    let response = await lookupApplications(marketDictionary[assetName]["oracleAppId"])
    for (const y of response.application.params["global-state"]) {
      let decodedKey = Buffer.from(y.key, 'base64').toString('binary')
      if (decodedKey === marketDictionary[assetName]["oracleFieldName"]) {
        prices[assetName] = y.value.uint / 1000000
      }
    }
  }

  return prices
}

function getMarketSupply(assetName, appGlobalState, prices, appDictionary) {
    let underlyingCash = 0;
    if (assetName == "vALGO2") {
        underlyingCash = appGlobalState[marketStrings.active_collateral_v2];
    } else if ((assetName === "STBL") || (assetName === "vALGO")) {
        underlyingCash = appGlobalState[marketStrings.active_collateral];
    } else {
        underlyingCash = appGlobalState[marketStrings.underlying_cash];
    }
    let supplyUnderlying = underlyingCash - appGlobalState[marketStrings.underlying_reserves]
    supplyUnderlying /= Math.pow(10, appDictionary[assetName]["decimals"])

    return supplyUnderlying * prices[assetName]
}

function getMarketBorrow(assetName, appGlobalState, prices) {
    let borrowUnderlying = appGlobalState[marketStrings.underlying_borrowed]
    borrowUnderlying /= Math.pow(10, appDictionary[assetName]["decimals"])

    return borrowUnderlying * prices[assetName]
}

async function borrowed() {
    let prices = await getPrices(appDictionary, orderedAssets)

    let borrow = 0

    for (const assetName of orderedAssets) {
        for (const id of appDictionary[assetName]["appIds"]) {
            let appGlobalState = await getAppGlobalState(id)
            borrow += getMarketBorrow(assetName, appGlobalState, prices)
        }
    }

    return toUSDTBalances(borrow)
}

async function supply() {
    let prices = await getPrices(appDictionary, orderedAssets)

    let supply = 0
    for (const assetName of orderedAssets) {
        for (const id of appDictionary[assetName]["appIds"]) {
            let appGlobalState = await getAppGlobalState(id)
            let assetTvl = getMarketSupply(assetName, appGlobalState, prices, appDictionary)
            supply += assetTvl
        }
    }

    return toUSDTBalances(supply)
}

module.exports = {
    algorand: {
        tvl: supply,
        borrowed
    }
}
// node test.js projects/algofi/index.js
