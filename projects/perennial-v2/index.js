const { getLogs } = require('../helper/cache/getLogs');

const config = {
  arbitrum: {
    dsu: '0x52c64b8998eb7c80b6f526e99e29abdcc86b841b',
    factory: '0xDaD8A103473dfd47F90168A0E46766ed48e26EC7',
    fromBlock: 135921706,
  },
};

Object.keys(config).forEach((chain) => {
  const { factory, fromBlock, dsu } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event InstanceRegistered (address indexed instance)',
        onlyArgs: true,
        fromBlock,
      });
      return api.sumTokens({
        tokensAndOwners: logs.map((log) => [dsu, log.instance]),
      });
    },
  };
});
