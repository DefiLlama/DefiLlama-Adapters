const axios = require("axios");
const { fetchLocal, mkMeta } = require("../helper/pact");

const chainId = "2";
const network = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

const getReserve = (tokenData) => {
  return parseFloat(tokenData.decimal ? tokenData.decimal : tokenData);
};

const pairTokens = {
  "coin:runonflux.flux": {
    name: "coin:runonflux.flux",
    token0: {
      name: "KDA",
      code: "coin",
    },
    token1: {
      name: "FLUX",
      code: "runonflux.flux",
    },
  },

  "coin:hypercent.prod-hype-coin": {
    name: "coin:hypercent.prod-hype-coin",
    token0: {
      name: "KDA",
      code: "coin",
    },
    token1: {
      name: "HYPE",
      code: "hypercent.prod-hype-coin",
    },
  },
  "coin:mock.token": {
    name: "coin:mok.token",
    token0: {
      name: "KDA",
      code: "coin",
    },
    token1: {
      name: "MOK",
      code: "mok.token",
    },
  },
};

const getPairList = async () => {
  const pairList = await Promise.all(
    Object.values(pairTokens).map(async (pair) => {
      let data = await fetchLocal(
        {
          pactCode: `
            (use kswap.exchange)
            (let*
              (
                (p (get-pair ${pair.token0.code} ${pair.token1.code}))
                (reserveA (reserve-for p ${pair.token0.code}))
                (reserveB (reserve-for p ${pair.token1.code}))
                (totalBal (kswap.tokens.total-supply (kswap.exchange.get-pair-key ${pair.token0.code} ${pair.token1.code})))
              )[totalBal reserveA reserveB])
             `,
          meta: mkMeta("", chainId, GAS_PRICE, 3000, creationTime(), 600),
        },
        network
      );

      return {
        reserves: [
          getReserve(data.result.data[1]),
          getReserve(data.result.data[2]),
        ],
      };
    })
  );
  return pairList;
};

const fetchKdaTotal = async (pairList) => {
  let totalKda = 0;
  for (const pair of pairList) {
    const kdaInPool = pair.reserves[0];
    const tokenInPoolInKdaRate = pair.reserves[0] / pair.reserves[1];
    totalKda +=
      kdaInPool +
      tokenInPoolInKdaRate * pair.reserves[1]; /** equal to do (kda*2) */
  }
  return totalKda;
};

async function fetch() {
  const pairList = await getPairList();
  const kdaTotal = await fetchKdaTotal(pairList);
  return {
    kadena: kdaTotal,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  kadena: {
    tvl: fetch,
  },
};
