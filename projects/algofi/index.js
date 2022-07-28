const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http')
const retry = require("async-retry");
const axios = require("axios");
const { lookupApplications, } = require("../helper/algorand");

const marketStrings = {
    underlying_cash : "uc",
    underlying_borrowed : "ub",
    underlying_reserves : "ur",
    active_collateral : "acc",
    oracle_price_scale_factor: "ops",
    lp_circulation: "lc"
}

const orderedAssets = ["ALGO", "STBL", "USDC", "goBTC", "goETH", "vALGO"]
const fixedValueStakingContracts = ["TINYMAN11_STBL_USDC_LP_STAKING", "ALGOFI-STBL-USDC-LP"]
const singleSideStakingContracts = ["DEFLY", "STBL", "OPUL"]
const variableValueStakingContracts = ["ALGOFI-STBL-ALGO-LP", "AF-XET-STBL-75BP-STAKING", "AF-GOBTC-STBL-25BP-STAKING", "AF-GOETH-STBL-25BP-STAKING", "AF-OPUL-STBL-75BP-STAKING",
                                        "AF-DEFLY-STBL-75BP-STAKING", "AF-NANO-USDC-STBL-5BP-STAKING", "AF-NANO-USDT-STBL-5BP-STAKING", "AF-NANO-USDT-USDC-5BP-STAKING",
                                        "AF-USDC-STBL-NANO-SUPER-STAKING", "AF-ZONE-STBL-75BP-STAKING", "AF-TINY-STBL-75BP-STAKING", "AF-GOMINT-STBL-25BP-STAKING"]
const stakingContracts = fixedValueStakingContracts.concat(variableValueStakingContracts).concat(singleSideStakingContracts)

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
    "vALGO": {
        "decimals": 6,
        "marketAppId": 465814318,
        "oracleAppId": 531724540,
        "oracleFieldName": "latest_twap_price",
    },
    "STAKING_CONTRACTS": {
        "STBL": {
            "decimals": 6,
            "assetId": 465865291,
            "marketAppId": 482608867,
        },
        "AF-USDC-STBL-NANO-SUPER-STAKING" : {
            "decimals": 6,
            "marketAppId" : 705657303,
            "poolAppId": 658337046,
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
        },
        "AF-XET-STBL-75BP-STAKING" : {
            "marketAppId" : 635812850,
            "poolAppId": 635256627,
            "decimals": 6,
        },
        "AF-GOBTC-STBL-25BP-STAKING" : {
            "marketAppId" : 635860537,
            "poolAppId": 635846127,
            "decimals": 6
        },
        "AF-GOETH-STBL-25BP-STAKING" : {
            "marketAppId" : 635864509,
            "poolAppId": 635853824,
            "decimals": 6
        },
        "AF-OPUL-STBL-75BP-STAKING" : {
            "marketAppId" : 637793356,
            "poolAppId": 637801923,
            "decimals": 6
        },
        "AF-DEFLY-STBL-75BP-STAKING" : {
            "marketAppId" : 639747119,
            "poolAppId": 624956175,
            "decimals": 6
        },
        "AF-NANO-USDC-STBL-5BP-STAKING" : {
            "marketAppId" : 661192413,
            "poolAppId": 658337046,
            "decimals": 6
        },
        "AF-NANO-USDT-STBL-5BP-STAKING" : {
            "marketAppId" : 661199805,
            "poolAppId": 659677335,
            "decimals": 6
        },
        "AF-NANO-USDT-USDC-5BP-STAKING" : {
            "marketAppId" : 661207804,
            "poolAppId": 659678644,
            "decimals": 6
        },
        "AF-TINY-STBL-75BP-STAKING" : {
            "marketAppId" : 647757513,
            "poolAppId": 624950291,
            "decimals": 6
        },
        "AF-ZONE-STBL-75BP-STAKING" : {
            "marketAppId" : 647785158,
            "poolAppId": 647799801,
            "decimals": 6
        },
        "AF-GOMINT-STBL-25BP-STAKING" : {
            "marketAppId" : 764406975,
            "poolAppId": 764420932,
            "decimals": 6
        },
        "DEFLY" : {
            "marketAppId" : 641499935,
            "assetId": 470842789,
            "decimals": 6
        },
        "OPUL" : {
            "marketAppId" : 674526408,
            "assetId": 287867876,
            "decimals": 10
        }
    }
}


async function getGlobalMarketState(marketId) {
  let response = await lookupApplications(marketId);
  let results = {}
  response.application.params["global-state"].forEach(x => {
    let decodedKey =  Buffer.from(x.key, 'base64').toString('binary')
    results[decodedKey] = x.value.uint
  })

  return results
}

async function getPrices(assetDictionary, orderedAssets) {
  let prices = {}
  for (const assetName of orderedAssets) {
    let response = await lookupApplications(assetDictionary[assetName]["oracleAppId"])
    for (const y of response.application.params["global-state"]) {
      let decodedKey = Buffer.from(y.key, 'base64').toString('binary')
      if (decodedKey === assetDictionary[assetName]["oracleFieldName"]) {
        prices[assetName] = y.value.uint / 1000000
      }
    }
  }

  return prices
}

function getMarketSupply(assetName, marketGlobalState, prices, assetDictionary) {
    let underlyingCash = ((assetName === "STBL") || (assetName === "vALGO"))  ? marketGlobalState[marketStrings.active_collateral] : marketGlobalState[marketStrings.underlying_cash]
    let supplyUnderlying = underlyingCash - marketGlobalState[marketStrings.underlying_reserves]
    supplyUnderlying /= Math.pow(10, assetDictionary[assetName]['decimals'])

    return supplyUnderlying * prices[assetName]
}

function getMarketBorrow(assetName, marketGlobalState, prices) {
    let borrowUnderlying = marketGlobalState[marketStrings.underlying_borrowed]
    borrowUnderlying /= Math.pow(10, assetDictionary[assetName]['decimals'])

    return borrowUnderlying * prices[assetName]
}

async function borrowed() {
    let prices = await getPrices(assetDictionary, orderedAssets)

    let borrow = 0

    for (const assetName of orderedAssets) {
        let marketGlobalState = await getGlobalMarketState(assetDictionary[assetName]["marketAppId"])
        borrow += getMarketBorrow(assetName, marketGlobalState, prices, assetDictionary)
    }

    return toUSDTBalances(borrow)
}

async function supply() {
    let prices = await getPrices(assetDictionary, orderedAssets)

    let supply = 0
    for (const assetName of orderedAssets) {
        let marketGlobalState = await getGlobalMarketState(assetDictionary[assetName]["marketAppId"])
        let assetTvl = getMarketSupply(assetName, marketGlobalState, prices, assetDictionary)
        supply += assetTvl
    }

    return toUSDTBalances(supply)
}

async function staking() {
    let lpCirculations = {}

    let prices = {
             'TINYMAN11_STBL_USDC_LP_STAKING': 2,
             'ALGOFI-STBL-USDC-LP': 2,
    }

    for (const contractName of variableValueStakingContracts) {
        let contractState = await getGlobalMarketState(
            assetDictionary['STAKING_CONTRACTS'][contractName]["poolAppId"]
        )
        lpCirculations[contractName] = contractState[marketStrings.lp_circulation] / 1000000
    }

    let poolSnapshots = await get("https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_pool_snapshots/?network=MAINNET")
    let assetSnapshots = await get("https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_asset_snapshots/?network=MAINNET")

    for (const poolSnapshot of poolSnapshots.pool_snapshots) {
        for (const contractName of variableValueStakingContracts) {
            if (poolSnapshot.id == assetDictionary['STAKING_CONTRACTS'][contractName]["poolAppId"]) {
                prices[contractName] = poolSnapshot.balance_info.total_usd / lpCirculations[contractName]
            }
        }
    }

    for (const assetSnapshot of assetSnapshots.asset_snapshots) {
        for (const contractName of singleSideStakingContracts) {
            if (assetSnapshot.id == assetDictionary['STAKING_CONTRACTS'][contractName]["assetId"]) {
                prices[contractName] = assetSnapshot.price
            }
        }
    }

    let staked = 0
    for (const contractName of stakingContracts) {
        let marketGlobalState = await getGlobalMarketState(assetDictionary['STAKING_CONTRACTS'][contractName]["marketAppId"])
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
      ).data.protocol_snapshot.tvl.total_usd;
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