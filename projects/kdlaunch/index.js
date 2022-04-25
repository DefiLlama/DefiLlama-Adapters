const axios = require("axios");
const Pact = require("pact-lang-api");
const { toUSDTBalances } = require('../helper/balances');

const network = (chainId) => `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

const getReserve = (tokenData) => {
  return parseFloat(tokenData.decimal ? tokenData.decimal : tokenData);
}

const getTokenToKadena = async (token) => {
  const chainId = '3';
  let data = await Pact.fetch.local({
    pactCode: `
          (use free.exchange)
          (let*
            (
              (p (get-pair ${token} coin))
              (reserveA (reserve-for p ${token}))
              (reserveB (reserve-for p coin))
            )[reserveA reserveB])
           `,
    meta: Pact.lang.mkMeta("account", chainId, GAS_PRICE, 3000, creationTime(), 600),
  }, network(chainId));

  if (data.result.status === "success") {
    const tokenReserve = getReserve(data.result.data[0]);
    const kadenaReserve = getReserve(data.result.data[1]);
    return kadenaReserve / tokenReserve;
  }

  throw new Error(`Kadena fetch failed`);
}

const fetchKdaPrice = async () => {
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=kadena&vs_currencies=usd"
  );

  return res.data.kadena.usd;
}

const fetchKdlPrice = async () => {
  return await getTokenToKadena("kdlaunch.token");
}

const getTotalStakedKdl = async () => {
  const chainId = '1';
  let data = await Pact.fetch.local(
    {
      pactCode: '(kdlaunch.staking.get-staking-stats)',
      keyPairs: Pact.crypto.genKeyPair(),
      meta: Pact.lang.mkMeta('', chainId, 0.01, 1000, 28800, creationTime())
    },
    network(chainId)
  );
  
  if (data.result.status === "success") {
    return getReserve(data.result.data.totalStaked);
  }

  throw new Error("Total KDL stacked failed");
}

function stakingCalcTvl(kdlPriceUsd, stakedKdl) {
  let totalStakedPrice = 0;

  if (stakedKdl > 0 && kdlPriceUsd > 0) {
    totalStakedPrice = stakedKdl * kdlPriceUsd;
  }

  return toUSDTBalances(totalStakedPrice);
}

async function fetchStakingTvl() {
  const kdaPrice = await fetchKdaPrice();
  const kdlPrice = await fetchKdlPrice();
  const kdlPriceUsd = kdlPrice * kdaPrice;
  const stakedKdl = await getTotalStakedKdl();

  return stakingCalcTvl(kdlPriceUsd, stakedKdl);
}

module.exports = {
  misrepresentedTokens: true,
  kadena: {
    tvl: ()=>([]),
    staking: fetchStakingTvl,
  }
}