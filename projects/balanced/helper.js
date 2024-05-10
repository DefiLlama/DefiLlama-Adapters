const { toInt, call } = require("../helper/chain/icx")

const balancedDexContract = "cxa0af3165c08318e988cb30993b3048335b94af6c"
const balancedAssetManagerContract =
  "cxabea09a8c5f3efa54d0a0370b14715e6f2270591"
const balancedOracle = "cx133c6015bb29f692b12e71c1792fddf8f7014652"
const balancedPegStability = "cxa09dbb60dcb62fffbd232b6eae132d730a2aafa6"
const bnUSDcontract = "cx88fd7df7ddff82f7cc735c871dc519838cb235bb"

let assetsPromise
let decimalsPromise
let getExternalChainDepositsPromise



async function getAssets() {
  if (!assetsPromise) {
    assetsPromise = call(balancedAssetManagerContract, "getAssets", {})
  }
  return assetsPromise
}

async function getDecimalsCached() {
  if (!decimalsPromise)
    decimalsPromise = getDecimals()

  return decimalsPromise
}

async function getExternalChainDepositsCached() {
  if (!getExternalChainDepositsPromise)
    getExternalChainDepositsPromise = getExternalChainDeposits()
  return getExternalChainDepositsPromise
}

// Network identifiers are found by calling the getAssets method on the balancedAssetManagerContract
const networkIdentifiers = {
  "0x100.icon": "havah",
  "0x38.bsc": "bnbchain",
  "0xa86a.avax": "avalanche",
  "archway-1": "archway",
  "injective-1/inj": "injective",
}

// Get decimals of cross-chain Balanced assets in balancedAssetManagerContract
async function getDecimals() {
  const assets = await getAssets()
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
  let assets = await getAssets()
  const decimals = await getDecimalsCached()
  const deposits = []

  for (const [tokenNetworkAddress, tokenAddress] of Object.entries(assets)) {
    let assetDepositDecimal, tokenSymbol, rateDecimal

    try {
      const assetDepositHex = await call(balancedAssetManagerContract, "getAssetDeposit", { tokenNetworkAddress })
      assetDepositDecimal = toInt(assetDepositHex)
      tokenSymbol = await call(tokenAddress, "symbol", {})

      try {
        const priceData = await call(balancedOracle, "getPriceDataInUSD", { symbol: tokenSymbol, })
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
  const deposits = await getExternalChainDepositsCached()
  let TVL = 0
  deposits.forEach((deposit) => {
    if (deposit.chain === chainName) {
      if(deposit.tvlInUsd < 1e9){
        TVL += deposit.tvlInUsd
      }
    }
  })
  return { tether: TVL }
}

module.exports = {
  getExternalChainDeposits: getExternalChainDepositsCached,
  computeTVL
}