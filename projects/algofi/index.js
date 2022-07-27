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

const orderedAssets = ["ALGO", "STBL", "USDC", "goBTC", "goETH", "vALGO", "USDT"]
const fixedValueStakingContracts = ["TINYMAN11_STBL_USDC_LP_STAKING", "ALGOFI-STBL-USDC-LP"]
const singleSideStakingContracts = ["DEFLY", "STBL", "OPUL"]
const variableValueStakingContracts = ["ALGOFI-STBL-ALGO-LP", "AF-XET-STBL-75BP-STAKING", "AF-GOBTC-STBL-25BP-STAKING", "AF-GOETH-STBL-25BP-STAKING", "AF-OPUL-STBL-75BP-STAKING",
                                        "AF-DEFLY-STBL-75BP-STAKING", "AF-NANO-USDC-STBL-5BP-STAKING", "AF-NANO-USDT-STBL-5BP-STAKING", "AF-NANO-USDT-USDC-5BP-STAKING",
                                        "AF-USDC-STBL-NANO-SUPER-STAKING", "AF-ZONE-STBL-75BP-STAKING", "AF-TINY-STBL-75BP-STAKING" ]
const stakingContracts = fixedValueStakingContracts.concat(variableValueStakingContracts).concat(singleSideStakingContracts)

const marketDictionary = {
    "ALGO": {
        "decimals": 6,
        "marketAppIds": [465814065, 818179346],
        "oracleAppId": 531724540,
        "oracleFieldName": "latest_twap_price"
    },
    "USDC": {
        "decimals": 6,
        "marketAppIds": [465814103, 818182048],
        "oracleAppId": 451327550,
        "oracleFieldName": "price"
    },
    "USDT": {
        "decimals": 6,
        "marketAppIds": [818190205],
        "oracleAppId": 451327550,
        "oracleFieldName": "price"
    },
    "goBTC": {
        "decimals": 8,
        "marketAppIds": [465814149, 818183964],
        "oracleAppId": 531725044,
        "oracleFieldName": "latest_twap_price"
    },
    "goETH": {
        "decimals": 8,
        "marketAppIds": [465814222, 818188286],
        "oracleAppId": 531725449,
        "oracleFieldName": "latest_twap_price"
    },
    "STBL": {
        "decimals": 6,
        "marketAppIds": [465814278],
        "oracleAppId": 451327550,
        "oracleFieldName": "price"
    },
    "vALGO": {
        "decimals": 6,
        "marketAppIds": [465814318],
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


async function getGlobalMarketState(indexerClient, marketId) {
  let response = await indexerClient.lookupApplications(marketId).do();
  let results = {}
  response.application.params["global-state"].forEach(x => {
    let decodedKey =  Buffer.from(x.key, 'base64').toString('binary')
    results[decodedKey] = x.value.uint
  })

  return results
}

async function getPrices(indexerClient, marketDictionary, orderedAssets) {
  let prices = {}
  for (const assetName of orderedAssets) {
    let response = await indexerClient.lookupApplications(marketDictionary[assetName]["oracleAppId"]).do()
    for (const y of response.application.params["global-state"]) {
      let decodedKey = Buffer.from(y.key, 'base64').toString('binary')
      if (decodedKey === marketDictionary[assetName]["oracleFieldName"]) {
        prices[assetName] = y.value.uint / 1000000
      }
    }
  }

  return prices
}

function getMarketSupply(assetName, marketGlobalState, prices, marketDictionary) {
    underlyingCash = ((assetName === "STBL") || (assetName === "vALGO"))  ? marketGlobalState[marketStrings.active_collateral] : marketGlobalState[marketStrings.underlying_cash]
    supplyUnderlying = underlyingCash - marketGlobalState[marketStrings.underlying_reserves]
    supplyUnderlying /= Math.pow(10, marketDictionary[assetName]['decimals'])

    return supplyUnderlying * prices[assetName]
}

function getMarketBorrow(assetName, marketGlobalState, prices) {
    borrowUnderlying = marketGlobalState[marketStrings.underlying_borrowed]
    borrowUnderlying /= Math.pow(10, marketDictionary[assetName]['decimals'])

    return borrowUnderlying * prices[assetName]
}

async function borrowed() {
    let client = new algosdk.Indexer("", "https://algoindexer.algoexplorerapi.io/", "")
    let prices = await getPrices(client, marketDictionary, orderedAssets)

    borrow = 0

    for (const assetName of orderedAssets) {
        for (const id of marketDictionary[assetName]["marketAppIds"]) {
            marketGlobalState = await getGlobalMarketState(client, id)
            borrow += getMarketBorrow(assetName, marketGlobalState, prices, marketDictionary)
        }
    }

    return toUSDTBalances(borrow)
}

async function supply() {
    let client = new algosdk.Indexer("", "https://algoindexer.algoexplorerapi.io/", "")
    let prices = await getPrices(client, marketDictionary, orderedAssets)

    supply = 0
    for (const assetName of orderedAssets) {
        for (const id of marketDictionary[assetName]["marketAppIds"]) {
            marketGlobalState = await getGlobalMarketState(client, id)
            assetTvl = getMarketSupply(assetName, marketGlobalState, prices, marketDictionary)
            supply += assetTvl
        }
    }

    return toUSDTBalances(supply)
}

async function staking() {
    let client = new algosdk.Indexer("", "https://algoindexer.algoexplorerapi.io/", "")

    let lpCirculations = {}

    let prices = {
             'TINYMAN11_STBL_USDC_LP_STAKING': 2,
             'ALGOFI-STBL-USDC-LP': 2,
    }

    for (const contractName of variableValueStakingContracts) {
        let contractState = await getGlobalMarketState(
            client,
            marketDictionary['STAKING_CONTRACTS'][contractName]["poolAppId"]
        )
        lpCirculations[contractName] = contractState[marketStrings.lp_circulation] / 1000000
    }

    let poolSnapshotsResponse = await fetch("https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_pool_snapshots/?network=MAINNET")
    let assetSnapshotsResponse = await fetch("https://thf1cmidt1.execute-api.us-east-2.amazonaws.com/Prod/amm_asset_snapshots/?network=MAINNET")

    let poolSnapshots = await poolSnapshotsResponse.json()
    for (const poolSnapshot of poolSnapshots.pool_snapshots) {
        for (const contractName of variableValueStakingContracts) {
            if (poolSnapshot.id == marketDictionary['STAKING_CONTRACTS'][contractName]["poolAppId"]) {
                prices[contractName] = poolSnapshot.balance_info.total_usd / lpCirculations[contractName]
            }
        }
    }

    let assetSnapshots = await assetSnapshotsResponse.json()
    for (const assetSnapshot of assetSnapshots.asset_snapshots) {
        for (const contractName of singleSideStakingContracts) {
            if (assetSnapshot.id == marketDictionary['STAKING_CONTRACTS'][contractName]["assetId"]) {
                prices[contractName] = assetSnapshot.price
            }
        }
    }

    staked = 0
    for (const contractName of stakingContracts) {
        marketGlobalState = await getGlobalMarketState(client, marketDictionary['STAKING_CONTRACTS'][contractName]["marketAppId"])
        staked += getMarketSupply(contractName, marketGlobalState, prices, marketDictionary['STAKING_CONTRACTS'])
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