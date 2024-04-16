const ADDRESSES = require("../coreAssets.json")
const { post } = require("../http")
const BigNumber = require("bignumber.js")
const { getUniqueAddresses } = require("../tokenMapping")
const { transformBalances } = require("../portedTokens")
const { sleep } = require("../utils")

const icxApiEndpoint = "https://ctz.solidwallet.io/api/v3"
const balancedDexContract = "cxa0af3165c08318e988cb30993b3048335b94af6c"
const balancedAssetManagerContract =
  "cxabea09a8c5f3efa54d0a0370b14715e6f2270591"
const balancedOracle = "cx133c6015bb29f692b12e71c1792fddf8f7014652"
const balancedPegStability = "cxa09dbb60dcb62fffbd232b6eae132d730a2aafa6"
const bnUSDcontract = "cx88fd7df7ddff82f7cc735c871dc519838cb235bb"

const networkIdentifiers = {
  "0x100.icon": "havah",
  "0x38.bsc": "bnbchain",
  "0xa86a.avax": "avalanche",
  "archway-1": "archway",
}

const LOOP = new BigNumber("1000000000000000000")

function toInt(s) {
  return parseInt(s, 16)
}

function toHex(value) {
  return new BigNumber(value).div(LOOP)
}

async function getICXBalance(address) {
  let response = await post(icxApiEndpoint, {
    jsonrpc: "2.0",
    method: "icx_getBalance",
    id: 1234,
    params: { address },
  })
  return response.result
}

async function call(address, method, params, { parseInt, parseHex } = {}) {
  let response = await post(icxApiEndpoint, {
    jsonrpc: "2.0",
    method: "icx_call",
    id: 1234,
    params: {
      to: address,
      dataType: "call",
      data: {
        method: method,
        params: params,
      },
    },
  })
  if (parseInt) response.result = toInt(response.result)
  if (parseHex) response.result = toHex(response.result)
  return response.result
}

async function sumTokens({ api, owner, owners = [], tokens = [] }) {
  if (owner) owners.push(owner)
  owner = getUniqueAddresses(owners, "icon")
  
  tokens = getUniqueAddresses(tokens, "icon")
  
  const toa = owners.map((owner) => tokens.map((t) => [t, owner])).flat()
  for (const [token, owner] of toa) {
    let balance
    if (token && token !== ADDRESSES.null)
      balance = await call(
        token,
        "balanceOf",
        { _owner: owner },
        { parseInt: true }
      )
    else balance = await getICXBalance(owner)
    await sleep(100)
    api.add(token ?? ADDRESSES.null, balance)
  }
  return transformBalances("icon", api.getBalances())
}

function sumTokensExport(params) {
  return (api) => sumTokens({ ...params, api })
}

// Get decimals of cross-chain Balanced assets in balancedAssetManagerContract
async function getDecimals() {
  const assets = await call(balancedAssetManagerContract, "getAssets", {})
  const decimals = {}
  for (const [key, tokenAddress] of Object.entries(assets)) {
    const hexDecimals = await call(tokenAddress, "decimals", {})
    const decimalValue = parseInt(hexDecimals, 16) 
    decimals[key] = Math.pow(10, decimalValue) 
  }
  return decimals
}

// Get cross-chain Balanced assets and their locked deposits
async function getExternalChainDeposits() {
  let assets
  try {
    assets = await call(balancedAssetManagerContract, "getAssets", {})
  } catch (error) {
    return []
  }

  const decimals = await getDecimals()
  const deposits = []

  for (const [tokenNetworkAddress, tokenAddress] of Object.entries(assets)) {
    let assetDepositDecimal, tokenSymbol, rateDecimal

    try {
      const assetDepositHex = await call(
        balancedAssetManagerContract,
        "getAssetDeposit",
        { tokenNetworkAddress }
      )
      assetDepositDecimal = toInt(assetDepositHex)
      tokenSymbol = await call(tokenAddress, "symbol", {})

      try {
        const priceData = await call(balancedOracle, "getPriceDataInUSD", {
          symbol: tokenSymbol,
        })
        const rateHex = priceData.rate
        rateDecimal = parseInt(rateHex, 16) / decimals[tokenNetworkAddress]
      } catch (error) {
        // console.log(
        //   `No price data available for ${tokenSymbol}, moving to Peg Stability pricing`
        // )
        const limitResponse = await call(balancedPegStability, "getLimit", {
          _address: tokenAddress,
        })
        if (limitResponse) {
          rateDecimal = 1
        } else {
          // console.log(
          //   `No balancedPegStability data available for ${tokenSymbol}, moving to DEX pricing`
          // )
          try {
            const poolId = await call(balancedDexContract, "getPoolId", {
              _token1Address: bnUSDcontract,
              _token2Address: tokenAddress,
            })
            if (poolId) {
              const basePrice = await call(
                balancedDexContract,
                "getBasePriceInQuote",
                { _id: poolId }
              )
              rateDecimal =
                parseInt(basePrice, 16) / decimals[tokenNetworkAddress]
            } else {
              console.log(
                `No pool ID found for ${tokenSymbol}, setting price to 0`
              )
              rateDecimal = 0
            }
          } catch (dexError) {
            rateDecimal = 0
          }
        }
      }

      const networkName = Object.keys(networkIdentifiers).find((key) =>
        tokenNetworkAddress.startsWith(key)
      )
      const chainName = networkIdentifiers[networkName] || "Unknown Chain"
      const tokenAmount = assetDepositDecimal / decimals[tokenNetworkAddress]
      const usdValue = tokenAmount * rateDecimal

      deposits.push({
        token: tokenSymbol,
        chain: chainName,
        tokenamount: tokenAmount,
        priceInUsd: rateDecimal,
        tvlInUsd: usdValue,
        iconchaincontract: tokenAddress,
      })
    } catch (innerError) {
      continue
    }
  }

  return deposits
}

// Compute TVL of locked Balanced assets on a specific external chain
async function computeTVL(chainName) {
  try {
    const deposits = await getExternalChainDeposits()
    let TVL = 0
    deposits.forEach((deposit) => {
      if (deposit.chain === chainName) {
        TVL += deposit.tvlInUsd
      }
    })
    return TVL
  } catch (error) {
    console.error(`Error computing TVL for ${chainName}:`, error)
    return 0
  }
}

module.exports = {
  toInt,
  call,
  toHex,
  sumTokens,
  sumTokensExport,
  computeTVL,
  getExternalChainDeposits
}
