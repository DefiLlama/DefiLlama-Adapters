const { getLogs } = require('../helper/cache/getLogs')
const { getWhitelistedNFTs } = require('../helper/tokenMapping');
const { sumTokens2 } = require('../helper/unwrapLPs');

const { VAULT_FACTORY_ABI } = require('./abi');
const {
  LOAN_CORE,
  START_BLOCKS,
  VAULT_FACTORIES,
  VAULT_FACTORY_A,
} = require('./constants');

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
      eventAbi: VAULT_FACTORY_ABI,
      onlyArgs: true,
    });
  });
  const logs = await Promise.all(logPromises);

  // Parse each log and extract vault address
  return logs.flat().map(log => log.vault);
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
  return sumTokens2({
    owners: [...vaultAddresses, LOAN_CORE],
    tokens: getWhitelistedNFTs(),
    api,
  });
}

module.exports = {
  methodology: `Counts the floor value of all vaulted and escrowed NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  start: START_BLOCKS[VAULT_FACTORY_A],
  ethereum: { tvl },
}
