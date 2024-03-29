const { sumUnknownTokens } = require('./helper/unknownTokens')

module.exports = {
  bsc: {
    tvl
  }
}

const poolInfoABI = "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSushiPerShare)"

async function tvl(api) {
  const masterchef = '0x4b7a63837c8cf56e4dcf5140c12388c24030d7df'
  const infos = await api.fetchList({  lengthAbi: 'uint256:poolLength', itemAbi: poolInfoABI, target:masterchef })
  const tokens = infos.map(i => i.lpToken)
  const bals = await api.multiCall({  abi: 'erc20:balanceOf', calls: tokens.map(i => ({ target: i, params: masterchef})) })
  const symbols = await api.multiCall({  abi: 'string:symbol', calls: tokens})
  const fTokens = []
  const fBals = []
  symbols.forEach((v, i) => {
    if (v.startsWith('f')) {
      fTokens.push(tokens[i])
      fBals.push(bals[i])
    } else {
      api.add(tokens[i], bals[i])
    }
  })
  const fuTokens = await api.multiCall({  abi: 'address:token', calls: fTokens})
  const fuBals = await api.multiCall({  abi: 'uint256:balance', calls: fTokens})
  api.addTokens(fuTokens, fuBals)
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true, })
}