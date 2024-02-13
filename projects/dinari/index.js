const { getLogs } = require('../helper/cache/getLogs')

const dinariEventConfig = {
  eventAbi: 'event DShareAdded(address indexed dShare, address indexed wrappedDShare, string indexed symbol, string name)',
  topics: ['0x35c7978dcf8171bb46371f6b24d3d16faf27279eafd5e22ae1350a4aa458e977'],
}

const tokenFactories = {
  arbitrum: { factory: '0xABCD', fromBlock: 1337 },
};

async function getDinariExport(factoriesConfig) {
  const exports = {};

  const topics = dinariEventConfig.topics;
  const eventAbi = dinariEventConfig.eventAbi;

  Object.keys(factoriesConfig).forEach(chain => {
    const { factory: target, fromBlock } = factoriesConfig[chain];

    exports[chain] = {
      tvl: async (_, _b, _cb, { api, }) => {
        const logs = await getLogs({
          api,
          target,
          topics,
          fromBlock,
          eventAbi,
          onlyArgs: true,
        });

        const tokenAddresses = logs.map(i => i.dShare);
        supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokenAddresses });
        api.addTokens(tokenAddresses, supplies);
        return api.getBalances();
      }
    }
  })

  return exports;
}

module.exports = getDinariExport(tokenFactories, api);
