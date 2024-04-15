const sdk = require("@defillama/sdk");

const { fetchVaults, fetchLoans } = require('./queries');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { sumArtBlocks, isArtBlocks, } = require('../helper/nft');

const {
  LOAN_CORE,
  LOAN_CORE_V3,
  START_BLOCKS,
  VAULT_FACTORY_A,
} = require('./constants');

// Uses chainlink oracle floor price for all whitelisted NFTS owned by every vault and the Loan Core contract.
// Tokens owned by vaults have been wrapped into an Arcade.xyz vault. Tokens owned by the Loan Core contract
// are currently in escrow.
async function tvl(api) {
  // Get list of all vaults
  const vaults = await fetchVaults(api.block)
  const balances = {}
  const artBlockOwners = []

  // Sum up total count of each token
  for (const vault of vaults) {
    const collateral = vault.collateral ?? [];

    for (const token of collateral) {
      const { collectionAddress, amount } = token;
      if (isArtBlocks(collectionAddress)) {
        artBlockOwners.push(vault.address)
        continue;
      }
      sdk.util.sumSingleBalance(balances,collectionAddress,amount, api.chain)
    }
  }

  await sumArtBlocks({ balances, api, owners: artBlockOwners, })
  // Initialize balances with tokens held by the escrow contract, Loan Core
  return sumTokens2({
    balances,
    owners: [LOAN_CORE, LOAN_CORE_V3],
    resolveNFTs: true,
    api,
  });
}

// Fetches all active loans, their payable curency and amount borrowed then sums it up.
async function borrowed(api) {
  const loans = await fetchLoans(api.block);

  // Iterate over each loan to sum up principal by currency
  for (const loan of loans) {
    const { payableCurrency, principal, interestRate } = loan;
    api.add(payableCurrency, principal)
    const interest = principal * interestRate / 1e21
    api.add(payableCurrency, interest)
  }

  return api.getBalances();
}

module.exports = {
  methodology: `Sums up the floor value of all vaulted and escrowed NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  start: START_BLOCKS[VAULT_FACTORY_A],
  ethereum: { tvl, borrowed },
  hallmarks: [
    [1660762840, 'V2 Protocol Launch'],
    [1694026811, 'V3 Protocol Launch'],
  ],
}
