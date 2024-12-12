const axios = require("axios");
const { fetchLocal, mkMeta } = require("../helper/pact");

const chainId = "3";
const network = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

const getReserve = (tokenData) => {
  return parseFloat(tokenData.decimal ? tokenData.decimal : tokenData);
}

const getTokenToKadena = async (token) => {
  let data = await fetchLocal({
    pactCode: `
          (use free.exchange)
          (let*
            (
              (p (get-pair ${token} coin))
              (reserveA (reserve-for p ${token}))
              (reserveB (reserve-for p coin))
            )[reserveA reserveB])
           `,
    meta: mkMeta("account", chainId, GAS_PRICE, 3000, creationTime(), 600),
  }, network);

  if (data.result.status === "success") {
    const tokenReserve = getReserve(data.result.data[0]);
    const kadenaReserve = getReserve(data.result.data[1]);
    return kadenaReserve / tokenReserve;
  }

  throw new Error(`Babena fetch failed`);
}

const fetchBebePrice = async () => {
  return await getTokenToKadena("free.babena");
}

const getTotalLockedKda = async () => {
  let data = await fetchLocal(
    {
      pactCode: '(coin.get-balance "babena-bank")',
      meta: mkMeta('', chainId, 0.01, 1000, 28800, creationTime())
    },
    network
  );
  if (data.result.status === "success") {
    return getReserve(data.result.data);
  }

  throw new Error("Total locked KDA fetch failed");
}

const getTotalLockedBabe = async () => {
  let data = await fetchLocal(
    {
      pactCode: '(free.babena.get-balance "babena-bank")',
      meta: mkMeta('', chainId, 0.01, 1000, 28800, creationTime())
    },
    network
  );
  if (data.result.status === "success") {
    return getReserve(data.result.data);
  }

  throw new Error("Total locked BABE failed");
}

function calcTVL(availableKda) {
  let totalPriceKda = 0;

  if (availableKda > 0) {
    totalPriceKda = availableKda;
  }

  return { kadena: totalPriceKda };
}

function stakingcalcTVL(babenaPrice, availableBabe) {
  let totalPriceBabe = 0;


  if (availableBabe > 0 && babenaPrice > 0) {
    totalPriceBabe = availableBabe * babenaPrice;
  }

  return { kadena: totalPriceBabe }
}

async function fetch() {
  const availableKda = await getTotalLockedKda();

  return calcTVL(availableKda);
}
async function stakingfetch() {
  const bebePrice = await fetchBebePrice();
  const babenaPrice = bebePrice;
  const availableBabe = await getTotalLockedBabe();

  return stakingcalcTVL(babenaPrice, availableBabe);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  // deadFrom: '2024-08-30',
  kadena: {
    tvl: () => ({}),
    staking: () => ({})
  }

}