const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { PromisePool } = require('@supercharge/promise-pool')
const { BigNumber } = require("bignumber.js");
const { get } = require('./helper/http')
const { sumTokens2 } = require('./helper/unwrapLPs')


// Retrieve needed vaults attributes from REST API
const fractional_api_url = 'https://mainnet-api.fractional.art/vaults?perPage=100' // &page=1' 

async function getVaults() {
  const vaults = []
  let page = 1
  const {
    data, metadata
  } = await get(fractional_api_url + `&page=${page}`)
  vaults.push(...data)
  page++
  const totalPages = metadata.pagination.totalPages
  const pages = []
  for (; page <= totalPages; page++) pages.push(page)

  await PromisePool
    .withConcurrency(21)
    .for(pages)
    .process(addPage)

  async function addPage(i) {
    const { data, } = await get(fractional_api_url + `&page=${i}`)
    vaults.push(...data)
    sdk.log('fetched', i, 'of', totalPages)
  }

  sdk.log(vaults.length)
  return vaults
}

// This API returns a list of vaults similar to the following exampleVaultDebug
function exampleVaultDebug() {
  return {
    "symbol": "DOG",
    "contractAddress": "0xbaac2b4491727d78d2b78815144570b9f2fe8899",
    "pools": [{
      "pool": "0x7731CA4d00800b6a681D031F565DeB355c5b77dA",
      "tokens": ["0xBAac2B4491727D78D2b78815144570b9f2Fe8899", ADDRESSES.ethereum.WETH],
      "provider": "UNISWAP_V3"
    }],
    "tokenAddress": "0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7",
    "analytics": {
      "tvlUsd": 21790624
    },
    "slug": "the-doge-nft",
    "isClosed": false,
  }
}

// Get Fractional.art TVL
async function tvl(_, block) {
  // Get vaults and Compute vaults TVL (trusting fractional rest api)
  const vaults = await getVaults()
  const toa = []
  let token0;
  let token1;
  vaults.forEach(vault => {
    vault.pools.forEach(pool => {
      token0 = pool.tokens[0];
      token1 = pool.tokens[1];
      // Swap token0 and token1 if needed so token0 is always vault token
      if (vault.contractAddress.toLowerCase() === token1.toLowerCase())
        toa.push([token0, pool.pool])
      else
        toa.push([token1, pool.pool])
    })
  })

  return sumTokens2({ tokensAndOwners: toa, block, })
}

// Using fractional REST API, a TVL is returned in USD, stored as USDC
function getVaultsTvlApi(vaults) {
  return vaults.reduce((acc, vault) => acc.plus(BigNumber(vault.analytics ? vault.analytics.tvlUsd : 0)), BigNumber(0))
}

const usdc = ADDRESSES.ethereum.USDC
/* async function tvl_api(timestamp, block, chainBlocks, chain) {
  const { vaults, openedVaultsCount } = await retrieveVaultsAPI()
  return { [usdc]: getVaultsTvlApi(vaults).times(1e6) }
} */

module.exports = {
  ethereum: { tvl },
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
