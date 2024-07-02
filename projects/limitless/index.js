const sdk = require("@defillama/sdk")
const { graphFetchById } = require('../helper/cache')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')
const abi = {
  "slot0": "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
}
const limWethAbi = {
  "tokenBalance": "uint:tokenBalance"
}
const vaultAbi = {
  "totalAssets": "uint256:totalAssets"
}
const dataProviderAbi = {
  "getPoolKeys": "function getPoolkeys(address pool) view returns (address token0, address token1, uint24 fee)"
}
const lmtQuoterAbi = {
  "getPoolKeys": "function getPoolKeys() view returns (tuple(address, address, string, string, uint24, string, string, uint8, uint8, int24)[])"
}
const { getUniqueAddresses } = require("../helper/utils")

const LIM_WETH_CONTRACT = '0x845d629D2485555514B93F05Bdbe344cC2e4b0ce'
const BASE_WETH_CONTRACT = '0x4200000000000000000000000000000000000006'
const VAULT_CONTRACT = '0x1Cf3F6a9f8c6eEF1729E374B18F498E2d9fC6DCA'
const DATA_PROVIDER_CONTRACT = '0x87E697c3EBe41eD707E4AD52541f19292Be81177'
const LMT_QUOTER_CONTRACT = '0xED14586763578147136e55D20a0Ee884Cd8fBC6d'

const liquidityWithdrawnQuery = `
query ($lastId: String, $block: Int) {
  liquidityWithdrawns(
    first: 1000
    block: { number: $block }
    where: {id_gt: $lastId}
  ) {
    id
    pool
    liquidity
    tickLower
    tickUpper
  }
}
`
const liquidityProvidedQuery = `
query ($lastId: String, $block: Int) {
  liquidityProvideds(
    first: 1000
    block: { number: $block }
    where: {id_gt: $lastId}
  ) {
    id
    pool
    liquidity
    tickLower
    tickUpper
  }
}
`

const LMT_SUBGRAPH_ENDPOINT_BASE = 'https://api.studio.thegraph.com/query/71042/limitless-subgraph-base/version/latest'

async function base_tvl(api) {

  // we should count the value left in the vault rather than deposited amount to avoid double counting?
  await api.sumTokens({ owner: LIM_WETH_CONTRACT, tokens: [BASE_WETH_CONTRACT] })
  // const tokenBalance = await api.call({ target: LIM_WETH_CONTRACT, abi: limWethAbi.tokenBalance, })
  // api.add(BASE_WETH_CONTRACT, tokenBalance)

  // not sure what this is supposed to do
  // const vault = await api.call({ target: VAULT_CONTRACT, abi: vaultAbi.totalAssets, })
  // api.add(VAULT_CONTRACT, vault)

  const provided = await graphFetchById({
    endpoint: LMT_SUBGRAPH_ENDPOINT_BASE,
    query: liquidityProvidedQuery,
    api,
    options: {
      useBlock: true,
      safeBlockLimit: 500,
    }
  })
  const withdrawn = await graphFetchById({
    endpoint: LMT_SUBGRAPH_ENDPOINT_BASE,
    query: liquidityWithdrawnQuery,
    api,
    options: {
      useBlock: true,
      safeBlockLimit: 500,
    }
  })

  console.log(provided.length, withdrawn.length)
  const pools = getUniqueAddresses(provided.map(entry => entry.pool).concat(withdrawn.map(entry => entry.pool)))
  const token0s = await api.multiCall({  abi: 'address:token0', calls: pools})
  const token1s = await api.multiCall({  abi: 'address:token1', calls: pools})
  
  const ticks = await api.multiCall({ abi: abi.slot0, calls: pools, permitFailure: true })

  const poolMap = {}
  pools.forEach((pool, index) => {
    poolMap[pool] = {
      token0: token0s[index],
      token1: token1s[index],
      tick: ticks[index].tick
    }
  })

  const withdrawnBalancesApi = new sdk.ChainApi({ chain: api.chain})

  provided.forEach(({ pool, tickLower, tickUpper, liquidity }) => {
    const { token0, token1, tick } = poolMap[pool.toLowerCase()]
    addUniV3LikePosition({ api, token0, token1, tick, liquidity, tickUpper, tickLower, })
  })
  withdrawn.forEach(({ pool, tickLower, tickUpper, liquidity }) => {
    const { token0, token1, tick } = poolMap[pool.toLowerCase()]
    addUniV3LikePosition({ api: withdrawnBalancesApi, token0, token1, tick, liquidity, tickUpper, tickLower, })
  })
  
  const balances = api.getBalancesV2()
  const withdrawnBalances = withdrawnBalancesApi.getBalancesV2()
  balances.subtract(withdrawnBalances)
  return balances.getBalances()
}

module.exports = {
  methodology: 'counts the number of LMT tokens.',
  start: 1712389967,
  base: {
    tvl: base_tvl,
  }
}
