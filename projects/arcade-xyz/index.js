const BN = require('bignumber.js');
const sdk = require("@defillama/sdk");

const { getWhitelistedNFTs } = require('../helper/tokenMapping');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { fetchVaults, fetchLoans } = require('./queries');

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

// Fetches all active loans, their payable curency and amount borrowed then sums it up.
async function borrowed() {
  const loans = await fetchLoans();

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
