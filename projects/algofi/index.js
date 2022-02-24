const algosdk = require("algosdk")
const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('../helper/balances')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const retry = require("async-retry");
const axios = require("axios");

const marketStrings = {
    underlying_cash : "uc",
    underlying_borrowed : "ub",
    underlying_reserves : "ur",
    active_collateral : "acc",
    oracle_price_scale_factor: "ops",
    lp_circulation: "lc"
}

const orderedAssets = ["ALGO", "STBL", "USDC", "goBTC", "goETH"]
const stakingContracts = ["STBL", "TINYMAN11_STBL_USDC_LP_STAKING", "ALGOFI-STBL-USDC-LP", "ALGOFI-STBL-ALGO-LP"]

const assetDictionary = {
    "ALGO": {
        "decimals": 6,
        "marketAppId": 465814065,
        "oracleAppId": 531724540,
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
        "oracleAppId": 531725044,
        "oracleFieldName": "latest_twap_price"
    },
    "goETH": {
        "decimals": 8,
        "marketAppId": 465814222,
        "oracleAppId": 531725449,
        "oracleFieldName": "latest_twap_price"
    },
    "STBL": {
        "decimals": 6,
        "marketAppId": 465814278,
        "oracleAppId": 451327550,
        "oracleFieldName": "price"
    },
    "STAKING_CONTRACTS": {
        "STBL": {
            "decimals": 6,
            "marketAppId": 482608867,
        },
        "TINYMAN11_STBL_USDC_LP_STAKING" : {
            "decimals": 6,
            "marketAppId" : 553866305,
        },
        "ALGOFI-STBL-USDC-LP": {
            "marketAppId": 611867642,
            "decimals": 6,
        },
        "ALGOFI-STBL-ALGO-LP": {
            "poolAppId": 607645439,
            "marketAppId": 611801333,
            "decimals": 6,
        }
    }
}


async function getGlobalMarketState(algodClient, marketId) {
  let response = await algodClient.getApplicationByID(marketId).do()
  let results = {}
  response.params["global-state"].forEach(x => {
    let decodedKey =  Buffer.from(x.key, 'base64').toString('binary')
    results[decodedKey] = x.value.uint
  })

  return results
}

async function getPrices(algodClient, assetDictionary, orderedAssets) {
  let prices = {}
  for (const assetName of orderedAssets) {
    let response = await algodClient.getApplicationByID(assetDictionary[assetName]["oracleAppId"]).do()
    for (const y of response.params["global-state"]) {
      let decodedKey = Buffer.from(y.key, 'base64').toString('binary')
      if (decodedKey === assetDictionary[assetName]["oracleFieldName"]) {
        prices[assetName] = y.value.uint / 1000000
      }
    }
  }

  return prices
}

function getMarketSupply(assetName, marketGlobalState, prices, assetDictionary) {
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

async function borrowed() {
    let client = new algosdk.Algodv2("", "https://algoexplorerapi.io/", "")
    let prices = await getPrices(client, assetDictionary, orderedAssets)

    borrow = 0

    for (const assetName of orderedAssets) {
        marketGlobalState = await getGlobalMarketState(client, assetDictionary[assetName]["marketAppId"])
        borrow += getMarketBorrow(assetName, marketGlobalState, prices, assetDictionary)
    }

    return toUSDTBalances(borrow)
}

async function supply() {
    let client = new algosdk.Algodv2("", "https://algoexplorerapi.io/", "")
    let prices = await getPrices(client, assetDictionary, orderedAssets)

    supply = 0
    for (const assetName of orderedAssets) {
        marketGlobalState = await getGlobalMarketState(client, assetDictionary[assetName]["marketAppId"])
        assetTvl = getMarketSupply(assetName, marketGlobalState, prices, assetDictionary)
        supply += assetTvl
    }

    return toUSDTBalances(supply)
}

async function staking() {
    let client = new algosdk.Algodv2("", "https://algoexplorerapi.io/", "")

    let algoStblLpContractState = await getGlobalMarketState(
        client,
        assetDictionary['STAKING_CONTRACTS']["ALGOFI-STBL-ALGO-LP"]["poolAppId"]
    )
    let algoStblLpCirculation = algoStblLpContractState[marketStrings.lp_circulation] / 1000000

    let poolSnapshotsResponse = await fetch("https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_pool_snapshots/?network=MAINNET")
    let poolSnapshots = await poolSnapshotsResponse.json();
    let algoStblTvl = 0;
    for (const poolSnapshot of poolSnapshots['pool_snapshots']) {
        if (poolSnapshot.id == assetDictionary['STAKING_CONTRACTS']["ALGOFI-STBL-ALGO-LP"]["poolAppId"]) {
            algoStblTvl = poolSnapshot.balance_info.total_usd
            break
        }
    }

    let prices = {
         'STBL': 1,
         'TINYMAN11_STBL_USDC_LP_STAKING': 2,
         'ALGOFI-STBL-USDC-LP': 2,
         'ALGOFI-STBL-ALGO-LP': algoStblTvl / algoStblLpCirculation,
    }

    staked = 0
    for (const contractName of stakingContracts) {
        marketGlobalState = await getGlobalMarketState(client, assetDictionary['STAKING_CONTRACTS'][contractName]["marketAppId"])
        staked += getMarketSupply(contractName, marketGlobalState, prices, assetDictionary['STAKING_CONTRACTS'])
    }


    return toUSDTBalances(staked)
}

async function dex() {
    const response = (
        await retry(
          async (bail) =>
            await axios.get("https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_protocol_snapshot/?network=MAINNET")
        )
      ).data.asset_snapshots[0].tvl;
    return toUSDTBalances(response)
}
module.exports = {
    algorand: {
        tvl: sdk.util.sumChainTvls([supply, dex]),
        borrowed,
        staking
    }
}
// node test.js projects/algofi/index.js