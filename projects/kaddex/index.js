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
  }
}

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
          meta: mkMeta(
            "",
            chainId,
            GAS_PRICE,
            3000,
            creationTime(),
            600
          ),
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
  let kdaTotal = 0;
  for (let i = 0; i < pairList.length; i++) {
    let pair = pairList[i];
    kdaTotal += pair.reserves[0];
  }
  return kdaTotal;
};

async function fetch() {
  const pairList = await getPairList();
  const kdaTotal = await fetchKdaTotal(pairList);
  const kdaInFluxPair = pairList[0].reserves[0];
  const kdaInHypePair = pairList[1].reserves[0]
  return {
    'kadena': kdaTotal + kdaInFluxPair + kdaInHypePair
    
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  kadena: {
    tvl: fetch,
  },
};