const { gql, request } = require("graphql-request");

const ADDRESSES = require("../helper/coreAssets.json");

const graphs = {
  bsc: "https://api.studio.thegraph.com/query/63274/burve-bnb/version/latest",
  arbitrum: "https://api.studio.thegraph.com/query/63274/burve-arb/version/latest",
};

const factories = {
  bsc: "0xedc1bf1993b635478c66ddfd1a5a01c81a38551b",
  arbitrum: "0xedc1bf1993b635478c66ddfd1a5a01c81a38551b",
};

const tvl = async (api) => {
  const endpoint = graphs[api.chain];
  const query = gql`
    query tvl {
      counterEntities(where: { type_ends_with: "|Tvl" }) {
        type
        count
      }
    }
  `;
  const res = await request(endpoint, query);
  const tvls = {};
  for (let i in res.counterEntities) {
    const token = res.counterEntities[i];
    const split = token.type.split("|");
    tvls[split[0]] = Number(token.count) * 1e6;
  }
  for (let key in ADDRESSES[api.chain]) {
    const ethereumAddr = ADDRESSES.ethereum[key];
    const value = tvls[ADDRESSES[api.chain][key]];
    if (ethereumAddr && value) {
      tvls[ethereumAddr] = value;
    }
  }
  return tvls;
};
module.exports = {
  start: 1707300000,
  methodology: "BurveProtocol TVL including total values of assets locked in the tokens which is deployed by BurveProtocol",
};
Object.keys(factories).forEach((chain) => {
  module.exports[chain] = {
    tvl: tvl,
  };
});
