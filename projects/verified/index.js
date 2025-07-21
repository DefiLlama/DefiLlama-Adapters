const { request, gql } = require("graphql-request");

//supported chains configuration for Verified.
//TODO: add more chains
const chainsConfig = {
  base: {
    subgraphUrl:
      "https://api.studio.thegraph.com/query/77016/vault-base/version/latest",
  },
  ethereum: {
    subgraphUrl:
      "https://api.studio.thegraph.com/query/77016/vault-mainnet/version/latest",
  },
};

//Todo: first 1000 pools?
//fetch pools with at least 1 primarySubscriptions or orders or marginOrders
const getChainSecurities = async (url) => {
  const QUERY = gql`
    query {
      pools: pools(
        first: 1000
        where: {
          or: [
            { primarySubscriptions_: { executionDate_gt: 0 } }
            { orders_: { timestamp_gt: 0 } }
            { marginOrders_: { timestamp_gt: 0 } }
          ]
        }
      ) {
        security
        currency
        tokens {
          symbol
          name
          decimals
          index
          address
        }
        orders {
          id
          pool {
            id
            address
            security
            currency
            tokens {
              symbol
              name
              decimals
              index
              address
            }
            tokensList
          }
          tokenIn {
            address
          }
          tokenOut {
            address
          }
          amountOffered
          priceOffered
          orderReference
          creator
          timestamp
        }
        primarySubscriptions {
          subscription
          price
          executionDate
          assetIn {
            address
          }
          assetOut {
            address
          }
          investor {
            id
          }
          executionDate
        }
        marginOrders {
          id
          pool {
            id
            address
            security
            currency
            margin
            tokensList
            tokens {
              symbol
              name
              decimals
              index
              address
            }
          }
          creator
          tokenIn {
            id
            symbol
            name
            decimals
            address
          }
          tokenOut {
            id
            symbol
            name
            decimals
            address
          }
          amountOffered
          priceOffered
          stoplossPrice
          timestamp
          orderReference
        }
      }
    }
  `;
  return await request(url, QUERY)
    .then((res) => {
      return res.pools;
    })
    .catch((err) => {
      return [];
    });
};

const getChainTvls = (chain) => {
  const subgraphUrl = chainsConfig[chain].subgraphUrl;
  let allCurrencies = [];
  let allTvls = [];
  return async (_, _1, _2, { api }) => {
    const pools = await getChainSecurities(subgraphUrl);

    const securitiesPromise = pools.map(async (pool) => {
      const currencyDetails = pool?.tokens.find(
        (tkn) => tkn?.address?.toLowerCase() === pool?.currency?.toLowerCase()
      );

      //get TVL of currency for primary orders
      if (pool?.primarySubscriptions?.length > 0) {
        pool?.primarySubscriptions.map((sub) => {
          if (
            sub?.assetIn?.address?.toLowerCase() ===
            pool?.currency?.toLowerCase()
          ) {
            allTvls.push(
              Number(sub.subscription) * 10 ** Number(currencyDetails.decimals)
            );
            allCurrencies.push(sub.assetIn.address);
          }
        });
      }

      //get TVL of currency for secondary orders
      if (pool?.orders?.length > 0) {
        pool?.orders.map((ord) => {
          if (
            ord?.tokenIn?.address?.toLowerCase() ===
            pool?.currency?.toLowerCase()
          ) {
            allTvls.push(
              Number(ord.amountOffered) * 10 ** Number(currencyDetails.decimals)
            );
            allCurrencies.push(ord.tokenIn.address);
          }
        });
      }

      //get TVL of currency for margin orders
      if (pool?.marginOrders?.length > 0) {
        pool?.marginOrders.map((ord) => {
          if (
            ord?.tokenIn?.address?.toLowerCase() ===
            pool?.currency?.toLowerCase()
          ) {
            allTvls.push(
              Number(ord.amountOffered) * 10 ** Number(currencyDetails.decimals)
            );
            allCurrencies.push(ord.tokenIn.address);
          }
        });
      }
    });

    await Promise.all(securitiesPromise);

    if (allCurrencies.length > 0) {
      return api.addTokens(allCurrencies, allTvls);
    } else {
      return () => ({});
    }
  };
};

module.exports = {
  methodology:
    "TVL is digital assests paid in to purchase security tokens on the Verified Network",
  timetravel: true,
  misrepresentedTokens: false,
};

Object.keys(chainsConfig).forEach((chain) => {
  module.exports[chain] = {
    tvl: getChainTvls(chain),
  };
});
