const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");

async function fetch() {
  const query = gql`
    {
      summary {
        totalAvailableVolume
      }
    }
  `;
  const data = await request("https://api.logium.org/graphql", query);
  const usdcTVL = new BigNumber(data.summary.totalAvailableVolume);
  return usdcTVL.div(10 ** 6);
}

module.exports = {
  fetch,
};
