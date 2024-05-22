const { yieldHelper } = require("../helper/unknownTokens");
const { getConfig } = require('../helper/cache');
const { staking } = require('../helper/staking')

const chain = "arbitrum";
const tokenAPI = "address:want";
const GOA_TOKEN_CONTRACT = '0x8c6Bd546fB8B53fE371654a0E54D7a5bD484b319';
const REWARD_POOL_CONTRACT = '0xAD9CE8580a1Cd887038405275cB02443E8fb88aC';

module.exports = {
  timetravel: false,
    doublecounted: true,
  [chain]: {
    tvl: async (_, _b, { [chain]: block }) => {
      const pools = await getConfig('goat-protocol', 'https://raw.githubusercontent.com/goatfi/goat-address-book/main/vault-registry/arbitrum.json');
      const vaults = [];
      for(var i = 0; i < pools.length; i++)
        if(pools[i].platformId != 'goatfi')
          vaults.push(pools[i].earnedTokenAddress);
      return yieldHelper({ vaults, chain, block, tokenAPI, useDefaultCoreAssets: true, })
    },
    staking: staking(REWARD_POOL_CONTRACT, GOA_TOKEN_CONTRACT)
  }
}