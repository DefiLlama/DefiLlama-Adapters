const { sumTokens2 } = require('../helper/unwrapLPs')
const abi = require('../helper/abis/masterchef.json')

const vault = '0x571f39d351513146248AcafA9D0509319A327C4D' // vault address
module.exports = {
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      const info = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: vault})
      return sumTokens2({ api, owner: vault, tokens: info.map(i => i.lpToken)})
    }
  }
}