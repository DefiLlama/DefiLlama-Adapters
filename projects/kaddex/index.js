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
  "coin:mok.token": {
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
  // "coin:lago.kwUSDC": {
  //   name: "coin:lago.kwUSDC",
  //   token0: {
  //     name: "KDA",
  //     code: "coin",
  //   },
  //   token1: {
  //     name: "USDC",
  //     code: "lago.kwUSDC",
  //   },
  // },
  "coin:kaddex.kdx": {
    name: "coin:kaddex.kdx",
    token0: {
      name: "KDA",
      code: "coin",
    },
    token1: {
      name: "KDX",
      code: "kaddex.kdx",
    },
  },
  "coin:kdlaunch.token": {
    name: "coin:kdlaunch.token",
    token0: {
      name: "KDA",
      code: "coin",
    },
    token1: {
      name: "KDL",
      code: "kdlaunch.token",
    },
  },
  "coin:kdlaunch.kdswap-token": {
    name: "coin:kdlaunch.kdswap-token",
    token0: {
      name: "KDA",
      code: "coin",
    },
    token1: {
      name: "KDS",
      code: "kdlaunch.kdswap-token",
    },
  },
};

const getPairList = async () => {
  const pairList = await Promise.all(
    Object.values(pairTokens).map(async (pair) => {
      let data = await fetchLocal(
        {
          pactCode: `
            (use kaddex.exchange)
            (let*
              (
                (p (get-pair ${pair.token0.code} ${pair.token1.code}))
                (reserveA (reserve-for p ${pair.token0.code}))
                (reserveB (reserve-for p ${pair.token1.code}))
                (totalBal (kaddex.tokens.total-supply (kaddex.exchange.get-pair-key ${pair.token0.code} ${pair.token1.code})))
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
          pair.token0.code,
          pair.token1.code,
        ],
      };
    })
  );
  return pairList;
};

const getStakedKDXValueInKDA = async (pairList) => {
  const stakedData = await fetchLocal(
    {
      pactCode: `(kaddex.staking.get-pool-state)`,
      meta: mkMeta("", chainId, GAS_PRICE, 3000, creationTime(), 600),
    },
    network
  );
  const stakedValue = getReserve(
    (stakedData?.result?.data && stakedData?.result?.data["staked-kdx"]) || 0
  );
  const kdxPool = pairList.find((pair) => pair.reserves[3] === "kaddex.kdx");
  const kdxPrice = kdxPool.reserves[0] / kdxPool.reserves[1] || 0;
  const stakedKDXValue = kdxPrice * stakedValue;
  return stakedKDXValue;
};

const fetchKdaTotal = async (pairList) => {
  let totalKda = 0;
  for (const pair of pairList) {
    const kdaInPool = pair.reserves[0];
    const tokenInPoolInKdaRate = pair.reserves[0] / pair.reserves[1] || 0;
    totalKda +=
      kdaInPool +
      tokenInPoolInKdaRate * pair.reserves[1]; /** equal to do (kda*2) */
  }
  return totalKda;
};

async function tvl() {
  const pairList = await getPairList();
  const kdaTotal = await fetchKdaTotal(pairList);
  return {
    kadena: kdaTotal,
  };
}

async function staking() {
  const pairList = await getPairList();
  const stakedKdxValue = await getStakedKDXValueInKDA(pairList);
  return {
    kadena: stakedKdxValue,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  kadena: {
    tvl: tvl,
    staking: staking
  },
};
