const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');
const config = require('./config');
const { log } = require('console');

// DAOCreated event signature
const DAO_CREATED_TOPIC = 'DAOCreated(address,address,address,address,string,string)';

async function tvl(api) {
  const factoryAddress = config[api.chain].factoryAddress;
  // Get all DAOs created through the factory
  const logs = await getLogs({
    api,
    target: factoryAddress,
    topic: DAO_CREATED_TOPIC,
    eventAbi: 'event DAOCreated(address indexed daoAddress, address indexed tokenAddress, address indexed treasuryAddress, address stakingAddress, string name, string versionId)',
    fromBlock: config[api.chain].fromBlock,
    onlyArgs: true,
  });
  
  // Extract treasury addresses and token addresses
  const treasuryAddresses = logs.map(log => log.treasuryAddress);
  const tokenAddresses = logs.map(log => log.tokenAddress);
  
  // Create a set of unique tokens to track
  const uniqueTokens = new Set(tokenAddresses);
  
  // Sum up all native tokens and ERC20 tokens in treasury contracts
  return sumTokens2({ 
    api, 
    owners: treasuryAddresses,
    tokens: [...uniqueTokens], // Include DAO tokens in TVL calculation
  });
}

// Export TVL functions for each supported chain
module.exports = {
  methodology: "TVL consists of funds locked in DAO treasury contracts deployed through the CreateDAO factory",
  arbitrum: { tvl },
  base: { tvl },
  xdai: { tvl },
  polygon: { tvl },
  unichain: { tvl },
  wc: { tvl },
};
