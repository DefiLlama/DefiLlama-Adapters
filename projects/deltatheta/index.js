// Delta.theta Factory ABI (for needed calls)
const factoryABI = require('./factory.abi');
const { sumTokens2 } = require('../helper/unwrapLPs');

// Delta.theta Factory Address (On all chains)
const FACTORY_ADDRESS = '0x000000000092126dc1bcec881165f92169733106';

// TVL function generator (for BSC & POLYGON chains)
async function tvl(api) {
  const pairs = await api.fetchList({ lengthAbi: factoryABI.pairsLength, itemAbi: factoryABI.pairsList, target: FACTORY_ADDRESS })
  return sumTokens2({ api, owners: pairs, fetchCoValentTokens: true, blacklistedTokens: ['0x3a06212763caf64bf101daa4b0cebb0cd393fa1a'], permitFailure: true });
}

module.exports = {
  methodology: 'Parsing the balances of all tokens on the pair addresses of decentralized exchange Delta.theta',
  bsc: { tvl },
  polygon: { tvl },
};
