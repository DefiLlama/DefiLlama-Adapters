
const { GraphQLClient, gql } = require("graphql-request");
const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const config = require("./config");

const OTSEA_TOKEN = "0x5dA151B95657e788076D04d56234Bd93e409CB09";
const OTSEA_MARKET_CONTRACT = "0x6E8B67B315b44519f8C2BEfdbbE11097c45353b4";
const OTSEA_STAKING_CONTRACT = "0xF2c8e860ca12Cde3F3195423eCf54427A4f30916";

// OTSEA market volume by network
function getMarketVolume(endpoint) {
    return async (api) => {
        // locked in sell orders (ETH amount on sell orders)
        let graphQLClient = new GraphQLClient(endpoint);
        let query = gql`
          query openSellOrders {
              orders (where: { type: 1, state: 0 }) {
                  fulfilledOutput
                  totalOutput
              }
          }
        `;
        const results = await graphQLClient.request(query)

        const { orders } = results || {
            orders: [{ totalOutput: 0 }],
        }
        const lockedInSellOrders = orders.reduce((sum, o) => sum += +o.totalOutput - o.fulfilledOutput, 0)

        // Locked in buy orders (ETH balance of market contract)
        const lockedInBuyOrders = await api.sumTokens({ owner: OTSEA_MARKET_CONTRACT, tokens: [ADDRESSES.null] });

        api.addCGToken('ethereum', parseFloat(lockedInSellOrders + lockedInBuyOrders) / 1e18)
    }
}

// Total Volume of OTSEA
async function otsea_total_volume(api) {
    const collateralBalance = await api.call({
        abi: 'erc20:totalSupply',
        target: OTSEA_TOKEN,
        params: [],
    });

    api.add(OTSEA_TOKEN, collateralBalance)
}

// Global export
module.exports = {
  methodology: "We aggregated the assets locked on OTSea market",
  misrepresentedTokens: true,
};

// Network exports
config.chains.forEach(async chainInfo => {
    const { name: chain, graphql: endpoint } = chainInfo

    if (chain == 'ethereum') {
        module.exports[chain] = {
            tvl: getMarketVolume(endpoint),
            staking:  staking(OTSEA_STAKING_CONTRACT, OTSEA_TOKEN),
        }
    } else {
        module.exports[chain] = {
            tvl: getMarketVolume(endpoint),
        }
    }
})