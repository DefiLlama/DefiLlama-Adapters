const sdk = require('@defillama/sdk')
const { default: BigNumber } = require("bignumber.js");

const { getChainTransform, getFixBalances } = require("../helper/portedTokens");
const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const { fetchURL } = require("../helper/utils");

const abi = require('../agora/abi.json');

const chain = 'evmos'

module.exports = {
  evmos: {
    tvl: async (ts, _block, { evmos: block }) => {
      const balances = {}
      const transform = await getChainTransform(chain)

      const res = await fetchURL("http://app.earnmos.fi/api/defi-config.json");

      const vaults = res?.data?.vaults;

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
