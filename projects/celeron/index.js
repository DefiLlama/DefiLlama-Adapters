const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  mode: {
    celeron: '0x8b83ECC4EF8FaEc5c05b7D6EC002B659BE137120', // CEL_ADDRESS
    staking: '0x3384D85EC14163a9d35eeAb44261390aafD70f82', // FARM_ADDRESS
    farms: ['0x8D25067901B637D0eF1DF3163D782d89d53F403A'], // FARM_IONIC_ADDRESS
  },
  berachain: {
    celeron: '0xD3415dCFbdA117814e24a4cbaf61128A4D79b860', // BERACHAIN_CEL_ADDRESS
    staking: '0xAbFc9bb50af39D1e6f99836Ff2EeCc39778808a1', // BERACHAIN_FARM_ADDRESS
    farms: [
      '0xAbFc9bb50af39D1e6f99836Ff2EeCc39778808a1', // BERACHAIN_FARM_ADDRESS
      '0x5CC7BebF2A05fC4b7F259C8688Ff0d80735E36FE', // BERACHAIN_FARM_LP_ADDRESS
      '0xd69836d43024692eB57fd7DFe417dd8da3A7c91c', // BERACHAIN_FARM_HONEY_ADDRESS
      '0xC03a0B83d83Cc99EEE73222BC70BEB6b2010D3c5', // BERACHAIN_FARM_EULER_USDC_ADDRESS
    ],
  }
}

const abis = {
  getPoolTotalTvl: "function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])"
}

const tvl = async (api) => {
  const { farms } = config[api.chain]
  const pools = (await api.multiCall({ abi: abis.getPoolTotalTvl, calls: farms })).flat()
  pools.forEach(({ assets, tvl }) => { api.add(assets, tvl) })
  return sumTokens2({ api, resolveLP: true });
}

const staking = async (api) => {
  const { celeron, staking } = config[api.chain]
  const pools = await api.call({ abi: abis.getPoolTotalTvl, target: staking })
  const target = pools.find((i) => i.assets === celeron)
  api.add(celeron, target.tvl)
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl, staking }
})

module.exports.hallmarks = [
  [1749329197, "Rug Pull"],
]
