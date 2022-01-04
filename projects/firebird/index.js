const sdk = require('@defillama/sdk')
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')
const {transformPolygonAddress} = require('../helper/portedTokens')

const FACTORY = '0x5De74546d3B86C8Df7FEEc30253865e1149818C8';
const stablePool = "0x01C9475dBD36e46d1961572C8DE24b74616Bae9e"
const stablePoolTokens = ['0xc2132d05d31c914a87c6611c10748aeb04b58e8f', '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063']

async function tvl(_, ethBlock, chainBlocks) {
  const transformPolygon = await transformPolygonAddress()// addr=>`polygon:${addr}`
  const block = chainBlocks['polygon']
  const chain = 'polygon'

  const balances = await calculateUniTvl(transformPolygon, block, chain, FACTORY, 0, true)
  const stablePoolBalances = await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: stablePoolTokens.map(t=>({
          target: t,
          params: stablePool
      })),
      chain,
      block
  })
  sdk.util.sumMultiBalanceOf(balances, stablePoolBalances, true, transformPolygon)
  return balances
};

module.exports = {
  methodology: "Includes liquidity on all the pools on the uniswap fork plus the liquidity in the 3FBird stableswap pool",
  tvl,
};
