const ethers = require('ethers');

const { getLogs } = require('../helper/cache/getLogs')
const { getWhitelistedNFTs } = require('../helper/tokenMapping');
const { sumTokens2 } = require('../helper/unwrapLPs');

const { VAULT_FACTORY_ABI } = require('./abi');
const {
  CHAIN,
  LOAN_CORE,
  START_BLOCKS,
  VAULT_FACTORIES,
  VAULT_FACTORY_A,
} = require('./constants');
const { flattenOnce } = require('./utils');

// VaultFactory Interface, used to parse logs
const vaultFactoryIface = new ethers.utils.Interface(VAULT_FACTORY_ABI);

// Returns a list of all vanilla and staking vaults by finding all VaultCreated
// logs and getting the vault address.
async function getVaultAddresses(api, vaultFactoryAddresses, startBlocks) {
  const logPromises = vaultFactoryAddresses.map(async function(target) {
    // Get the block the contract was deployed at
    const fromBlock = startBlocks.get(target);

    // Filter logs with VaultCreated event signature
    return getLogs({
      api,
      target,
      fromBlock,
      topic: 'VaultCreated(address,address)',
    });
  });
  const logs = await Promise.all(logPromises);

  // Parse each log and extract vault address
  return flattenOnce(logs).map((log) => vaultFactoryIface.parseLog(log).args.vault);
}

// Uses chainlink oracle floor price for all whitelisted NFTS owned by every vault and the Loan Core contract.
// Tokens owned by vaults have been wrapped into an Arcade.xyz vault. Tokens owned by the Loan Core contract
// are currently in escrow.
async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  // Get list of all vaults
  const vaultAddresses = await getVaultAddresses(api, Array.from(VAULT_FACTORIES), START_BLOCKS);

  // sum of the value of all owned tokens is:
  // token.balanceOf(owner) * chainlinkOracle.floorPrice(token)
  // summed up for each owner
  const tvl = await sumTokens2({
    owners: [...vaultAddresses, LOAN_CORE],
    tokens: getWhitelistedNFTs(),
    chain: CHAIN,
    api,
  });

  return tvl;
}

module.exports = {
  misrepresentedTokens: true, 
  methodology: `Counts the floor value of all vaulted and escrowed NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  start: START_BLOCKS[VAULT_FACTORY_A],
  [CHAIN]: { tvl },
}
