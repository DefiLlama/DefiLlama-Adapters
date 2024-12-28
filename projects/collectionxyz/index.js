const { getLogs } = require('../helper/cache/getLogs');
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');

const FACTORY_ADDRESS_1 = '0x03b51826a4868780db375ee27e5b0adaac5274ee';
const FACTORY_ADDRESS_2 = '0x7a1D4c6E8edbd8a9314034356b29419e1b1B44f0';
const START_BLOCK_1 = 16932638;
const START_BLOCK_2 = 17277832;
const EVENT_ABI = 'event NewPool (address indexed collection, address indexed poolAddress)';
const TOPIC_HASH = '0x77948cb83ef3caff9ac13dfab1ea1f8a6875c98370287ce587f5dbc74cc5b6b0';

async function getPoolLogs(api, factory, startBlock) {
  return await getLogs({
    api,
    target: factory,
    topics: [TOPIC_HASH],
    eventAbi: EVENT_ABI,
    onlyArgs: true,
    fromBlock: startBlock,
  });
}

async function getTotalValueLocked(api) {
  const logsFactory1 = await getPoolLogs(api, FACTORY_ADDRESS_1, START_BLOCK_1);
  const logsFactory2 = await getPoolLogs(api, FACTORY_ADDRESS_2, START_BLOCK_2);
  const allLogs = [...logsFactory1, ...logsFactory2];
  
  api.log('Pool length: ', allLogs.length);

  const tokensAndOwners = allLogs.flatMap(log => [
    [log.collection, log.poolAddress],
    [nullAddress, log.poolAddress]
  ]);

  return sumTokens2({ api, tokensAndOwners });
}

module.exports = {
  ethereum: {
    tvl: getTotalValueLocked,
  },
};
