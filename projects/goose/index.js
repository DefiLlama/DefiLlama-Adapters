const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");
const ADDRESSES = require("../helper/coreAssets.json");

const graphUrl = "https://api.studio.thegraph.com/query/93229/goose-bsc-usdt-vault/v0.0.1";
const graphQuery = gql`
  query {
    deposits(first: 1, orderBy: lockId, orderDirection: desc) {
      depositShare
      price
    }
  }
`;

module.exports = {
  bsc: {
    tvl: async (api) => {
      const { deposits } = await request(graphUrl, graphQuery);
      
      if (deposits.length > 0) {
        const latestDeposit = deposits[0];
        
        const depositShare = new BigNumber(latestDeposit.depositShare);
        const price = new BigNumber(latestDeposit.price);
        const tvlInUSD = depositShare.times(price).div(new BigNumber(10).pow(36));

        api.addTokens(ADDRESSES.bsc.USDT, tvlInUSD.toFixed(0));
      }
    }
  }
};