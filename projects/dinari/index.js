const { getLogs } = require('../helper/cache/getLogs')
const { getUniqueAddresses } = require('../helper/utils')
const { sumUnknownTokens } = require('../helper/unknownTokens');

const tokenFactories = {
  arbitrum: { factory: '0xB4Ca72eA4d072C779254269FD56093D3ADf603b8', fromBlock: 178460216 },
};

function getDinariExport(factoriesConfig) {

  Object.keys(factoriesConfig).forEach(chain => {
    const { factory, fromBlock, } = factoriesConfig[chain];

    module.exports[chain] = {
      tvl: async (_, _b, _cb, { api, }) => {
        const logs = await getLogs({
          api,
          target: factory,
          eventAbi: 'event DShareAdded(address indexed dShare, address indexed wrappedDShare, string indexed symbol, string name)',
          fromBlock,
          skipCache: true,
          onlyArgs: true,
        });
        tokenAddresses = getUniqueAddresses(logs.map(i => i.dShare))
        supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokenAddresses });
        api.addTokens(tokenAddresses, supplies);
        return api.getBalances();
      }
    }
  })

}

getDinariExport(tokenFactories);