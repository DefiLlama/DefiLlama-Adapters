const { sumTokens2 } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');
const config = require('./config');

// Event signatures
const DAO_CREATED_TOPIC = 'DAOCreated(address,address,address,address,string,string)';
const PRESALE_DEPLOYED_TOPIC = 'PresaleDeployed(uint256,address,uint256,uint256)';

async function getDAOAddresses(api) {
  const factoryAddress = config[api.chain].factoryAddress;
  
  try {
    // Ensure we have a valid block number
    if (!api.block) {
      try {
        await api.getBlock();
      } catch (blockError) {
        console.log(`${api.chain}: Warning - could not get current block, using cache only`);
        // If we can't get current block, try to use existing cache
      }
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
  } catch (error) {
    console.log(`${api.chain}: Error fetching DAO addresses:`, error.message);
    return { daoAddresses: [], treasuryAddresses: [] };
  }
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
    try {
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
    } catch (error) {
      console.log(`${api.chain}: Error getting presales from DAO ${daoAddress}:`, error.message);
    }
  }
  
  // Remove duplicates (normalize addresses to lowercase for comparison)
  const uniquePresaleAddresses = [...new Set(allPresaleAddresses.map(addr => addr.toLowerCase()))];
  console.log(`${api.chain}: Total unique presale addresses found: ${uniquePresaleAddresses.length}`);
  
  return uniquePresaleAddresses;
}

async function tvl(api) {
  try {
    // Get DAO and treasury addresses
    const { daoAddresses, treasuryAddresses } = await getDAOAddresses(api);
    
    // Get presale addresses dynamically
    const presaleAddresses = await getPresaleAddresses(api, daoAddresses);
    
    // Combine all contract addresses that hold liquidity
    const allOwners = [...treasuryAddresses, ...presaleAddresses];
    
    console.log(`${api.chain}: Total owners to check: ${allOwners.length}`);
    if (allOwners.length > 0) {
      console.log(`${api.chain}: Owner addresses:`, allOwners);
    }
    
    if (allOwners.length === 0) {
      console.log(`${api.chain}: No owners found, returning 0 TVL`);
      return {};
    }
    
    // Create tokensAndOwners array to explicitly check for native ETH
    const ADDRESSES = require('../helper/coreAssets.json');
    const tokensAndOwners = allOwners.map(owner => [ADDRESSES.null, owner]);
    
    console.log(`${api.chain}: Checking native ETH for ${tokensAndOwners.length} tokensAndOwners pairs`);
    
    // Only count native tokens (ETH, MATIC, etc.)
    const result = await sumTokens2({ 
      api, 
      tokensAndOwners,
    });
    
    console.log(`${api.chain}: TVL result:`, result);
    return result;
  } catch (error) {
    console.log(`${api.chain}: Error in TVL calculation:`, error.message);
    return {};
  }
}

// Export TVL functions for each supported chain
module.exports = {
  methodology: "TVL consists of native tokens locked in DAO treasury contracts and presale contracts deployed through CreateDAO DAOs",
  ethereum: { tvl },
  arbitrum: { tvl },
  base: { tvl },
  xdai: { tvl },
  polygon: { tvl },
  unichain: { tvl },
  wc: { tvl },
};
