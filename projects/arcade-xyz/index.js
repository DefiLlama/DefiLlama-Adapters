const sdk = require("@defillama/sdk");

const { fetchVaults, fetchLoans } = require('./queries');
const { stakingTvl } = require('./staking-queries');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { sumArtBlocks, isArtBlocks, } = require('../helper/nft');

const {
  LOAN_CORE,
  LOAN_CORE_V3,
  START_BLOCKS,
  VAULT_FACTORY_A,
} = require('./constants');

// to run: node test.js projects/arcade-xyz/index.js

// Uses chainlink oracle floor price for all whitelisted NFTS owned by every vault and the Loan Core contract.
// Tokens owned by vaults have been wrapped into an Arcade.xyz vault. Tokens owned by the Loan Core contract
// are currently in escrow.

async function getAvailableBlock(api, decrement , attempts) {
  let currentBlock = await api.getBlock();
  let attempt = 0;

  while (attempt < attempts) {
    try {
      // attempt to fetch data from the subgraph using the current block
      await fetchVaults(currentBlock);
      return currentBlock;
    } catch (error) {
      console.log(`Block ${currentBlock} not indexed yet. Trying an earlier block...`);
      currentBlock -= decrement;  // decrement the block number
      attempt++;
    }
  }
  throw new Error(`Failed to retrieve an indexed block after ${attempts} attempts.`);
}

async function tvl(api) {
  const { timestamp, chain } = api;

  const block = await getAvailableBlock(api, 10, 10);
  const chainBlocks = { [chain]: block };

  // Get list of all vaults
  const vaults = await fetchVaults(block)
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

  const stakingBalances = await stakingTvl(timestamp, block, chainBlocks, { api });
  Object.keys(stakingBalances).forEach(token => {
    sdk.util.sumSingleBalance(balances, token, stakingBalances[token]);
  });

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
  const loans = await fetchLoans(await getAvailableBlock(api, 10, 10));

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
