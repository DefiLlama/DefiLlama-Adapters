const { fetchLocal, mkMeta } = require("../helper/pact");

const kdsExchangeContract = 'kdlaunch.kdswap-exchange';
const kdsExchangeTokenContract = 'kdlaunch.kdswap-exchange-tokens';
const chainId = "1";
const network = `https://api.chainweb-community.org/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

const getReserve = (tokenData) => {
  return parseFloat(tokenData.decimal ? tokenData.decimal : tokenData);
};

// pair keys ("coin:kdlaunch.token") are read from the exchange's own table, the kdswap api is gone
const getPairKeys = async () => {
  const data = await fetchLocal(
    {
      pactCode: `(keys ${kdsExchangeContract}.pairs)`,
      meta: mkMeta("", chainId, GAS_PRICE, 150000, creationTime(), 600),
    },
    network
  );
  if (data.result.status !== "success") throw new Error("Failed to fetch KDSWAP pair list");
  return data.result.data
}

const getPairList = async () => {
  const pairKeys = await getPairKeys()
  const pairList = []

  for (const pairKey of pairKeys) {
    const tokens = pairKey.split(':')
    if (tokens.length !== 2 || !tokens.includes('coin')) continue // only KDA pairs can be valued
    const token = tokens.find((code) => code !== 'coin')
    const data = await fetchLocal(
      {
        pactCode: `
                    (use ${kdsExchangeContract})
                    (let*
                    (
                        (p (get-pair coin ${token}))
                        (reserveA (reserve-for p coin))
                        (reserveB (reserve-for p ${token}))
                        (totalBal (${kdsExchangeTokenContract}.total-supply (${kdsExchangeContract}.get-pair-key coin ${token})))
                    )[totalBal reserveA reserveB])
                    `,
        meta: mkMeta("", chainId, GAS_PRICE, 3000, creationTime(), 600),
      },
      network
    );

    if (data.result.status === "success")
      pairList.push({ reserves: [getReserve(data.result.data[1]), getReserve(data.result.data[2])] })
    else
      pairList.push({ reserves: [0, 0] })
  }
  return pairList
};

const calculateKdaTotal = (pairList) => pairList.reduce((amount, pair) => amount += pair.reserves[0], 0)

async function fetch() {
  const pairList = await getPairList();
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