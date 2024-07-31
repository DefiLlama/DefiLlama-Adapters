const { request, gql } = require("graphql-request");

//supported chains configuration for Verified.
//TODO: add more chains
const chainsConfig = {
  base: {
    subgraphUrl:
      "https://api.studio.thegraph.com/query/77016/vault-base/version/latest",
  },
};

//gets and record tvl for each token
const getTokensTvl = async (tokens, tvls) => {
  let table = {};
  tokens.forEach((token, idx) => {
    if (!table[token]) {
      table[token] = tvls[idx];
    } else {
      table[token] = table[token] + tvls[idx];
    }
  });
  return table;
};

//customise table indicating the address and tvl of each token with the total of all tvl
const customiseTable = async (tokens, tvls) => {
  let table = [];
  tokens.forEach((token, idx) => {
    table.push({ Token: token, Tvl: tvls[idx] });
  });
  table.push({
    Total: tvls.reduce((a, b) => {
      return a + b;
    }, 0),
  });
  return table;
};

//fetch secondary, primary and margin issue pools
const getChainPools = async (url) => {
  const QUERY = gql`
    query {
      pools: pools(
        first: 100
        where: {
          poolType_in: ["MarginIssue", "SecondaryIssue", "PrimaryIssue"]
        }
      ) {
        id
        address
        poolType
        security
        currency
        tokens {
          id
          address
          symbol
          name
          decimals
          priceRate
          balance
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
  let secondaryTvls = [];
  let secondarySecurities = [];
  let primaryTvls = [];
  let primarySecurities = [];
  let marginTvls = [];
  let marginSecurities = [];
  return async (_, _1, _2, { api }) => {
    const pools = await getChainPools(subgraphUrl);
    pools.map((pool) => {
      const currencyDetails = pool.tokens.find(
        (tk) => tk.address.toLowerCase() === pool.currency.toLowerCase()
      ); //get currency details since TVL will be in currency worth.
      pool.tokens.map((tkn) => {
        if (
          tkn.address.toLowerCase() === pool.security.toLowerCase() &&
          Number(tkn.balance) > 0
        ) {
          const currencyRate = Number(currencyDetails.priceRate);
          allCurrencies.push(pool.currency);
          allTvls.push(
            Number(tkn.balance) *
              currencyRate *
              10 ** Number(currencyDetails.decimals)
          ); //upscaled balance in currency decimals
          if (pool.poolType.toLowerCase() === "SecondaryIssue".toLowerCase()) {
            secondarySecurities.push(tkn.symbol); //track secondary securities locked in pool
            secondaryTvls.push(Number(tkn.balance)); //track secondary securities balance locked in pool
          }
          if (pool.poolType.toLowerCase() === "PrimaryIssue".toLowerCase()) {
            primarySecurities.push(tkn.symbol); //track primary securities locked in pool
            primaryTvls.push(Number(tkn.balance)); //track primary securities balance locked in pool
          }
          if (pool.poolType.toLowerCase() === "MarginIssue".toLowerCase()) {
            marginSecurities.push(tkn.symbol); //track margin securities locked in pool
            marginTvls.push(Number(tkn.balance)); //track margin securities balance locked in pool
          }
        }
      });
    });
    if (secondarySecurities.length > 0) {
      const Tvls = await getTokensTvl(secondarySecurities, secondaryTvls);
      const tabl = await customiseTable(Object.keys(Tvls), Object.values(Tvls));
      console.log(
        "---------",
        chain,
        "TVL Details For Secondary Pools ---------"
      );
      console.table(tabl);
    }
    if (primarySecurities.length > 0) {
      const Tvls = await getTokensTvl(primarySecurities, primaryTvls);
      const tabl = await customiseTable(Object.keys(Tvls), Object.values(Tvls));
      console.log(
        "---------",
        chain,
        "TVL Details For Primary Pools ---------"
      );
      console.table(tabl);
    }
    if (marginSecurities.length > 0) {
      const Tvls = await getTokensTvl(marginSecurities, marginTvls);
      const tabl = await customiseTable(Object.keys(Tvls), Object.values(Tvls));
      console.log("---------", chain, "TVL Details For Margin Pools ---------");
      console.table(tabl);
    }
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
