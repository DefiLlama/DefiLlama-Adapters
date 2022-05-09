const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const { getChainTransform, getFixBalances } = require("../helper/portedTokens");
const sdk = require('@defillama/sdk')
const abi = require('../agora/abi.json');
const { default: BigNumber } = require("bignumber.js");

const vaults = [
  '0xB10eb79B6A381F58f234CB90936E76Ae4a97A476',  // Diff LP DIFF/WEVMOS
  '0x0f91bF3e5a3e4450Ad4f8Af09d03A35069A726D9',  // Diff LP USDC/WEVMOS
  '0x7a2ff76ed75E7e105ECbBE9B11f3dF0Fa89bd369', // Diff LP WETH/WEVMOS
]

const chain = 'evmos'

module.exports = {
  evmos: {
    tvl: async (ts, _block, { evmos: block }) => {
      const balances = {}
      const transform = await getChainTransform(chain)
      const calls = vaults.map(i => ({ target: i}))
      let { output: sharePrice } = await sdk.api.abi.multiCall({ calls, abi: abi.getPricePerFullShare, calls, block, chain})
      let { output: underlying } = await sdk.api.abi.multiCall({ calls, abi: abi.want, calls, block, chain})
      let { output: totalSupply } = await sdk.api.abi.multiCall({ calls, abi: 'erc20:totalSupply', calls, block, chain})

      const turnToMap = (agg, { input, output }) => ({ ...agg, [input.target]: output })
      sharePrice = sharePrice.reduce(turnToMap, {})
      underlying = underlying.reduce(turnToMap, {})
      totalSupply = totalSupply.reduce(turnToMap, {})

      Object.keys(sharePrice).forEach(key => {
        const balance = BigNumber(sharePrice[key]).times(totalSupply[key]).div(10**18).toFixed(0)
        sdk.util.sumSingleBalance(balances, transform(underlying[key]), balance)
      })
      await unwrapLPsAuto({ balances, block, chain })
      const fixBalances = await getFixBalances(chain)
      fixBalances(balances)
      return balances
    },
  },
};