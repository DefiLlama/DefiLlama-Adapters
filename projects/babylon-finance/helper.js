const sdk = require("@defillama/sdk")
const BigNumber = require("bignumber.js")
const { sumTokens2 } = require("../helper/unwrapLPs");

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

      const positionBalances = await sumTokens2({ resolveUniV3: true, chain, block, owner: univ3_Position.vault })


      // Add balances while multiplying amount by ratio of shares
      Object.entries(positionBalances).forEach(async entry => {
        const [key, value] = entry;
        // balances[key] = BigNumber( balances[key] || 0 ).plus(sharesRatio * value);
        sdk.util.sumSingleBalance(balances, await transformAddress(key), BigNumber(sharesRatio * value).toFixed(0))
      });

    } catch (e) {
      sdk.log(`Failed to get data for LP token vault at ${univ3_Position.vault} on chain ${chain}`)
      throw e
    }
  }))
}

module.exports = {
  unwrapUniswapV3LPs
}
