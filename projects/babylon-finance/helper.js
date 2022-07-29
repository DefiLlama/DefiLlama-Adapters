const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const abi = require('./abi.json');
const { } = require("../helper/unwrapLPs");

const { request, gql } = require("graphql-request")

// pool will give you the amount of fUniV3_WETH_ABC held by the pool of the position token against that token total supply
const uniV3_nft_contract = '0xc36442b4a4522e871399cd717abdd847ab11fe88'

const abi_staking = {
  'univ3_positions': { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "positions", "outputs": [{ "internalType": "uint96", "name": "nonce", "type": "uint96" }, { "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "address", "name": "token0", "type": "address" }, { "internalType": "address", "name": "token1", "type": "address" }, { "internalType": "uint24", "name": "fee", "type": "uint24" }, { "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "internalType": "uint256", "name": "feeGrowthInside0LastX128", "type": "uint256" }, { "internalType": "uint256", "name": "feeGrowthInside1LastX128", "type": "uint256" }, { "internalType": "uint128", "name": "tokensOwed0", "type": "uint128" }, { "internalType": "uint128", "name": "tokensOwed1", "type": "uint128" }], "stateMutability": "view", "type": "function" },

  'erc721_tokenOfOwnerByIndex': { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenOfOwnerByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },

  'token0': { "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  'token1': { "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
}


// Convert Uniswap v3 tick to a price (i.e. the ratio between the amounts of tokens: token1/token0)
const tickBase = 1.0001
function tick_to_price(tick) {
  return tickBase ** tick
}
// GraphQL query to get the pool information
const univ3_graph_url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
const univ3_graph_query = gql`
query position($block: Int, $position_id: ID!) {
		position (
				id: $position_id
				block: { number: $block }
		) {
				id
				owner
				tickLower {tickIdx}
				tickUpper {tickIdx}
				liquidity
				pool {
						tick
						liquidity
						feeTier
						token0 { symbol decimals id }
						token1 { symbol  decimals id }
				}
		}
}`

/*
univ3_Positions:{
        vault,
        pool
}[]
*/
async function unwrapUniswapV3LPs(balances, univ3_Positions, block, chain = 'ethereum', transformAddress = (addr) => addr) {
  await Promise.all(univ3_Positions.map(async univ3_Position => {
    try {
      // Get share of that LP NFT inside the vault as balanceOf / totalSupply
      const { output: totalSupply } = await sdk.api.abi.call({
        block,
        abi: 'erc20:totalSupply',
        target: univ3_Position.vault,
        chain
      })
      const { output: heldLPshares } = await sdk.api.abi.call({
        block,
        abi: 'erc20:balanceOf',
        target: univ3_Position.vault,
        params: univ3_Position.pool,
        chain
      })
      const sharesRatio = heldLPshares / totalSupply

      /*
      const {output: uniV3_nft_count} = await sdk.api.abi.call({
              block,
              abi: 'erc20:balanceOf',
              target: uniV3_nft_contract,
              params: univ3_Position.vault,
              chain
      })
      */
      // Here we assume only the first nft position is retrieved
      // could look for more using uniV3_nft_count 
      const { output: position_id } = await sdk.api.abi.call({
        block,
        abi: abi_staking['erc721_tokenOfOwnerByIndex'],
        target: uniV3_nft_contract,
        params: [univ3_Position.vault, 0],
        chain
      })

      const positionBalances = await getUniv3PositionBalances(position_id, block)

      // Add balances while multiplying amount by ratio of shares
      Object.entries(positionBalances).forEach(async entry => {
        const [key, value] = entry;
        // balances[key] = BigNumber( balances[key] || 0 ).plus(sharesRatio * value);
        sdk.util.sumSingleBalance(balances, await transformAddress(key), BigNumber(sharesRatio * value).toFixed(0))
      });
      console.log(`ratio of the pool: ${(100 * sharesRatio).toFixed(1)}% of position_id ${position_id}`)

    } catch (e) {
      console.log(`Failed to get data for LP token vault at ${univ3_Position.vault} on chain ${chain}`)
      throw e
    }
  }))
}

async function getUniv3PositionBalances(position_id, block) {
  // Retrieve aTokens and reserves from graphql API endpoint
  const { position } = await request(
    univ3_graph_url,
    univ3_graph_query, {
    block: block,
    position_id: position_id
  })

  // Extract pool parameters
  const pool = position['pool']
  const tick = pool['tick']
  const token0 = pool['token0']['id']
  const token1 = pool['token1']['id']
  // Retrieve these from the graphql query instead of onchain call
  const bottom_tick = position['tickLower']['tickIdx']
  const top_tick = position['tickUpper']['tickIdx']
  const liquidity = position['liquidity']

  // Compute square roots of prices corresponding to the bottom and top ticks
  const sa = tick_to_price(Math.floor(bottom_tick / 2))
  const sb = tick_to_price(Math.floor(top_tick / 2))
  const price = tick_to_price(tick)
  const sp = price ** 0.5
  // const decimals0 = pool['token0']['decimals']
  // const decimals1 = pool['token1']['decimals']
  // const adjusted_price = price / (10 ** (decimals1 - decimals0))

  // Compute real amounts of the two assets
  const amount0 = liquidity * (sb - sp) / (sp * sb)
  const amount1 = liquidity * (sp - sa)

  console.log(`Whole pool: amount0: ${(amount0 / 1e18).toFixed(1)} / amount1: ${(amount1 / 1e18).toFixed(1)}`)
  return {
    [token0]: amount0,
    [token1]: amount1,
  }
}

/*
// Could get some props of the position itself onchain rather than using uni-v3 graphql endpoint, but some information needed is missing like whole pool liq/tick etc
const {output: position_props} = await sdk.api.abi.call({
    block,
    abi: abi_staking['univ3_positions'],
    target: uniV3_nft_contract,
    params: position_id, // get the last one for demonstration
    chain: 'ethereum'
})
const bottom_tick = position_props['tickLower']
const top_tick = position_props['tickUpper']
const L = position_props['liquidity']
const token0 = position_props['token0']
const token1 = position_props['token1']
*/

module.exports = {
  unwrapUniswapV3LPs
}
