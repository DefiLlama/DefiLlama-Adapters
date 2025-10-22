const { sumTokens2 } = require("../helper/unwrapLPs");

const DETTO_FARM_ADDRESS = "0x6D360d5410b6cdF25fB2D90D36335F228F0Efe48";
const DETTO_FARM_ADDRESS_2 = "0x5232890862C2e15C9595A8bF53460973f4Ec29FA";
const DETTO_TOKEN_ADDRESS = "0x7BC401227777F173Ff871993b198A8632741B9Bb".toLowerCase()

async function getTvl(api, isStaking,farmAddress) {
  let pools = await api.call({ abi: abiInfo.poolTvls, target: farmAddress, })

  pools
    .filter(i => (i.assets.toLowerCase() === DETTO_TOKEN_ADDRESS) === isStaking)
    .forEach(i => api.add(i.assets, i.tvl))

  return await sumTokens2({ api, resolveLP: true, })
}


async function tvl(api) {
  await getTvl(api,false,DETTO_FARM_ADDRESS)
  return await getTvl(api,false,DETTO_FARM_ADDRESS_2)
}

async function staking(api) {
  return getTvl(api, true,DETTO_FARM_ADDRESS)
}

module.exports = {
  hallmarks: [
    [1706745600, "Rug Pull"]
  ],
  base: {
    tvl, staking,
  },
}

const abiInfo = {
  poolTvls:
    "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])",
};
