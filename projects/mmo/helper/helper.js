const sdk = require("@defillama/sdk");

const { GraphQLClient, gql } = require("graphql-request");
const mEtherABI = {
  thisFungibleMToken: "function thisFungibleMToken() view returns (uint240)",
  totalBorrows: "function totalBorrows(uint240) view returns (uint256)",
  totalCashUnderlying: "function totalCashUnderlying(uint240) view returns (uint256)",
};
const MtrollerABI = {
  oracle: "address:oracle",
  price: "uint256:price",
  getUnderlyingPrice: "function getUnderlyingPrice(address underlyingToken, uint256 tokenID) view returns (uint256)",
}

async function fetch(query) {
  var endpoint =
    sdk.graph.modifyEndpoint('DUQF7Lhwu1dzz2GwyNi3eRvjZeUnMNCDFjQRA8BYpoRJ');
  var graphQLClient = new GraphQLClient(endpoint);

  const results = await graphQLClient.request(query)
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

  const thisFungibleMTokenABI = mEtherABI.thisFungibleMToken;
  const mEtherIDCalls = results.vaults.map((vaultObj) => ({
    target: vaultObj.id,
  }));

  const mEtherIDs = await sdk.api.abi.multiCall({
    abi: thisFungibleMTokenABI,
    calls: mEtherIDCalls,
    block: block,
  });

  const totalCashUnderlyingABI = mEtherABI.totalCashUnderlying;
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
      const getPriceABI = MtrollerABI.price

      const price = await sdk.api.abi.call({
        abi: getPriceABI,
        target: depositedNFTObj.tokenAddress,
        block: block,
      });
      totalCollateral += price.output / 10 ** 18;
    } else {
      const getOracleABI = MtrollerABI.oracle
      const oracle = await sdk.api.abi.call({
        abi: getOracleABI,
        target: depositedNFTObj.mtroller,
        block: block,
      });
      const getUnderlyingPriceABI = MtrollerABI.getUnderlyingPrice
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
