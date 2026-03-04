const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');
const ADDRESSES = require('../helper/coreAssets.json');
const config = require('./config');

const DAO_CREATED_EVENT = 'event DAOCreated(address indexed creator, address indexed token, address indexed governor, address timelock, string daoName, string tokenName, string tokenSymbol, uint256 totalSupply)';

async function tvl(api) {
  const { factoryAddress, fromBlock } = config[api.chain];

  const daoLogs = await getLogs({
    api,
    target: factoryAddress,
    eventAbi: DAO_CREATED_EVENT,
    fromBlock,
    onlyArgs: true,
  });

  const timelockAddresses = daoLogs.map(log => log.timelock);

  if (timelockAddresses.length === 0) return {};

  const balances = {};
  const CHUNK_SIZE = 10;
  for (let i = 0; i < timelockAddresses.length; i += CHUNK_SIZE) {
    const chunk = timelockAddresses.slice(i, i + CHUNK_SIZE);
    await sumTokens2({
      balances,
      api,
      owners: chunk,
      tokens: [ADDRESSES.null],
      fetchCoValentTokens: true,
    });
  }
  return balances;
}

module.exports = {
  methodology: 'TVL counts all assets (ETH and ERC20 tokens) held in DAO treasury (TimelockController) contracts created through the CreateDAO v2 factory.',
  ethereum: { tvl },
};
