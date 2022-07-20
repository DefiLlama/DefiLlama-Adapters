const sdk = require("@defillama/sdk");
const retry = require("../../helper/retry");

const { GraphQLClient, gql } = require("graphql-request");
const mEtherABI = require("./abis/MEtherInterfaceFull.json");
const MtrollerABI = require("./abis/MtrollerInterfaceFull.json");

async function fetch(query) {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/ohan8/mmo-finance-active-loans";
  var graphQLClient = new GraphQLClient(endpoint);

  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return results;
}

async function getTotalCash(block) {
  const getTotalSupply = gql`
    {
      vaults {
        id
      }
    }
  `;
  const results = await fetch(getTotalSupply);

  const thisFungibleMTokenABI = mEtherABI.find(
    (i) => i.name === "thisFungibleMToken"
  );
  const mEtherIDCalls = results.vaults.map((vaultObj) => ({
    target: vaultObj.id,
  }));

  const mEtherIDs = await sdk.api.abi.multiCall({
    abi: thisFungibleMTokenABI,
    calls: mEtherIDCalls,
    block: block,
  });

  const totalCashUnderlyingABI = mEtherABI.find(
    (i) => i.name === "totalCashUnderlying"
  );
  const totalCashUnderlyingCalls = results.vaults.map((vaultObj, idx) => ({
    target: vaultObj.id,
    params: mEtherIDs.output[idx].output,
  }));

  const totalCashUnderlying = await sdk.api.abi.multiCall({
    abi: totalCashUnderlyingABI,
    calls: totalCashUnderlyingCalls,
    block: block,
  });
  let totalCashObj
  let totalCashAvailable = 0;
  for (totalCashObj of totalCashUnderlying.output) {
    totalCashAvailable += totalCashObj.output / 10 ** 18;
  }

  return totalCashAvailable;
}

async function getTotalCollateral(block) {
  const getDepositedNFTs = gql`
    {
      depositedNFTsEntities {
        tokenID
        name
        tokenAddress
        mtroller
      }
    }
  `;
  const results = await fetch(getDepositedNFTs);
  let depositedNFTObj
  let totalCollateral = 0;
  for (depositedNFTObj of results.depositedNFTsEntities) {
    if (depositedNFTObj.name === "Glasses") {
      const getPriceABI = MtrollerABI.find((i) => i.name === "price");

      const price = await sdk.api.abi.call({
        abi: getPriceABI,
        target: depositedNFTObj.tokenAddress,
        block: block,
      });
      totalCollateral += price.output / 10 ** 18;
    } else {
      const getOracleABI = MtrollerABI.find((i) => i.name === "oracle");
      const oracle = await sdk.api.abi.call({
        abi: getOracleABI,
        target: depositedNFTObj.mtroller,
        block: block,
      });
      const getUnderlyingPriceABI = MtrollerABI.find(
        (i) => i.name === "getUnderlyingPrice"
      );
      const price = await sdk.api.abi.call({
        abi: getUnderlyingPriceABI,
        target: oracle.output,
        params: [depositedNFTObj.tokenAddress, depositedNFTObj.tokenID],
        block: block,
      });
      totalCollateral += price.output / 10 ** 18;
    }
  }

  return totalCollateral;
}

module.exports = {
  getTotalCash,
  fetch,
  getTotalCollateral,
};
