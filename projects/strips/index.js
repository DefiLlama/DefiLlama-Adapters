const sdk = require('@defillama/sdk')
const abi = require('./abi.json')
const { getBlock } = require('../helper/getBlock.js')
const {pool2s} = require('../helper/pool2')

// Strips Contracts
const stripsContract = '0xFC03E4A954B7FF631e4a32360CaebB27B6849457'
const usdc = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
const sushi_STP_USDC_LP = '0x01de11cfd3a7261a954db411f02c86d8b826e5d2'
// Constants
const chain = 'arbitrum'
const transform = t => `${chain}:${t}`

async function getMarkets(block) {
  const {output: allMarkets} = await sdk.api.abi.call({
    abi: abi['getAllMarkets'],
    target: stripsContract,
    chain,
    block,
  })
  return allMarkets.filter(c => c.created).map(c => c.market)
}

async function tvl(timestamp, ethBlock, chainBlocks) {
  const balances = {}
  const block = getBlock(timestamp, chain, chainBlocks)
  const markets = await getMarkets(block)
  const usdcBalances = await sdk.api.abi.multiCall({
    calls: markets.map(market => ({
      target: usdc,
      params: [market],
    })),
    abi: 'erc20:balanceOf',
    block,
    chain,
  })
  sdk.util.sumMultiBalanceOf(balances, usdcBalances, true, transform)
  return balances
}

async function pool2(timestamp, ethBlock, chainBlocks) {
  const block = getBlock(timestamp, chain, chainBlocks)
  const markets = await getMarkets(block)
  const balances = pool2s(markets, [sushi_STP_USDC_LP], chain, transform)(timestamp, ethBlock, chainBlocks)
  return balances
}

module.exports = {
	arbitrum: {
    tvl,
    pool2
  }, 
  methodology: 'Balance of USDC (fees) held by each market as core TVL as well as STRP/USDC SLP held by each market as pool2'
}