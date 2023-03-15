const { BN } = require("bn.js");
const { request, gql } = require("graphql-request");
const { sumTokensExport } = require("../helper/unknownTokens");

const masterchefAddress = "0x7Bd2f7641b875872c7c04ee3B426F753C7093aD5";
const alyxToken = "0x2701C7cBf3220FFF6e6CEaabbCD9B932Eb11E3Ff";
const alyx_bsc_lp = "0xf5Ea0B5AafC6eDACA15909a02C1e16bCaCd74C1e"
const treasury = "0x576182b7a1b0bC67701ead28a087228c50Aa0982";

const marketplace = "https://api.thegraph.com/subgraphs/name/alyxfinance/alyx-marketplace";
const nftLending = "https://api.thegraph.com/subgraphs/name/alyxfinance/alyx-nft-lending";
const bonds = "https://api.thegraph.com/subgraphs/name/alyxfinance/alyx-bonds"
const coinflip = "https://api.thegraph.com/subgraphs/name/alyxfinance/alyx-coinflip";
const roll = "https://api.thegraph.com/subgraphs/name/alyxfinance/alyx-rollgame";

const marketplaceQuery = gql`
  query volumeStat {
    volumeStat(id: "total") {
      bid
      listing
      period
      sold
    }
  }
`;

const nftLendingQuery = gql`
  query volumeStat {
    volumeStat(id: "total") {
      closeLoan
      createLoan
      id
      liquidateLoan
      period
      reduceLoan
      repayLoan
    }
  }
`;

const bondsQuery = gql`
  query volumeStat {
    volumeStat(id: "total") {
      redemption
      period
      id
      creation
    }
  }
`;

const coinflipQuery = gql`
query volumeStat {
  query coinFlipAllTimeDataAggregateds {
    betAmount
    token
    id
  }
}
`;

async function getMarketplaceData() {
  try {
    const { volumeStat: data } = await request(marketplace, marketplaceQuery);
    data.total = (new BN(data.listing).add(new BN(data.bid)).add(new BN(data.sold))).toString(10)
    console.log("marketplace", data)
    return data
  } catch (err) {
    console.error(err.response)
  }
}


async function getNFTLendingData() {
  try {
    const { volumeStat: data } = await request(nftLending, nftLendingQuery);
    data.total = (new BN(data.closeLoan).add(new BN(data.createLoan)).add(new BN(data.liquidateLoan))).add(new BN(data.reduceLoan)).add(new BN(data.repayLoan)).toString(10)
    console.log("NFTlending", data)
    return data
  } catch (err) {
    console.error(err.response)
  }
}

async function getBondsData() {
  try {
    const { volumeStat: data } = await request(bonds, bondsQuery);
    data.total = (new BN(data.redemption).add(new BN(data.creation)).toString(10));
    console.log("bonds", data)
    return data
  } catch (err) {
    console.error(err.response)
  }
}

// Will be used in future
async function totalVolume(timestamp, block) {
  try {
    const marketplaceVolume = await getMarketplaceData();
    const nftlendingVolume = await getNFTLendingData();
    const bondsVolume = await getBondsData();
    return marketplaceVolume.total.add(nftlendingVolume.total.add(bondsVolume.total))
  } catch (err) {
    console.error(err.response)
  }
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: sumTokensExport({ tokens: [alyx_bsc_lp], owner: treasury, useDefaultCoreAssets: true }),
    pool2: sumTokensExport({ tokens: [alyx_bsc_lp], owner: masterchefAddress, useDefaultCoreAssets: true }),
    staking: sumTokensExport({ tokens: [alyxToken], owner: masterchefAddress, useDefaultCoreAssets: true, lps: [alyx_bsc_lp] }),
  },
  methodology: `Total amount of tokens in treasury and masterchef contract`,
};