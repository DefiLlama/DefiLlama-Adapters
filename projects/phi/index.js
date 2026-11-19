const { sumTokensExport } = require('../helper/unwrapLPs');
const { nullAddress } = require('../helper/unwrapLPs');
const { getLogs } = require('../helper/cache/getLogs');

// Phi Protocol - On-chain identity and credentialing protocol
// Based on https://docs.phi.box/explore-phi/

const PHI_CONTRACTS = {
  base: {
    rewards: "0x4E6Ba9980E66DeD2141a6ab724A1FBbbcC0FD309", // PhiRewards contract  
    cred: "0xbe28Ee6415A82f3BE336097211bE79af6Ce9586c", // Cred contract
    phiEthFactory: "0x7C9E79683D018830B3a8bfAA1C7eA1b4835007D0", // PhiEthFactory contract
    fromBlock: 20990053, // Base deployment block - Cred contract deployment
  }
};

async function getDeployedHooks(api, contracts) {
  // Get all hook contracts deployed by PhiEthFactory
  const logs = await getLogs({
    api,
    target: contracts.phiEthFactory,
    fromBlock: contracts.fromBlock,
    eventAbi: 'event PhiEthCreated(address indexed phiEthToken, address indexed strategy, address indexed phiEthHook, address creator)',
    onlyArgs: true,
  });

  // Extract PhiEth hook addresses and token addresses from factory events
  const hookAddresses = logs.map(log => log.phiEthHook);
  const tokenAddresses = logs.map(log => log.phiEthToken);
  
  return { hookAddresses, tokenAddresses };
}

async function tvl(api) {
  const chain = api.chain;
  const contracts = PHI_CONTRACTS[chain];
  
  if (!contracts) {
    return {};
  }

  // Phi Protocol TVL calculation
  const tokensAndOwners = [];
  
  // Add ETH holdings from main contracts
  if (contracts.rewards) {
    tokensAndOwners.push([nullAddress, contracts.rewards]);
  }
  
  if (contracts.phiEthFactory) {
    tokensAndOwners.push([nullAddress, contracts.phiEthFactory]);
  }

  // Get all deployed hook contracts and tokens from PhiEthFactory
  const { hookAddresses, tokenAddresses } = await getDeployedHooks(api, contracts);
  
  // Add ETH holdings from all deployed hook contracts
  hookAddresses.forEach(hookAddress => {
    tokensAndOwners.push([nullAddress, hookAddress]);
  });
  
  // Add ETH holdings from all deployed PhiEth token contracts
  tokenAddresses.forEach(tokenAddress => {
    tokensAndOwners.push([nullAddress, tokenAddress]);
  });

  return api.sumTokens({ tokensAndOwners });
}

module.exports = {
  methodology: `Phi Protocol is an open credentialing protocol for on-chain identity. TVL is calculated by summing ETH held in core protocol contracts (PhiRewards, PhiEthFactory) and all hook contracts and PhiEth token contracts deployed by PhiEthFactory on Base network.`,
  base: {
    tvl,
  },
  timetravel: false,
  misrepresentedTokens: true,
  hallmarks: [
    // Add significant events for Phi Protocol when available
  ],
};