const { fetchLocal, mkMeta } = require("../helper/pact");

const chainId = "2";
const network = `https://api.chainweb-community.org/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;
const KDA = "coin";
const KDX = "kaddex.kdx";

const getReserve = (tokenData) => {
  return parseFloat(tokenData.decimal ? tokenData.decimal : tokenData);
};

// Every pool is read from the exchange's own table in one call, so new pools are picked up.
// A pair key is "tokenA:tokenB" and leg0/leg1 hold the reserves in that same order.
const getPairList = async () => {
  const data = await fetchLocal(
    {
      pactCode: `
        (map
          (lambda (k)
            (let ((p (kaddex.exchange.get-pair-by-key k)))
              [k (at 'reserve (at 'leg0 p)) (at 'reserve (at 'leg1 p))]))
          (kaddex.exchange.get-pairs))
         `,
      meta: mkMeta("", chainId, GAS_PRICE, 150000, creationTime(), 600),
    },
    network
  );
  if (data?.result?.status !== "success" || !Array.isArray(data.result.data) || !data.result.data.length)
    throw new Error("Failed to fetch Kaddex pairs");

  const pairList = [];
  for (const [pairKey, reserve0, reserve1] of data.result.data) {
    const tokens = pairKey.split(":");
    if (tokens.length !== 2 || !tokens.includes(KDA)) continue; // only KDA pairs can be valued
    const kdaIsFirst = tokens[0] === KDA;
    pairList.push({
      token: kdaIsFirst ? tokens[1] : tokens[0],
      kdaReserve: getReserve(kdaIsFirst ? reserve0 : reserve1),
      tokenReserve: getReserve(kdaIsFirst ? reserve1 : reserve0),
    });
  }
  return pairList;
};

async function tvl() {
  const pairList = await getPairList();
  const kdaInPools = pairList.reduce((total, pair) => total + pair.kdaReserve, 0);
  // value of each pool taken to be twice the value of its KDA
  return {
    kadena: 2 * kdaInPools,
  };
}

async function staking() {
  const stakedData = await fetchLocal(
    {
      pactCode: `(kaddex.staking.get-pool-state)`,
      meta: mkMeta("", chainId, GAS_PRICE, 3000, creationTime(), 600),
    },
    network
  );
  const stakedKdx = getReserve(
    (stakedData?.result?.data && stakedData?.result?.data["staked-kdx"]) || 0
  );
  const kdxPool = (await getPairList()).find((pair) => pair.token === KDX);
  const kdxPrice = kdxPool.kdaReserve / kdxPool.tokenReserve || 0;
  return {
    kadena: kdxPrice * stakedKdx,
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL accounts for the liquidity on all Kaddex (Mercatus) AMM pools paired with KDA, each valued at twice its KDA side. Staking is the KDX staked in the Kaddex staking pool, priced from the KDA/KDX pool.",
  kadena: {
    tvl: tvl,
    staking: staking
  },
};
