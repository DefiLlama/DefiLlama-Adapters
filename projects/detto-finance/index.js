const { sumTokens2 } = require("../helper/unwrapLPs");

const DETTO_FARM_ADDRESS = "0x6D360d5410b6cdF25fB2D90D36335F228F0Efe48";
const DETTO_TOKEN_ADDRESS = "0x7BC401227777F173Ff871993b198A8632741B9Bb".toLowerCase()

async function getTvl(api, isStaking = false) {
  let pools = await api.call({ abi: abiInfo.poolTvls, target: DETTO_FARM_ADDRESS, })
  pools
    .filter(i => (i.assets.toLowerCase() === DETTO_TOKEN_ADDRESS) === isStaking)
    .forEach(i => api.add(i.assets, i.tvl))

  await sumTokens2({ api, resolveLP: true, })
}


async function tvl(_, _1, _2, { api }) {
  return getTvl(api)
}

async function staking(_, _1, _2, { api }) {
  return getTvl(api, true)
}

module.exports = {
  base: {
    tvl, staking,
  },
}

const abiInfo = {
  poolTvls:
    "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
};
