const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const TOAD_ADDRESS = '0x463e737d8f740395abf44f7aac2d9531d8d539e9'
const TOAD_FARM_ADDRESS = '0xe1F1EDfBcEfB1E924e4a031Ed6B4CAbC7e570154'
const TOAD_PADSWAP_FARM_V1_ADDRESS = '0xD2d7b6b333AbF180520494c021f7125806eD273e'
const TOAD_PADSWAP_FARM_V2_ADDRESS = '0x4992df071416370fe780627eDFDD8CbC694Ed08b'

const graphUrl = 'https://api.thegraph.com/subgraphs/name/toadguy/padswap'
const graphQuery = gql`
query get_tvl($block: Int) {
  uniswapFactory(
    id: "0xB836017ACf10b8A7c6c6C9e99eFE0f5B0250FC45",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`

const toadPriceQuery = gql`
query get_toad_reserve($block: Int) {
  pair(
    id: "0xef6421325f7ed6ebeeaa2b092f9cc64ee2aa3b3b",
    block: { number: $block }
  ) {
    reserve0
    reserveUSD
  }
}
`

async function getToadPrice(chainBlocks) {
  const { pair } = await request(
    graphUrl,
    toadPriceQuery,
    { block: chainBlocks['bsc'] }
  )
  const toadReserve = pair.reserveUSD / 2
  const toadPrice = toadReserve / pair.reserve0
  return toadPrice
}

async function tvl(timestamp, block, chainBlocks) {
  const {uniswapFactory} = await request(
    graphUrl,
    graphQuery,
    {
      block: chainBlocks['bsc'],
    }
  );
  const usdTvl = Number(uniswapFactory.totalLiquidityUSD)

  return toUSDTBalances(usdTvl)
}

async function staking(timestamp, block, chainBlocks) {
  const { output: toadFarmOutput } = await sdk.api.erc20.balanceOf({
    block: chainBlocks['bsc'],
    target: TOAD_ADDRESS,
    owner: TOAD_FARM_ADDRESS,
    chain: 'bsc'
  })
  const { output: padswapV1Output } = await sdk.api.erc20.balanceOf({
    block: chainBlocks['bsc'],
    target: TOAD_ADDRESS,
    owner: TOAD_PADSWAP_FARM_V1_ADDRESS,
    chain: 'bsc'
  })
  const { output: padswapV2Output } = await sdk.api.erc20.balanceOf({
    block: chainBlocks['bsc'],
    target: TOAD_ADDRESS,
    owner: TOAD_PADSWAP_FARM_V2_ADDRESS,
    chain: 'bsc'
  })
  const toadBalanceBn = BigNumber(toadFarmOutput).plus(BigNumber(padswapV1Output))
                                                 .plus(BigNumber(padswapV2Output))
  const toadBalance = toadBalanceBn.times(10 ** -18).toNumber()
  const toadPrice = await getToadPrice(chainBlocks)
  const usdTvl = toadBalance * toadPrice
  const balances = toUSDTBalances(usdTvl)
  return balances
}

module.exports = {
  methodology: `TVL accounts for the liquidity on all AMM pools (see https://info.padswap.exchange/). Staking includes all TOAD staked in TOAD farms.`,
  misrepresentedTokens: true,
  bsc: {
    staking
  },
  tvl
}
