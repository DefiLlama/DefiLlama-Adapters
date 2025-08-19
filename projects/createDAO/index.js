const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');
const config = require('./config');

// Event signatures
const DAO_CREATED_TOPIC = 'DAOCreated(address,address,address,address,string,string)';
const PRESALE_DEPLOYED_TOPIC = 'PresaleDeployed(uint256,address,uint256,uint256)';

async function getDAOAddresses(api) {
  const factoryAddress = config[api.chain].factoryAddress;
  
  // Ensure we have a valid block number
  if (!api.block) {
    await api.getBlock();
  }
  
  // Get all DAOs created through the factory
  const daoLogs = await getLogs({
    api,
    target: factoryAddress,
    topic: DAO_CREATED_TOPIC,
    eventAbi: 'event DAOCreated(address indexed daoAddress, address indexed tokenAddress, address indexed treasuryAddress, address stakingAddress, string name, string versionId)',
    fromBlock: config[api.chain].fromBlock,
    toBlock: api.block,
    onlyArgs: true,
    onlyUseExistingCache: !api.block, // Use cache only if we don't have current block
  });
  
  const daoAddresses = daoLogs.map(log => log.daoAddress);
  const treasuryAddresses = daoLogs.map(log => log.treasuryAddress);
  
  console.log(`${api.chain}: Found ${daoLogs.length} DAOs, ${treasuryAddresses.length} treasuries`);
  if (daoAddresses.length > 0) {
    console.log(`${api.chain}: DAO addresses:`, daoAddresses);
  }
  
  return { daoAddresses, treasuryAddresses };
}

async function getPresaleAddresses(api, daoAddresses) {
  if (daoAddresses.length === 0) {
    console.log(`${api.chain}: No DAOs found, skipping presale discovery`);
    return [];
  }
  
  console.log(`${api.chain}: Checking for presale events from ${daoAddresses.length} DAOs...`);
  
  let allPresaleAddresses = [];
  
  // Get presale events from each DAO
  for (const daoAddress of daoAddresses) {
    const presaleLogs = await getLogs({
      api,
      target: daoAddress,
      topic: PRESALE_DEPLOYED_TOPIC,
      eventAbi: 'event PresaleDeployed(uint256 indexed proposalId, address indexed presaleContract, uint256 amount, uint256 initialPrice)',
      fromBlock: config[api.chain].fromBlock,
      toBlock: api.block,
      onlyArgs: true,
      onlyUseExistingCache: !api.block, // Use cache only if we don't have current block
    });
    
    const presaleAddresses = presaleLogs.map(log => log.presaleContract);
    allPresaleAddresses.push(...presaleAddresses);
    
    if (presaleAddresses.length > 0) {
      console.log(`${api.chain}: Found ${presaleAddresses.length} presales from DAO ${daoAddress}:`, presaleAddresses);
    }
  }
  
  // Remove duplicates (normalize addresses to lowercase for comparison)
  const uniquePresaleAddresses = [...new Set(allPresaleAddresses.map(addr => addr.toLowerCase()))];
  console.log(`${api.chain}: Total unique presale addresses found: ${uniquePresaleAddresses.length}`);
  
  return uniquePresaleAddresses;
}

async function tvl(api) {
  // Get DAO addresses
  const { daoAddresses } = await getDAOAddresses(api);
  
  // Get presale addresses dynamically (these are circulating - AMM liquidity)
  const presaleAddresses = await getPresaleAddresses(api, daoAddresses);
  
  console.log(`${api.chain}: Total presale addresses to check: ${presaleAddresses.length}`);
  if (presaleAddresses.length > 0) {
    console.log(`${api.chain}: Presale addresses:`, presaleAddresses);
  }
  
  if (presaleAddresses.length === 0) {
    console.log(`${api.chain}: No presale addresses found, returning 0 TVL`);
    return {};
  }
  
  // Create tokensAndOwners array to explicitly check for native ETH
  const ADDRESSES = require('../helper/coreAssets.json');
  const tokensAndOwners = presaleAddresses.map(owner => [ADDRESSES.null, owner]);
  
  console.log(`${api.chain}: Checking native tokens for ${tokensAndOwners.length} presale contracts`);
  
  // Only count native tokens (ETH, MATIC, etc.) in presale contracts
  const result = await sumTokens2({ 
    api, 
    tokensAndOwners,
  });
  
  console.log(`${api.chain}: TVL result:`, result);
  return result;
}

async function vesting(api) {
  // Get treasury addresses (these are non-circulating - DAO controlled funds)
  const { treasuryAddresses } = await getDAOAddresses(api);
  
  console.log(`${api.chain}: Total treasury addresses to check: ${treasuryAddresses.length}`);
  if (treasuryAddresses.length > 0) {
    console.log(`${api.chain}: Treasury addresses:`, treasuryAddresses);
  }
  
  if (treasuryAddresses.length === 0) {
    console.log(`${api.chain}: No treasury addresses found, returning 0 vesting`);
    return {};
  }
  
  // Count all tokens in treasury addresses (they can hold any ERC20 tokens)
  const result = await sumTokens2({ 
    api, 
    owners: treasuryAddresses,
  });
  
  console.log(`${api.chain}: Vesting result:`, result);
  return result;
}

// Export TVL and vesting functions for each supported chain
module.exports = {
  methodology: "TVL consists of native tokens in presale AMM contracts (circulating). Vesting consists of all tokens in DAO treasury contracts (non-circulating, DAO-controlled funds).",
  ethereum: { tvl, vesting },
  arbitrum: { tvl, vesting },
  base: { tvl, vesting },
  xdai: { tvl, vesting },
  polygon: { tvl, vesting },
  unichain: { tvl, vesting },
  wc: { tvl, vesting },
};
