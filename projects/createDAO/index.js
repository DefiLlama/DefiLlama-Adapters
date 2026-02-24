const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');
const config = require('./config');

// Event signatures
const DAO_CREATED_TOPIC = 'DAOCreated(address,address,address,address,string,string)';

async function getDAOAddresses(api) {
  const factoryAddress = config[api.chain].factoryAddress;


  // Get all DAOs created through the factory
  const daoLogs = await getLogs({
    api,
    target: factoryAddress,
    topic: DAO_CREATED_TOPIC,
    eventAbi: 'event DAOCreated(address indexed daoAddress, address indexed tokenAddress, address indexed treasuryAddress, address stakingAddress, string name, string versionId)',
    fromBlock: config[api.chain].fromBlock,
    onlyArgs: true,
  });

  const daoAddresses = daoLogs.map(log => log.daoAddress);
  const treasuryAddresses = daoLogs.map(log => log.treasuryAddress);

  return { daoAddresses, treasuryAddresses };
}

async function getPresaleAddresses(api, daoAddresses) {
  return (await api.fetchList({ lengthAbi: 'proposalCount', itemAbi: 'getPresaleContract', targets: daoAddresses })).filter(i => i !== nullAddress)
}

async function tvl(api) {
  // Get DAO addresses
  const { daoAddresses } = await getDAOAddresses(api);
  // Get presale addresses dynamically (these are circulating - AMM liquidity)
  const presaleAddresses = await getPresaleAddresses(api, daoAddresses);
  // Only count native tokens (ETH, MATIC, etc.) in presale contracts
  return sumTokens2({ api, owners: presaleAddresses, tokens: [nullAddress], });
}

// Export TVL and vesting functions for each supported chain
module.exports = {
  methodology: "TVL consists of native tokens in presale AMM contracts (circulating)",
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})