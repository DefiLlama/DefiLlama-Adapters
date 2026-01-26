const { sumUnknownTokens } = require("../helper/unknownTokens")

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
}


const config = {
  cronos: '0x66D586eae9B30CD730155Cb7fb361e79D372eA2a',
  dogechain: '0xf5e5271432089254288F47d6F2CFcfE066377900',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const poolInfos = await api.fetchList({  lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: config[chain] })
      const lps = poolInfos.map(pool => pool.want)
      const strategies = poolInfos.map(pool => pool.strategy)
      const bals = await api.multiCall({  abi: abi.wantLockedTotal, calls: strategies })
      api.add(lps, bals)
      return sumUnknownTokens({ api, lps, resolveLP: true })
    }
  }
})

const abi = {
  "poolLength": "uint256:poolLength",
  "wantLockedTotal": "uint256:wantLockedTotal",
  "poolInfo": "function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardTime, address strategy, uint256 earlyWithdrawFee, uint256 earlyWithdrawTime)"
}