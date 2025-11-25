const path = require("path")
require("dotenv").config()
const sdk = require("@defillama/sdk")
const { util: { blocks: { getBlocks } } } = require("@defillama/sdk")
const axios = require("axios")

// ETH Morpho vaults
const ETH_MORPHO_VAULTS = {
  v1: "0xd564F765F9aD3E7d2d6cA782100795a885e8e7C8", // Morpho ETH Prime v1
  v2: "0xbb50a5341368751024ddf33385ba8cf61fe65ff9", // Morpho ETH v2
}

const ERC4626_ABI = {
  asset: "function asset() view returns (address)",
  totalAssets: "function totalAssets() view returns (uint256)",
  balanceOf: "function balanceOf(address account) view returns (uint256)",
  convertToAssets: "function convertToAssets(uint256 shares) view returns (uint256)",
}

const MORPHO_V2_ABI = {
  adapters: "function adapters(uint256 index) view returns (address)",
}

const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

async function getTokenPrice(tokenAddress) {
  try {
    const response = await axios.get(`https://coins.llama.fi/prices/current/ethereum:${tokenAddress}`)
    const data = response.data.coins[`ethereum:${tokenAddress}`]
    return data ? { price: data.price, decimals: data.decimals, symbol: data.symbol } : null
  } catch (e) {
    return null
  }
}

async function main() {
  const unixTimestamp = Math.round(Date.now() / 1000) - 60
  
  // Get blocks for timestamp
  let chainBlocks = {}
  try {
    const res = await getBlocks(unixTimestamp, ["ethereum"])
    chainBlocks = res.chainBlocks
  } catch (e) {
    console.log("Warning: Could not get blocks:", e.message)
  }
  
  const api = new sdk.ChainApi({ 
    chain: "ethereum", 
    block: chainBlocks.ethereum, 
    timestamp: unixTimestamp,
    storedKey: "ethereum"
  })
  api.api = api
  api.storedKey = "ethereum"
  
  console.log("\n=== ETH MORPHO VAULTS BREAKDOWN ===\n")
  
  // Get asset addresses (should be WETH for both)
  const v1Asset = await api.call({
    abi: ERC4626_ABI.asset,
    target: ETH_MORPHO_VAULTS.v1,
  })
  const v2Asset = await api.call({
    abi: ERC4626_ABI.asset,
    target: ETH_MORPHO_VAULTS.v2,
  })
  
  console.log(`V1 Vault: ${ETH_MORPHO_VAULTS.v1}`)
  console.log(`V1 Asset: ${v1Asset}`)
  console.log(`V2 Vault: ${ETH_MORPHO_VAULTS.v2}`)
  console.log(`V2 Asset: ${v2Asset}\n`)
  
  // Get total assets
  const v1TotalAssets = await api.call({
    abi: ERC4626_ABI.totalAssets,
    target: ETH_MORPHO_VAULTS.v1,
  })
  const v2TotalAssets = await api.call({
    abi: ERC4626_ABI.totalAssets,
    target: ETH_MORPHO_VAULTS.v2,
  })
  
  // Get v2 adapter
  const v2Adapter = await api.call({
    abi: MORPHO_V2_ABI.adapters,
    target: ETH_MORPHO_VAULTS.v2,
    params: [0],
    permitFailure: true,
  })
  
  console.log(`V2 Adapter: ${v2Adapter}\n`)
  
  // Get v2's deposits in v1
  let v2DepositsInV1 = 0n
  let v2AdapterSharesInV1 = null
  
  if (v2Adapter) {
    v2AdapterSharesInV1 = await api.call({
      abi: ERC4626_ABI.balanceOf,
      target: ETH_MORPHO_VAULTS.v1,
      params: [v2Adapter],
      permitFailure: true,
    })
    
    if (v2AdapterSharesInV1 && BigInt(v2AdapterSharesInV1) > 0n) {
      const v2AssetsInV1 = await api.call({
        abi: ERC4626_ABI.convertToAssets,
        target: ETH_MORPHO_VAULTS.v1,
        params: [v2AdapterSharesInV1],
        permitFailure: true,
      })
      if (v2AssetsInV1) {
        v2DepositsInV1 = BigInt(v2AssetsInV1)
      }
    }
  }
  
  // Get token price
  const tokenInfo = await getTokenPrice(WETH_ADDRESS)
  const decimals = tokenInfo?.decimals || 18
  const price = tokenInfo?.price || 0
  const symbol = tokenInfo?.symbol || "WETH"
  
  // Convert to readable amounts
  const v1Total = BigInt(v1TotalAssets || 0)
  const v2Total = BigInt(v2TotalAssets || 0)
  
  const v1Amount = Number(v1Total) / 10 ** decimals
  const v2Amount = Number(v2Total) / 10 ** decimals
  const v2DepositsInV1Amount = Number(v2DepositsInV1) / 10 ** decimals
  
  const v1Usd = v1Amount * price
  const v2Usd = v2Amount * price
  const v2DepositsInV1Usd = v2DepositsInV1Amount * price
  
  // Calculate unique TVL
  const uniqueTvl = v1Total + v2Total - v2DepositsInV1
  const uniqueTvlAmount = Number(uniqueTvl) / 10 ** decimals
  const uniqueTvlUsd = uniqueTvlAmount * price
  
  console.log("=== BREAKDOWN ===\n")
  console.log(`V1 Total Assets:`)
  console.log(`  Token Amount: ${v1Amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`)
  console.log(`  USD Value: $${v1Usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`)
  console.log(`  Raw: ${v1Total.toString()}\n`)
  
  console.log(`V2 Total Assets:`)
  console.log(`  Token Amount: ${v2Amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`)
  console.log(`  USD Value: $${v2Usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`)
  console.log(`  Raw: ${v2Total.toString()}\n`)
  
  if (v2AdapterSharesInV1) {
    console.log(`V2 Adapter Shares in V1:`)
    console.log(`  Shares: ${BigInt(v2AdapterSharesInV1).toString()}`)
    console.log(`  Token Amount: ${v2DepositsInV1Amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`)
    console.log(`  USD Value: $${v2DepositsInV1Usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`)
    console.log(`  Raw: ${v2DepositsInV1.toString()}\n`)
  } else {
    console.log(`V2 Adapter Shares in V1: 0 (no deposits)\n`)
  }
  
  console.log("=== DEDUPLICATION ===\n")
  console.log(`Formula: V1 + V2 - v2_deposits_in_v1`)
  console.log(`Calculation: ${v1Amount.toFixed(6)} + ${v2Amount.toFixed(6)} - ${v2DepositsInV1Amount.toFixed(6)}`)
  console.log(`= ${uniqueTvlAmount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`)
  console.log(`= $${uniqueTvlUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`)
  console.log(`Raw: ${uniqueTvl.toString()}\n`)
  
  console.log("=== SUMMARY ===\n")
  console.log(`V1 TVL: $${v1Usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`)
  console.log(`V2 TVL: $${v2Usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`)
  console.log(`V2 Deposits in V1: $${v2DepositsInV1Usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`)
  console.log(`Unique Morpho ETH TVL: $${uniqueTvlUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`)
}

main().catch(console.error)

