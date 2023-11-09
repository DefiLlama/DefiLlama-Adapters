const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const conditionalTokensContract = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045'
const polygonUsdcContract = ADDRESSES.polygon.USDC

async function polygon(timestamp, block, chainBlocks) {
  // Get markets liquidity using API
  //const marketsLiquidity = (await getMarketsLiquidity_api()).times(1e6)
  //const marketsLiquidity = (await getMarketsLiquidity_graphql(timestamp, block, chainBlocks)).times(1e6)

  // Also account for USDC held in the conditional tokens contract because a lot of positions are held outside of the LPs
  // Corresponds to open positions that should be counted as TVL (since they still represent USDC locked into the conditional tokens contract)
  let conditionalTokensUSDC = await sdk.api.erc20.balanceOf({
    target: polygonUsdcContract,
    owner: conditionalTokensContract,
    block: chainBlocks['polygon'],
    chain: 'polygon'
  })
  //conditionalTokensUSDC = BigNumber(conditionalTokensUSDC.output)

  // Total open interest: the conditional tokens are held at 0x4D97DCd97eC945f40cF65F87097ACe5EA0476045 and then each market has it's own contract, the address of which is the id of the FixedProductMarketMaker
  //const tvl = marketsLiquidity.plus(conditionalTokensUSDC).toFixed(0)
  //sdk.log(`-----\n${marketsLiquidity.div(1e12).toFixed(8)}M of marketsLiquidity \n${conditionalTokensUSDC.div(1e12).toFixed(8)}M of conditionalTokensUSDC \nTVL: ${BigNumber(tvl).div(1e12).toFixed(2)}M\n`)
  return {['polygon:' + polygonUsdcContract]: conditionalTokensUSDC.output};
}


module.exports = {
  polygon: {
    tvl: polygon
  },
  methodology: `TVL is the total quantity of USDC held in the conditional tokens contract as well as USDC collateral submitted to every polymarket' markets ever opened - once the markets resolve, participants can withdraw theire share given the redeption rate and their input stake, but they do not all do it.`
}
