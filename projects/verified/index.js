const { request, gql } = require("graphql-request");

//supported chains configuration for Verified.
//TODO: add more chains
const chainsConfig = {
  base: {
    subgraphUrl:
      "https://api.studio.thegraph.com/query/77016/wallet-base/version/0.2.0",
  },
  ethereum: {
    subgraphUrl:
      "https://api.studio.thegraph.com/query/77016/wallet-mainnet/version/latest",
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

//customise table indicating the address and tvl of each token
const customiseTable = async (tokens, tvls) => {
  let table = [];
  tokens.forEach((token, idx) => {
    table.push({ Token: token, Tvl: tvls[idx] });
  });
  return table;
};

//Todo: first 1000 securities?
//fetch securities with at least 1 primarySubscribers_ or secondaryInvestors_ or marginTraders_
const getChainSecurities = async (url) => {
  const QUERY = gql`
    query {
      securities: securities(
        first: 1000
        where: {
          or: [
            { primarySubscribers_: { timestamp_gt: 0 } }
            { secondaryInvestors_: { timestamp_gt: 0 } }
            { marginTraders_: { timestamp_gt: 0 } }
          ]
        }
      ) {
        security
        currency
        isin
        id
        primarySubscribers {
          id
          pool
          currency
          security {
            id
          }
          cashSwapped
          investor {
            id
          }
          securitySwapped
          timestamp
          bought
        }
        secondaryInvestors {
          id
          currency
          security {
            id
          }
          amount
          investor {
            id
          }
          issuer {
            id
          }
          price
          timestamp
          tradeRef
          DPID
        }
        marginTraders {
          id
          security {
            id
            security
          }
          securityTraded
          currency
          cashTraded
          orderRef
          timestamp
        }
      }
    }
  `;
  return await request(url, QUERY)
    .then((res) => {
      return res.securities;
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
    const securities = await getChainSecurities(subgraphUrl);

    const securitiesPromise = securities.map(async (security) => {
      //get TVL of currency for primary orders
      if (security?.primarySubscribers?.length > 0) {
        const primaryTvls = security?.primarySubscribers
          .map((sub) => (sub.bought ? Number(sub.cashSwapped) : 0))
          .flat(); //get all currency amount in
        const primaryCurrencies = security?.primarySubscribers
          .map((i) => i.currency)
          .flat();
        primaryTvls.forEach((tvl) => {
          allTvls.push(tvl);
        });
        primaryCurrencies.forEach((curr) => {
          allCurrencies.push(curr);
        });
        const names = await api.multiCall({
          abi: "string:name",
          calls: primaryCurrencies,
        }); //use each currency per subcription instead of single currency??
        const currencyTvls = await getTokensTvl(names, primaryTvls);
        const tabl = await customiseTable(
          Object.keys(currencyTvls),
          Object.values(currencyTvls)
        );
        console.log(
          "---------",
          chain,
          "TVL Details For Primary Pool ---------"
        );
        console.table(tabl);
      }

      //get TVL of currency for secondary orders
      if (security?.secondaryInvestors?.length > 0) {
        const secondaryCurrencies = security?.secondaryInvestors
          .map((i) => i.currency)
          .flat();
        const currenciesDecimals = await api.multiCall({
          abi: "uint:decimals",
          calls: secondaryCurrencies,
        }); //use each currency per investor instead of single currency??
        const secondaryTvls = security?.secondaryInvestors
          .map((i, idx) => {
            const rawAmount = Number(i.amount) / 10 ** 18;
            const rawPrice = Number(i.price) / 10 ** 18;
            const currencyAmt = rawAmount * rawPrice;
            return currencyAmt * 10 ** currenciesDecimals[idx];
          })
          .flat();
        secondaryTvls.forEach((tvl) => {
          allTvls.push(tvl);
        });
        secondaryCurrencies.forEach((curr) => {
          allCurrencies.push(curr);
        });
        const names = await api.multiCall({
          abi: "string:name",
          calls: secondaryCurrencies,
        });
        const currencyTvls = await getTokensTvl(names, secondaryTvls);
        const tabl = await customiseTable(
          Object.keys(currencyTvls),
          Object.values(currencyTvls)
        );
        console.log(
          "---------",
          chain,
          "TVL Details For Secondary Pool ---------"
        );
        console.table(tabl);
      }

      //get TVL of currency for margin orders
      if (security?.marginTraders?.length > 0) {
        const marginTvls = security?.marginTraders
          .map((i) => {
            return Number(i.cashTraded);
          })
          .flat();
        const marginCurrencies = security?.marginTraders
          .map((i) => i.currency)
          .flat();
        marginTvls.forEach((tvl) => {
          allTvls.push(tvl);
        });
        marginCurrencies.forEach((curr) => {
          allCurrencies.push(curr);
        });
        const names = await api.multiCall({
          abi: "string:name",
          calls: marginCurrencies,
        }); //use each currency per margin traders instead of single currency??
        const currencyTvls = await getTokensTvl(names, marginTvls);
        const tabl = await customiseTable(
          Object.keys(currencyTvls),
          Object.values(currencyTvls)
        );
        console.log(
          "---------",
          chain,
          "TVL Details For Margin Pool ---------"
        );
        console.logTable(tabl);
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
