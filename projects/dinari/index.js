const { getLogs } = require('../helper/cache/getLogs')
const { getUniqueAddresses } = require('../helper/utils')

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
          topic: '0x35c7978dcf8171bb46371f6b24d3d16faf27279eafd5e22ae1350a4aa458e977',
          onlyArgs: true,
          fromBlock,
          skipCache: true
        });
        const tokenAddresses = getUniqueAddresses(logs.map(i => i.dShare))
        supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokenAddresses });
        api.add(tokenAddresses, supplies);
        return api.getBalances();
      }
    }
  })

}

getDinariExport(tokenFactories);