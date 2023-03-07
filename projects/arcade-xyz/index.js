const BN = require('bignumber.js');
const sdk = require("@defillama/sdk");

const { fetchVaults, fetchLoans } = require('./queries');
const { sumTokens2 } = require('../helper/unwrapLPs');
const whitelistedNfts = require('../helper/whitelistedNfts');

const {
  LOAN_CORE,
  START_BLOCKS,
  VAULT_FACTORY_A,
} = require('./constants');

// Uses chainlink oracle floor price for all whitelisted NFTS owned by every vault and the Loan Core contract.
// Tokens owned by vaults have been wrapped into an Arcade.xyz vault. Tokens owned by the Loan Core contract
// are currently in escrow.
async function tvl(timestamp, block, chainBlocks, { api }) {
  // Get list of all vaults
  const vaults = await fetchVaults(block+'');

  // Sum up total count of each token
  const totals = new Map();
  for (const vault of vaults) {
    const collateral = vault.collateral ?? [];

    for (const token of collateral) {
      const { collectionAddress, amount } = token;
      let total = totals.get(collectionAddress);
      if (total == null) {
        total = new BN(0);
      }

      total = total.plus(amount);
      totals.set(collectionAddress, total);
    }
  }

  // Initialize balances with tokens held by the escrow contract, Loan Core
  const balances = await sumTokens2({
    owners: [LOAN_CORE],
    tokens: whitelistedNfts.ethereum,
  });


  // Aggregate count of whitelisted tokens into balances object
  for (const collection of whitelistedNfts.ethereum) {
    const total = totals.get(collection);
    if (total == null) continue;

    sdk.util.sumSingleBalance(balances, collection, total.toFixed(0));
  }

  return balances;
}

// Fetches all active loans, their payable curency and amount borrowed then sums it up.
async function borrowed(_, block) {
  const loans = await fetchLoans(block);

  // Map of erc20 -> total principal
  const totals = new Map();

  // Iterate over each loan to sum up principal by currency
  for (const loan of loans) {
    const { payableCurrency, principal } = loan;

    let total = totals.get(payableCurrency);
    if (total == null) {
      // initialize to 0
      total = new BN(0);
    }

    total = total.plus(principal);
    totals.set(payableCurrency, total);
  }

  const balances = {};

  // Aggregate into balances object
  const currencies = totals.keys();
  for (const currency of currencies) {
    const total = totals.get(currency);
    sdk.util.sumSingleBalance(balances, currency, total.toFixed(0));
  }

  return balances;
}

module.exports = {
  methodology: `Sums up the floor value of all vaulted and escrowed NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  start: START_BLOCKS[VAULT_FACTORY_A],
  ethereum: { tvl, borrowed },
}
