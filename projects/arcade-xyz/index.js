const { getWhitelistedNFTs } = require('../helper/tokenMapping');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { fetchVaults } = require('./queries');

const {
  LOAN_CORE,
  START_BLOCKS,
  VAULT_FACTORY_A,
} = require('./constants');

// Uses chainlink oracle floor price for all whitelisted NFTS owned by every vault and the Loan Core contract.
// Tokens owned by vaults have been wrapped into an Arcade.xyz vault. Tokens owned by the Loan Core contract
// are currently in escrow.
async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  // Get list of all vaults
  const vaults = await fetchVaults();
  const vaultAddresses = vaults.map(v => v.address);

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
