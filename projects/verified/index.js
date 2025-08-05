const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');


//Supported chain subgraphs configuration for Verified Network
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


//Fetch pools with at least 1 primarySubscriptions or orders or marginOrders
const getChainSecurities = async (url) => {
  let allPools = [];
  let skip = 0;
  const pageSize = 1000;
  let hasMore = true;

  const QUERY = (skip) => gql`
    query {
      pools: pools(
        first: ${pageSize}
        skip: ${skip}
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

          tokenIn { address }
          amountOffered
          timestamp
        }
        primarySubscriptions {
          subscription
          assetIn { address }
          executionDate
        }
        marginOrders {
          tokenIn { address }
          amountOffered
          timestamp
        }
      }
    }
  `;

  while (hasMore) {
    try {
      const data = await request(url, QUERY(skip));
      const pools = data?.pools || [];
      allPools.push(...pools);
      skip += pageSize;
      hasMore = pools.length === pageSize;
    } catch (err) {
      console.error("GraphQL fetch error:", err);
      break;
    }
  }

  return allPools;
};


// Format TVL using DefiLlama SDK
const getChainTvls = (chain) => {
  const subgraphUrl = chainsConfig[chain].subgraphUrl;

  return async (_, __, ___) => {
    const balances = {};
    const pools = await getChainSecurities(subgraphUrl);

    for (const pool of pools) {
      const currency = pool?.currency?.toLowerCase();

      const currencyToken = pool?.tokens.find(
        (tkn) => tkn?.address?.toLowerCase() === currency
      );
      if (!currencyToken || !currencyToken?.decimals) continue;

      const decimals = Number(currencyToken.decimals);

      const addBalance = (amount, tokenAddress) => {
        const token = `${chain}:${tokenAddress.toLowerCase()}`;
        const scaledAmount = Number(amount) * (10 ** decimals);
        sdk.util.sumSingleBalance(balances, token, scaledAmount);
      };

      // Primary Subscriptions
      pool.primarySubscriptions?.forEach((sub) => {
        if (sub?.assetIn?.address?.toLowerCase() === currency) {
          addBalance(sub.subscription, sub.assetIn.address);
        }
      });

      // Orders 
      pool.orders?.forEach((ord) => {
        if (ord?.tokenIn?.address?.toLowerCase() === currency) {
          addBalance(ord.amountOffered, ord.tokenIn.address);
        }
      });

      // Margin Orders
      pool.marginOrders?.forEach((ord) => {
        if (ord?.tokenIn?.address?.toLowerCase() === currency) {
          addBalance(ord.amountOffered, ord.tokenIn.address);
        }
      });
    }

    return balances;

  };
};

module.exports = {
  methodology:
    "TVL is digital assets paid in to purchase security tokens on the Verified Network",
  timetravel: true,
  misrepresentedTokens: false,
};

Object.keys(chainsConfig).forEach((chain) => {
  module.exports[chain] = {
    tvl: getChainTvls(chain),
  };
});
