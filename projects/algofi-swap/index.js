const sdk = require('@defillama/sdk')
const { toUSDTBalances } = require('../helper/balances')
const { get } = require('../helper/http')
const { getAppGlobalState, getAssetInfo, } = require("../helper/algorand");
const { appDictionary, marketStrings } = require('../algofi/utils')
const { transformBalances } = require('../helper/portedTokens')

const chain = 'algorand'

const fixedValueStakingContracts = ["TINYMAN11_STBL_USDC_LP_STAKING", "ALGOFI-STBL-USDC-LP"]
const singleSideStakingContracts = ["DEFLY", "STBL", "OPUL"]
const variableValueStakingContracts = [
  "ALGOFI-STBL-ALGO-LP",
]

const stakingContractsV1 = fixedValueStakingContracts.concat(variableValueStakingContracts).concat(singleSideStakingContracts)
const bankStakingContractsV2 = ["AF-BANK-USDC-STANDARD", "AF-BANK-USDt-STANDARD"]

const appDictionary1 = {
  "STAKING_CONTRACTS": {
    "STBL": {
      "decimals": 6,
      "assetId": 465865291,
      "appId": 482608867,
    },
    "AF-USDC-STBL-NANO-SUPER-STAKING": {
      "decimals": 6,
      "appId": 705657303,
      "poolAppId": 658337046,
    },
    "TINYMAN11_STBL_USDC_LP_STAKING": {
      "decimals": 6,
      "appId": 553866305,
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
    "AF-XET-STBL-75BP-STAKING": {
      "appId": 635812850,
      "poolAppId": 635256627,
      "decimals": 6,
    },
    "AF-GOBTC-STBL-25BP-STAKING": {
      "appId": 635860537,
      "poolAppId": 635846127,
      "decimals": 6
    },
    "AF-GOETH-STBL-25BP-STAKING": {
      "appId": 635864509,
      "poolAppId": 635853824,
      "decimals": 6
    },
    "AF-OPUL-STBL-75BP-STAKING": {
      "appId": 637793356,
      "poolAppId": 637801923,
      "decimals": 6
    },
    "AF-DEFLY-STBL-75BP-STAKING": {
      "appId": 639747119,
      "poolAppId": 624956175,
      "decimals": 6
    },
    "AF-NANO-USDC-STBL-5BP-STAKING": {
      "appId": 661192413,
      "poolAppId": 658337046,
      "decimals": 6
    },
    "AF-NANO-USDT-STBL-5BP-STAKING": {
      "appId": 661199805,
      "poolAppId": 659677335,
      "decimals": 6
    },
    "AF-NANO-USDT-USDC-5BP-STAKING": {
      "appId": 661207804,
      "poolAppId": 659678644,
      "decimals": 6
    },
    "AF-TINY-STBL-75BP-STAKING": {
      "appId": 647757513,
      "poolAppId": 624950291,
      "decimals": 6
    },
    "AF-ZONE-STBL-75BP-STAKING": {
      "appId": 647785158,
      "poolAppId": 647799801,
      "decimals": 6
    },
    "AF-GOMINT-STBL-25BP-STAKING": {
      "appId": 764406975,
      "poolAppId": 764420932,
      "decimals": 6
    },
    "DEFLY": {
      "appId": 641499935,
      "assetId": 470842789,
      "decimals": 6
    },
    "OPUL": {
      "appId": 674526408,
      "assetId": 287867876,
      "decimals": 10
    },
    "AF-BANK-USDC-STANDARD": {
      "appId": 821882730,
      "assetId": 818182311,
      "marketAppId": 818182048,
      "decimals": 6,
      "oracleFieldName": "price"

    },
    "AF-BANK-USDt-STANDARD": {
      "appId": 821882927,
      "assetId": 818190568,
      "marketAppId": 818190205,
      "decimals": 6,
      "oracleFieldName": "price",
    },
  }
}

function getMarketSupply(assetName, appGlobalState, prices, appDictionary) {
  let underlyingCash = ((assetName === "STBL") || (assetName === "vALGO")) ? appGlobalState[marketStrings.active_collateral] : appGlobalState[marketStrings.underlying_cash]
  let supplyUnderlying = underlyingCash - appGlobalState[marketStrings.underlying_reserves]
  supplyUnderlying /= Math.pow(10, appDictionary[assetName]["decimals"])

  return supplyUnderlying * prices[assetName]
}

async function stakingV1() {
  let lpCirculations = {}

  let prices = {
    "TINYMAN11_STBL_USDC_LP_STAKING": 2,
    "ALGOFI-STBL-USDC-LP": 2,
  }

  for (const contractName of variableValueStakingContracts) {
    let contractState = await getAppGlobalState(
      appDictionary["STAKING_CONTRACTS"][contractName]["poolAppId"]
    )
    lpCirculations[contractName] = contractState[marketStrings.lp_circulation] / 1000000
  }

  let poolSnapshots = await get("https://api.algofi.org/pools")
  let assetSnapshots = await get("https://api.algofi.org/assets")

  for (const poolSnapshot of poolSnapshots) {
    for (const contractName of variableValueStakingContracts) {
      if (poolSnapshot.app_id == appDictionary["STAKING_CONTRACTS"][contractName]["poolAppId"]) {
        prices[contractName] = poolSnapshot.tvl / lpCirculations[contractName]
      }
    }
  }

  for (const assetSnapshot of assetSnapshots) {
    for (const contractName of singleSideStakingContracts) {
      if (assetSnapshot.asset_id == appDictionary["STAKING_CONTRACTS"][contractName]["assetId"]) {
        prices[contractName] = assetSnapshot.price
      }
    }
  }

  let staked = 0
  for (const contractName of stakingContractsV1) {
    let appGlobalState = await getAppGlobalState(appDictionary["STAKING_CONTRACTS"][contractName]["appId"])
    staked += getMarketSupply(contractName, appGlobalState, prices, appDictionary["STAKING_CONTRACTS"])
  }

  return toUSDTBalances(staked)
}

async function stakingV2() {
  let totalStaked = 0
  for (const contractName of bankStakingContractsV2) {
    let stakingAppGlobalState = await getAppGlobalState(appDictionary["STAKING_CONTRACTS"][contractName]["appId"])
    let marketAppGlobalState = await getAppGlobalState(appDictionary["STAKING_CONTRACTS"][contractName]["marketAppId"])

    let bAssetStaked = stakingAppGlobalState[marketStrings.total_staked] / 1000000
    let bAssetToUnderlyingExchange = marketAppGlobalState[marketStrings.b_asset_to_underlying_exchange_rate] / 1000000000
    let underlyingStaked = bAssetStaked * bAssetToUnderlyingExchange

    let oracleState = await getAppGlobalState(marketAppGlobalState[marketStrings.oracle_app_id])

    let oraclePriceFieldName = appDictionary["STAKING_CONTRACTS"][contractName]["oracleFieldName"]
    let oraclePrice = oracleState[oraclePriceFieldName] / 1000000

    let stakedUsd = underlyingStaked * oraclePrice

    totalStaked += stakedUsd
  }
  return toUSDTBalances(totalStaked)
}

const blacklistedTokens = [
  '465865291',  // STBL
  '841126810',  // STBL2
]

async function dex() {
  let lpTokens = (await get("https://api.algofi.org/ammLPTokens?network=MAINNET")).map(i => i.asset_id);
  // let lpTokens = (await get("https://api.algofi.org/pools?network=MAINNET")).map(i => i.lp_asset_id);
  lpTokens = [...new Set(lpTokens)]
  const lpData = await Promise.all(lpTokens.map(getAssetInfo))
  const balances = {}
  lpData.forEach(({ assets }) => {
    Object.values(assets).forEach(i => {
      if (blacklistedTokens.includes(i['asset-id'])) return;
      sdk.util.sumSingleBalance(balances, i['asset-id'], i.amount)
    })
  })
  return transformBalances(chain, balances)
}

async function staking() {
  return {}
}

module.exports = {
  timetravel: false,
  algorand: {
    tvl: dex,
    staking
    // staking: sdk.util.sumChainTvls([stakingV1, stakingV2])
  }
}
// node test.js projects/algofi-swap/index.js