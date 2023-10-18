const sdk = require("@defillama/sdk");
const { BigNumber } = require('ethers');

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
async function tvl(_, block, _cb, { api }) {
  // Get list of all vaults
  const vaults = await fetchVaults(block+'')
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
async function borrowed(_, block, _cb, { api }) {
  const loans = await fetchLoans(block);
  const balances = {}

  // Iterate over each loan to sum up principal by currency
  for (const loan of loans) {
    const { payableCurrency, principal, interestRate } = loan;
    const fullRepayment = getRepayment(principal, interestRate)

    sdk.util.sumSingleBalance(balances, payableCurrency, fullRepayment, api.chain);
  }

  return balances;
}

const decimals18 = BigNumber.from(10).pow(18);
function getRepayment(principalStr, interestRateStr) {
  const principal = BigNumber.from(principalStr);
  const interestRate = BigNumber.from(interestRateStr);

  const interest = principal
    .mul(interestRate)
    .div(decimals18)
    .div(1000);

  return principal.add(interest);
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
