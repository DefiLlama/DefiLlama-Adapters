
const { GraphQLClient, gql } = require("graphql-request");
const { staking } = require("../helper/staking");
const config = require("./config");

const OTSEA_TOKEN = "0x5dA151B95657e788076D04d56234Bd93e409CB09";
const OTSEA_TREASURY = "0xF2c8e860ca12Cde3F3195423eCf54427A4f30916";

// OTSEA market volume by network
function getMarketVolume(endpoint) {
    return async (api) => {
        let graphQLClient = new GraphQLClient(endpoint);
        let query = gql`
          query Globals {
              globals {
                  totalOrders
                  totalVolume
              }
          }
        `;
        const results = await graphQLClient.request(query)

        const { globals } = results || {
            globals: [{ totalOrders: 0, totalVolume: 0 }],
        }
      
        api.addCGToken('ethereum', parseFloat(globals[0].totalVolume || 0) / 1e18)
    }
}

// TVL of OTSEA
async function otsea_tvl(api) {
    const collateralBalance = await api.call({
        abi: 'erc20:totalSupply',
        target: OTSEA_TOKEN,
        params: [],
    });

    api.add(OTSEA_TOKEN, collateralBalance)
}

// Global export
module.exports = {
  methodology: "We uses otsea's subgraphs to fetch tvl and offers data.",
};

// Network exports
config.chains.forEach(async chainInfo => {
    const { name: chain, graphql: endpoint } = chainInfo

    if (chain == 'ethereum') {
        module.exports[chain] = {
            tvl: getMarketVolume(endpoint),
            staking:  staking(OTSEA_TREASURY, OTSEA_TOKEN),
        }
    } else {
        module.exports[chain] = {
            tvl: getMarketVolume(endpoint),
        }
    }
})