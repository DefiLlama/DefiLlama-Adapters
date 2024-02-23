const { getLogs } = require('../helper/cache/getLogs')
const { getUniqueAddresses } = require('../helper/utils')
const { chainlink_oracles } = require('./helpers/utils')

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

        const symbols = await api.multiCall({ abi: 'erc20:symbol', calls: tokenAddresses });

        let prices = {};
        let totalValue = 0;
        for (let i = 0; i < symbols.length; i++) {
          let symbol = symbols[i];
          if (chainlink_oracles[symbol]) {
            const oracleAddress = chainlink_oracles[symbol];
            const priceData = await api.multiCall({
              abi: 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
              calls: [{ target: oracleAddress }]
            });
            const price = priceData[0].answer / (10 ** 8);
            prices[symbol] = price;

            const supply = supplies[i] / (10 ** 18);
            const value = supply * price;
            totalValue += value;
          }
        }
        return {
          tether: totalValue
        };
      }
    }
  })

}

getDinariExport(tokenFactories);