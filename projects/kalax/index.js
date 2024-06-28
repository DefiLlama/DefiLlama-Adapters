const { sumTokens2 } = require("../helper/unwrapLPs")

const KALAX = "0x2F67F59b3629Bf24962290DB9edE0CD4127e606D"
const farms = ['0xE63153C3360aCa0F4e7Ca7A1FC61c2215FAEF5A1', '0xFe899401A1d86cC1113020fb40878c76239142a5']

async function tvl(api) {
  let pools = (await api.multiCall({ abi: abiInfo.poolInfos, calls: farms })).flat()
  pools
    .filter((i) => i.assets !== KALAX)
    .forEach((i) => api.add(i.assets, i.tvl))

  return sumTokens2({ api, resolveLP: true })
}

async function staking(api) {
  let pools = (await api.multiCall({ abi: abiInfo.poolInfos, calls: farms })).flat()
  pools.filter((i) => i.assets === KALAX).forEach((i) => api.add(i.assets, i.tvl))
}

module.exports = {
  blast: {
    tvl,
    staking,
  },
}

const abiInfo = {
  poolInfos:
    "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
}
