const abis = require('./config/smoothy/abis.js')
const { toUSDTBalances } = require('./helper/balances');
const imp = '0xe5859f4efc09027a9b718781dcb2c6910cac6e91';
const sdk = require("@defillama/sdk");

module.exports = {
  ethereum: {
    tvl: async (ts, block) => {
      let tvl = 0
      const { output: poolLength } = await sdk.api.abi.call({
        block,
        target: imp,
        abi: abis.abis.smoothy._ntokens
      })
      const calls = []
      for (let i = 0; i < poolLength; i++)
        calls.push({ params: [i] })

      const { output: tvls } = await sdk.api.abi.multiCall({
        block,
        calls,
        target: imp,
        abi: abis.abis.smoothy.getTokenStats
      })
      tvls.forEach(t => tvl += t.output.balance / 10 ** t.output.decimals)
      return toUSDTBalances(tvl)
    }
  },

  bsc: {
    tvl: async (ts, _block, { bsc: block }) => {
      let tvl = 0
      const { output: poolLength } = await sdk.api.abi.call({
        block,
        target: imp,
        chain: 'bsc',
        abi: abis.abis.smoothy._ntokens
      })
      const calls = []
      for (let i = 0; i < poolLength; i++)
        calls.push({ params: [i] })

      const { output: tvls } = await sdk.api.abi.multiCall({
        block,
        calls,
        target: imp,
        chain: 'bsc',
        abi: abis.abis.smoothy.getTokenStats
      })
      tvls.forEach(t => tvl += t.output.balance / 10 ** t.output.decimals)
      return toUSDTBalances(tvl)
    }
  }
}
