const { getLogs } = require('../helper/cache/getLogs');
const { sumUnknownTokens } = require('../helper/unknownTokens');

const config = {
  bsc: { factory: '0xf870724476912057c807056b29c1161f5fe0199a', fromBlock: 15414926  },
  enuls: { factory: '0xb71A12De824B837eCD30D41384e80C8CDFb5D694', fromBlock: 768727  },
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: () => ({}),
    staking: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x246afd9fb9e1733d63ee77f86f5d1440fb048c65e36822f48d468d9e5e7b8f21'],
        eventAbi: 'event ERC20StakingCreated(address indexed pool, address indexed community, string name, address erc20Token)',
        onlyArgs: true,
        fromBlock,
      })
      return sumUnknownTokens({ api, tokensAndOwners: logs.map(i => [i.erc20Token, i.pool]), useDefaultCoreAssets: true, })
    }
  }
})

