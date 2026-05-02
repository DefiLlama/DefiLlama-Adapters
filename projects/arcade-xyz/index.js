const sdk = require("@defillama/sdk");

const axios = require('axios')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { staking } = require("../helper/staking");
const { sumArtBlocks, isArtBlocks, } = require('../helper/nft');

const { LOAN_CORE, LOAN_CORE_V3, START_BLOCKS, VAULT_FACTORY_A, ARCD_WETH_LP, STAKING_REWARDS, SINGLE_SIDED_STAKING, ARCD, } = require('./constants');

async function tvl(api) {
  // Get list of all vaults
  const { data } = await axios.get("https://api-fg.arcade.xyz/api/v3/ethereum/loans?state=Active")
  const balances = {}
  const artBlockOwners = []

  // Sum up total count of each token
  for (const vault of data.loans) {
    const collateral = vault.collateral ?? [];

    for (const token of collateral) {
      const { collectionAddress, amount } = token;
      if (isArtBlocks(collectionAddress)) {
        artBlockOwners.push(vault.loanCoreAddress)
        continue;
      }
      sdk.util.sumSingleBalance(balances, collectionAddress, amount, api.chain)
    }
  }

  await sumArtBlocks({ balances, api, owners: artBlockOwners })

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
  const { data } = await axios.get("https://api-fg.arcade.xyz/api/v3/ethereum/loans?state=Active")

  // Iterate over each loan to sum up principal by currency
  for (const loan of data.loans) {
    const { payableCurrency, principal, interestRate } = loan;
    api.add(payableCurrency, principal)
    api.add(payableCurrency, principal * interestRate / 1e21)
  }
}

module.exports = {
  methodology: `Sums up the floor value of all vaulted and escrowed NFTs with Chainlink price feeds. Borrowed coins are not counted towards the TVL`,
  start: START_BLOCKS[VAULT_FACTORY_A],
  ethereum: {
    tvl,
    staking: staking([SINGLE_SIDED_STAKING, STAKING_REWARDS,], [ARCD]),
    pool2: staking(STAKING_REWARDS, [ARCD_WETH_LP]),
    borrowed
  },
  hallmarks: [
    ["2022-08-17", 'V2 Protocol Launch'],
    ["2023-09-06", 'V3 Protocol Launch'],
  ],
}
