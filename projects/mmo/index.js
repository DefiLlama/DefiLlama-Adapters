
const { cachedGraphQuery } = require("../helper/cache");
const mEtherABI = {
  thisFungibleMToken: "function thisFungibleMToken() view returns (uint240)",
  totalBorrows: "function totalBorrows(uint240) view returns (uint256)",
  totalCashUnderlying: "function totalCashUnderlying(uint240) view returns (uint256)",
}

async function tvl(api) {
  await getTotalCash(api)
  await getTotalCollateral(api)
}

async function fetch(key, query) {
  var endpoint = 'DUQF7Lhwu1dzz2GwyNi3eRvjZeUnMNCDFjQRA8BYpoRJ'
  return cachedGraphQuery(key, endpoint, query)
}

async function getTotalCash(api) {
  const getTotalBorrows = `{ vaults { id } }`
  const results = await fetch('mmo-vaults-borrow', getTotalBorrows)
  const vaults = results.vaults.map(i => i.id)
  const mEtherIDs = await api.multiCall({ abi: mEtherABI.thisFungibleMToken, calls: vaults })
  const calls = vaults.map((vaultObj, idx) => ({ target: vaultObj, params: mEtherIDs[idx], }));
  const bals = await api.multiCall({ abi: mEtherABI.totalCashUnderlying, calls })
  api.addGasToken(bals)
}

async function getTotalCollateral(api) {
  const getDepositedNFTs = `{
      depositedNFTsEntities {
        collection
        tokenAddress
      }
    }`;
  const results = await fetch('mmo-vaults-deposits', getDepositedNFTs)
  const tokensAndOwners = results.depositedNFTsEntities.map(i => [i.tokenAddress, i.collection])
  return api.sumTokens({ tokensAndOwners })
}

async function borrowed(api) {
  const getTotalBorrows = `{ vaults { id } }`
  const results = await fetch('mmo-vaults-borrow', getTotalBorrows);
  const vaults = results.vaults.map(i => i.id)
  const mEtherIDs = await api.multiCall({ abi: mEtherABI.thisFungibleMToken, calls: vaults })
  const totalBorrowsCall = vaults.map((vaultObj, idx) => ({ target: vaultObj, params: mEtherIDs[idx], }));
  const totalBorrowsResults = await api.multiCall({ abi: mEtherABI.totalBorrows, calls: totalBorrowsCall, })
  api.addGasToken(totalBorrowsResults)
}

module.exports = {
  methodology: `Counts the tokens locked in our vault as collateral and the available cash in the pools. Borrowed ETH is not counted towards the TVL`,
  ethereum: {
    tvl, borrowed,
  },
};
