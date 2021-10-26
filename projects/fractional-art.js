const sdk = require("@defillama/sdk");
const { BigNumber } = require("bignumber.js");
const utils = require('./helper/utils');
const {unwrapUniswapLPs} = require('./helper/unwrapLPs.js')


// Retrieve needed vaults attributes from REST API
const fractional_api_url = 'https://mainnet-api.fractional.art/vaults?perPage=12' // &page=1' 
async function retrieveVaultsAPI() {
  // Get page count
  const page1 = await utils.fetchURL(fractional_api_url + '&page=1')
  let pageCount = page1.data.metadata.pagination.total_pages;
  //pageCount = 1 // uncomment for for debug

  const vaults = []
  let openedVaultsCount = 0
  for (let i = 0; i < pageCount; i++) {
    let vaults_i = await utils.fetchURL(fractional_api_url + `&page=${i+1}`)
    // Filter out unwanted attributes: keep analytics.tvlUsd, pools, contractAddress, symbol, slug, collectables
    vaults_i = vaults_i.data.data.map(({ analytics, pools, contractAddress, symbol, slug, collectables, isClosed, tokenAddress }) => ({analytics, pools, contractAddress, symbol, slug, collectables, isClosed, tokenAddress}))

    // Note : Could filter out closed vaults, but their tokens can still be provided to pools, so not filtering
    openedVaultsCount += vaults_i.filter(vault => !vault.isClosed).length

    // Append to complete vaults array
    vaults.push(...vaults_i)
  }
  return {vaults, openedVaultsCount}
}

// Remove vaults tokens (token0) balances as they should not account for TVL
function clearVaultsTokenBalances(vaults, balances) {
  const vaults_t0 = vaults.map(v => v.contractAddress.toLowerCase())
  balances = Object.assign({}, ...
    Object.entries(balances).filter(([k,v]) => (!vaults_t0.includes(k.toLowerCase()))).map(([k,v]) => ({[k]:v}))
  )
  return balances 
}

// This API returns a list of vaults similar to the following exampleVaultDebug
function exampleVaultDebug() {
  return {
    "symbol":	"DOG",
    "contractAddress":	"0xbaac2b4491727d78d2b78815144570b9f2fe8899",
    "pools":	[ {
      "pool":	"0x7731CA4d00800b6a681D031F565DeB355c5b77dA",
      "token0":	"0xBAac2B4491727D78D2b78815144570b9f2Fe8899",
      "token1":	"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "provider":	"UNISWAP_V3"
    }],
    "tokenAddress":	"0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7",
    "analytics": {
      "tvlUsd": 21790624
    },
    "slug":	"the-doge-nft",
    "isClosed":	false,
  }
}

// Get Fractional.art TVL
async function tvl(timestamp, block, chainBlocks, chain) {
  // Get vaults and Compute vaults TVL (trusting fractional rest api)
  const {vaults, openedVaultsCount} = await retrieveVaultsAPI()
  const vaulstTVL_api = getVaultsTvlApi(vaults)
  // note: vault with slug fractional-dream-930 has null analytics and symbol, because it is an ERC1155 not listed on any DEXes
  
  // Or try to find all pools associated to vault and account for tokens locked against vault token
  // In pool: provider, pool, token0, token1
  const univ2_sushiv1_pools = []
  const univ3_pools = []
  vaults.forEach(vault => {
    vault.pools.forEach(pool => {
      // Swap token0 and token1 if needed so token0 is always vault token
      if (vault.contractAddress.toLowerCase() === pool.token1.toLowerCase()) {
        const tmp = pool.token1
        pool.token1 = pool.token0
        pool.token0 = tmp
      }
      // Pool provider can be any of ['UNISWAP_V3', 'SUSHISWAP_V1', 'UNISWAP_V2']
      const provider = pool.provider
      if ((provider === 'UNISWAP_V2') || (provider === 'SUSHISWAP_V1')) {
        univ2_sushiv1_pools.push(pool)
      } else if (provider === 'UNISWAP_V3') {
        univ3_pools.push(pool)
      }
    })
  })
  // Concat v2 and v3 pools
  const v2_v3_pools = univ3_pools.concat(univ2_sushiv1_pools)

  // Retrieve balances from onchain calls
  let balances = {}

  // Get UNISWAP_V3 LPs
  // Simply get amount of token0 and token1 allocated to pool contract. And since we only need the token1 it is even more efficient
  const calls_v3_v2_t0_t1 = v2_v3_pools.map((pool) => ({ 
      target: pool.token1,
      params: pool.pool
    })).concat(v2_v3_pools.map((pool) => ({
      target: pool.token0,
      params: pool.pool
    })))
  /*
  const calls_v3_t1 = univ3_pools.map((pool) => ({ // 33.67 // 20.69
      target: pool.token1,
      params: pool.pool
    }))
  const calls_v3_t0_t1 = univ3_pools.map((pool) => ({ // 69.12 // 20.69 univ2_sushiv1_pools
    target: pool.token1,
    params: pool.pool
  })).concat(univ3_pools.map((pool) => ({
      target: pool.token0,
      params: pool.pool
    })))
  */
  
  const poolBalance = await sdk.api.abi.multiCall({ 
    block,
    calls: calls_v3_v2_t0_t1, // calls_v3_t0_t1
    abi: 'erc20:balanceOf'
  })
  balances = {}
  sdk.util.sumMultiBalanceOf(balances, poolBalance)

  // Remove vaults tokens balances as they should not account for TVL. 
  // TODO: Choose if we remove the vaults tokens from pooled balances or not
  balances = clearVaultsTokenBalances(vaults, balances)

  return balances
}

// Using fractional REST API, a TVL is returned in USD, stored as USDC
function getVaultsTvlApi(vaults) {
  return vaults.reduce((acc, vault) => acc.plus(BigNumber(vault.analytics ? vault.analytics.tvlUsd : 0)), BigNumber(0))
  console.log(`${vaulstTVL_api.div(1e6).toFixed(2)}M TVL locked in vaults computed from REST API / in ${openedVaultsCount} opened vaults out of ${vaults.length} total vaults count`)
}

const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
async function tvl_api(timestamp, block, chainBlocks, chain) {
  const {vaults, openedVaultsCount} = await retrieveVaultsAPI()
  return {[usdc]: getVaultsTvlApi(vaults).times(1e6)} 
}

module.exports = {
  tvl: tvl,
  methodology: `TVL is the total quantity of tokens held in LPs against any vault token. Each vault has a token, which is provided as LP in several pools returned by fractional REST API. Do not account for vault token locked in pools as contributing to TVL.`
}



// ------------
// Alternatives
// ------------

// 1. COULD USE unwrapUniswapLPs with lpPositions set to erc20:totalSupply of pool but does not work for uni_v3
/*
  // Get UNISWAP_V2 and SUSHISWAP_V1 LPs
  // Call unwrapUniswapLPs with lpPositions set to totalSupply of LP token. So you unwrap the whole pool without needing to pull reserves of token1 - only pull totalSupply of LP token
  const univ2_sushiv1_pairAddresses = univ2_sushiv1_pools.map(p => p.pool)
  const univ3_pairAddresses = univ3_pools.map(p => p.pool)
  const lpSupply = (await sdk.api.abi.multiCall({
    block,
    abi: 'erc20:totalSupply',
    calls: univ2_sushiv1_pairAddresses.map(address=>({ // cannot retrieve uni_v3 balances
        target: address
    })),
    chain
  })).output
  // Format the way unwrapUniswapLPs function requires the token/balance pairs
  const lpPositions = lpSupply.map(call => ({
    token: call.input.target,
    balance: call.output
  }))
  // Accumulate to balances
  await unwrapUniswapLPs(balances, lpPositions, block, chain=chain)
  */

// 2. COULD USE staking contract, but too slow to retrieve call by call the amount of tokens
/*
const { staking } = require("./helper/staking.js");
balances = {}
for (const pool of v2_v3_pools) { // univ3_pools
  const token1_locked = staking(pool.pool, pool.token1, chain="ethereum")
  token1_pool_balance = await token1_locked(timestamp, block, chainBlocks)

  sdk.util.sumSingleBalance(balances, pool.token1, token1_pool_balance[pool.token1]);
  // sdk.util.sumMultiBalanceOf(balances, [token1_pool_balance], true);
}
*/


// 3. COULD USE core/index.js functions to get TL locked in given Uniswap pools, but too much to copy-paste from ./CORE/INDEX.JS
/*
const {getUniswapPairInfo, getPairUnderlyingReserves, flattenUnderlyingReserves} = require('./core/index.js');
Would need to copy-paste these functions are export them by module
const pairInfo = await getUniswapPairInfo(univ2_sushiv1_pairAddresses, timestamp, block);
const underlyingReserves = await Promise.all(pairInfo.map(info => getPairUnderlyingReserves(info, timestamp, block)));
let balances = flattenUnderlyingReserves(underlyingReserves);
*/