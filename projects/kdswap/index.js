const { GraphQLClient, gql } = require('graphql-request')

const { fetchLocal, mkMeta } = require("../helper/pact");

const kdsExchangeContract = 'kdlaunch.kdswap-exchange';
const kdsExchangeTokenContract = 'kdlaunch.kdswap-exchange-tokens';
const chainId = "1";
const network = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

const graphQLUrls = {
  "kadena": "https://api.kdswap.exchange/graphql",
}

const getReserve = (tokenData) => {
  return parseFloat(tokenData.decimal ? tokenData.decimal : tokenData);
};

const getPairTokens = async (url) => {
  const graphQLClient = new GraphQLClient(url)
  const reserveQuery = gql`
    {
        pairs {
          id
          name: id
          token0 {
            name: tokenSymbol
            code
          }
          token1 {
            name: tokenSymbol
            code
          }
        }
      }
    `;
  return graphQLClient.request(reserveQuery)
}

const isBasePair = (token) => token.code === 'coin'

const swapToBasePair = (pair) => {
  if (isBasePair(pair.token1)) {
    return {
     ...pair,
     token0: {
      name: pair.token1.name,
      code: pair.token1.code
     },
     token1: {
      name: pair.token0.name,
      code: pair.token0.code
     }
    }
  }
  return pair
}

const normalizeTokens = (items, key) =>
  items.reduce((result, item) => {
    const selectedKey = item[key].replace('_', ':')
    const { token0, token1 } = item
    return {
      ...result,
      [selectedKey]: {
        name: selectedKey,
        token0,
        token1,
      }
    }
  }, {})


const getPairList = async (url, grouper) => {
  const { pairs } = await getPairTokens(url)
  const pairTokens = normalizeTokens(pairs, grouper);

  try {
    return await Promise.all(
      Object.values(pairTokens).map(async (pairData) => {
        const pair = swapToBasePair(pairData)
        const data = await fetchLocal(
          {
            pactCode: `
                        (use ${kdsExchangeContract})
                        (let*
                        (
                            (p (get-pair ${pair.token0.code} ${pair.token1.code}))
                            (reserveA (reserve-for p ${pair.token0.code}))
                            (reserveB (reserve-for p ${pair.token1.code}))
                            (totalBal (${kdsExchangeTokenContract}.total-supply (${kdsExchangeContract}.get-pair-key ${pair.token0.code} ${pair.token1.code})))
                        )[totalBal reserveA reserveB])
                        `,
            meta: mkMeta("", chainId, GAS_PRICE, 3000, creationTime(), 600),
          },
          network
        );

        if (data.result.status === "success") {
          return {
            reserves: [
              getReserve(data.result.data[1]),
              getReserve(data.result.data[2]),
            ],
          };
        }
        return {
          reserves: [0, 0]
        }
      })
    );
  } catch (err) {
    throw new Error(err);
  }
};

const calculateKdaTotal = (pairList) => pairList.reduce((amount, pair) => amount += pair.reserves[0], 0)

async function fetch() {
  const pairList = await getPairList(graphQLUrls['kadena'], 'id');
  const kdaTotal = calculateKdaTotal(pairList);

  /*
   * value of each pool taken to be twice the value of its KDA
   */
  return {
    kadena: 2 * kdaTotal
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL accounts for the liquidity on all KDSWAP AMM pools, with all values calculated in terms of KDA price.",
  kadena: {
    tvl: fetch,
  },
}