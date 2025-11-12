const { sumTokens2 } = require('../helper/unwrapLPs');
const { getCoreAssets } = require('../helper/tokenMapping');

const config = {
  ethereum: {
    locker: ['0x25c9C4B56E820e0DEA438b145284F02D9Ca9Bd52']
  },
  bsc: {
    locker: ['0x25c9C4B56E820e0DEA438b145284F02D9Ca9Bd52']
  },
  base: {
    locker: ['0x25c9C4B56E820e0DEA438b145284F02D9Ca9Bd52']
  },
  arbitrum: {
    locker: ['0x25c9C4B56E820e0DEA438b145284F02D9Ca9Bd52']
  }
};

module.exports = {
  misrepresentedTokens: true,
  methodology: "Tracks the total value of assets locked in GoPlus Locker V3 contracts across multiple chains",
};

Object.keys(config).forEach(chain => {
  const { locker } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const uniV3WhitelistedTokens = await getCoreAssets(api.chain);
      await sumTokens2({ api, owners: locker, resolveUniV3: true, uniV3WhitelistedTokens, });
      return api.getBalancesV2().clone(2).getBalances()
    },
  };
  });