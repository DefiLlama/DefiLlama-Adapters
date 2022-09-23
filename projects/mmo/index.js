const sdk = require("@defillama/sdk");

const { gql } = require("graphql-request");
const mEtherABI = require("./helper/abis/MEtherInterfaceFull.json");
const { getTotalCash, getTotalCollateral, fetch } = require("./helper/helper");

async function tvl(block) {
  const totalCashAvailable = await getTotalCash(block);
  const totalCollateral = await getTotalCollateral(block);
  return {
    ethereum: totalCashAvailable + totalCollateral,
  };
}

async function borrowed(block) {
  const getTotalBorrows = gql`
    {
      vaults {
        id
      }
    }
  `;
  const results = await fetch(getTotalBorrows);
  const thisFungibleMTokenABI = mEtherABI.find(
    (i) => i.name === "thisFungibleMToken"
  );
  const mEtherIDCalls = results.vaults.map((vaultObj) => ({
    target: vaultObj.id,
  }));

  const mEtherIDs = await sdk.api.abi.multiCall({
    abi: thisFungibleMTokenABI,
    calls: mEtherIDCalls,
  });

  const totalBorrowsABI = mEtherABI.find((i) => i.name === "totalBorrows");
  const totalBorrowsCall = results.vaults.map((vaultObj, idx) => ({
    target: vaultObj.id,
    params: mEtherIDs.output[idx].output,
  }));

  const totalBorrowsResults = await sdk.api.abi.multiCall({
    abi: totalBorrowsABI,
    calls: totalBorrowsCall,
    block: block,
  });
  let borrowObj
  let totalBorrows = 0;
  for (borrowObj of totalBorrowsResults.output) {
    totalBorrows += borrowObj.output / 10 ** 18;
  }

  return { ethereum: totalBorrows };
}

module.exports = {
  timetravel: false,
  methodology: `Counts the tokens locked in our vault as collateral and the available cash in the pools. Borrowed ETH is not counted towards the TVL`,
  ethereum: {
    tvl,
    borrowed,
  },
};
