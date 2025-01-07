const { sumUnknownTokens } = require("../helper/unknownTokens")

const config = {
    ethereum: "0x3BaC111A6F5ED6A554616373d5c7D858d7c10d88",
    astar: "0xe9B85D6A1727d4B22595bab40018bf9B7407c677"
}

Object.keys(config).forEach(chain => {
    const prestakingAddress = config[chain]
    module.exports[chain] = {
      tvl: async (api) => {
        const data = await api.fetchList({  lengthAbi: 'uint256:poolLength', itemAbi: 'function poolInfo(uint256) view returns (address want, uint256 totalDeposited,uint256,uint256)', target: prestakingAddress, })

        const tokens = data.map(i => i.want)
        const bals  = data.map(i => i.totalDeposited)
        bals.forEach((v, i) => v && api.add(tokens[i], v))
        return sumUnknownTokens({ api, resolveLP: true, useDefaultCoreAssets: true, })
      }
    }
  })