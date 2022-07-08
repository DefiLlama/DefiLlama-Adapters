const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock')
const { ADDRESSES } = require("./constants");
const { getChainTransform } = require('../helper/portedTokens')

function getLpTokenTVL(chain = "ethereum") {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const balances = {}
    const usdc = ADDRESSES[chain].usdc
    const pop = ADDRESSES[chain].pop
    const poolTokens = [usdc, pop]
    const block = await getBlock(timestamp, chain, chainBlocks)
    const chainAddressTransformer = await getChainTransform(chain)
    // For Uni V3 Pool
    const univ3Pool = ADDRESSES[chain].popUsdcUniswapPool;
    if (univ3Pool) {
      const uniBalances = (await sdk.api.abi.multiCall({
        abi: "erc20:balanceOf",
        calls: poolTokens.map(token => ({
          target: token,
          params: [univ3Pool]
        })),
        block,
        chain
      }))
      sdk.util.sumMultiBalanceOf(balances, uniBalances, true)
    }

    // For G-Uni Pool
    const lpPool = ADDRESSES[chain].popUsdcLp;
    if (lpPool) {
      const gUniBalances = (await sdk.api.abi.multiCall({
        abi: "erc20:balanceOf",
        calls: poolTokens.map(token => ({
          target: token,
          params: [lpPool]
        })),
        block,
        chain
      }))
      sdk.util.sumMultiBalanceOf(balances, gUniBalances, true)

    }
    // map addressess
    Object.keys(balances).forEach(tokenAddress => {
      const transformedAddress = chainAddressTransformer(tokenAddress);
      if (transformedAddress !== tokenAddress) {
        balances[transformedAddress] = balances[tokenAddress]
        delete balances[tokenAddress];
      }
    })
    chainAddressTransformer
    return balances
  }
}

module.exports = {
  getLpTokenTVL
}