const sdk = require('@defillama/sdk')
const abi = require('./abi')
const BigNumber = require('bignumber.js')

// utils
const ZERO = new BigNumber(0)
const ETHER = new BigNumber(10).pow(18)
const toNatual = (value) => {
  return (new BigNumber(value)).div(ETHER)
}

// main
async function _tvl(timestamp, ethBlock, chainBlocks, chain, pool, bTokenSymbol) {
  const block = chainBlocks[chain]
  const { output: counts } = await sdk.api.abi.call({
    block,
    target: pool,
    params: [],
    abi: abi['getLengths'],
    chain,
  });

  const bTokenCount = counts[0]
  let bTokenIds = []
  for (let i=0; i<parseInt(bTokenCount); i++) {
    bTokenIds.push(i.toString())
  }

  const bTokens = (await sdk.api.abi.multiCall({
    calls: bTokenIds.map((bTokenId) => ({
      target: pool,
      params: [bTokenId],
    })),
    block,
    abi: abi['getBToken'],
    chain,
  })).output.map(value => value.output)

  const res = bTokens.reduce((acc, b) => {
    const liquidity = toNatual(b.liquidity)
    const price = toNatual(b.price)
    const discount = toNatual(b.discount)
    const pnl = toNatual(b.pnl)
    return acc.plus(liquidity.times(price).times(discount).plus(pnl))
  }, ZERO)

  return { [bTokenSymbol]: res.toNumber() };
}
async function bsc(timestamp, ethBlock, chainBlocks) {
  return await _tvl(timestamp, ethBlock, chainBlocks, 'bsc', '0x19c2655A0e1639B189FB0CF06e02DC0254419D92', 'BUSD')
}

async function polygon(timestamp, ethBlock, chainBlocks) {
  return await _tvl(timestamp, ethBlock, chainBlocks, 'polygon', '0x43b4dfb998b4D17705EEBfFCc0380c6b98699252', 'TETHER')
}

module.exports = {
  bsc: {
    tvl: bsc
  },
  polygon: {
    tvl: polygon
  },
  tvl: sdk.util.sumChainTvls([bsc, polygon])
}
