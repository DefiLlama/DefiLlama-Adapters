const { getConfig } = require('../helper/cache')
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')
const { sumTokens2 } = require('../helper/unwrapLPs')

const pfcore = "https://f8wgg18t1h.execute-api.us-west-1.amazonaws.com/prod/protocol/pfcore/";
const pickleAddress = "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5";

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  timetravel: false,
};

const chains = ['ethereum', 'polygon', 'arbitrum', 'moonriver', 'harmony', 'okexchain', 'cronos', 'aurora', 'metis', 'moonbeam', 'optimism', 'kava']
chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      let { assets: { jars } } = await getConfig('pickle', pfcore)
      let key = chain
      switch (chain) {
        case 'ethereum': key = 'eth'; break;
        case 'okexchain': key = 'okex'; break;
      }
      const vaults = jars.filter(jar => jar.chain === key).map(i => i.contract)
      const tokens = await api.multiCall({ abi: 'address:token', calls: vaults, permitFailure: true })
      const bals = await api.multiCall({ abi: 'uint256:balance', calls: vaults, permitFailure: true })
      tokens.forEach((token, idx) => {
        if (token && bals[idx]) api.add(token, bals[idx])
      })
      api.removeTokenBalance('0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d')
      return sumTokens2({ api, resolveLP: true, })
    }
  }
})

module.exports.ethereum.staking = staking('0xbBCf169eE191A1Ba7371F30A1C344bFC498b29Cf',pickleAddress)
module.exports.ethereum.pool2 = pool2('0xfAA267C3Bb25a82CFDB604136a29895D30fd3fd8','0xdc98556Ce24f007A5eF6dC1CE96322d65832A819')