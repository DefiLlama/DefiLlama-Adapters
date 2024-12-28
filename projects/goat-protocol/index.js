const { getConfig } = require('../helper/cache');
const { staking } = require('../helper/staking')

const GOA_TOKEN_CONTRACT = '0x8c6Bd546fB8B53fE371654a0E54D7a5bD484b319';
const REWARD_POOL_CONTRACT = '0xAD9CE8580a1Cd887038405275cB02443E8fb88aC';

const config = {
  arbitrum: {}
}

module.exports = {
  doublecounted: true,
  hallmarks: [
    [1732186800, "Multistrategies Launch"]
  ],
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const multistrategies = await getConfig('goat-protocol', `https://api.goat.fi/multistrategies`);
      const calls = multistrategies.filter(multistrategy => multistrategy.chain === api.chain).map(multistrategy => multistrategy.address);
      return api.erc4626Sum({ calls, isOG4626: true, })
    }
  }
})

module.exports.arbitrum.staking = staking(REWARD_POOL_CONTRACT, GOA_TOKEN_CONTRACT)