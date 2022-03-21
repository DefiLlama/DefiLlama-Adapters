const axios = require("axios");
const Pact = require("pact-lang-api");
const { toUSDTBalances } = require('../helper/balances');

const chainId = "3";
const network = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;
const GAS_PRICE = 0.00000001;
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

const getReserve = (tokenData) => {
  return parseFloat(tokenData.decimal ? tokenData.decimal : tokenData);
}

const getTokenToKadena = async (token) => {
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
  }, network);

  if (data.result.status === "success") {
    const tokenReserve = getReserve(data.result.data[0]);
    const kadenaReserve = getReserve(data.result.data[1]);
    return kadenaReserve / tokenReserve;
  }

  throw new Error(`Babena fetch failed`);
}

const fetchKdaPrice = async () => {
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=kadena&vs_currencies=usd"
  );

  return res.data.kadena.usd;
}

const fetchBebePrice = async () => {
  return await getTokenToKadena("free.babena");
}

const getTotalLockedKda = async () => {
  let data = await Pact.fetch.local(
    {
      pactCode: '(coin.get-balance "babena-bank")',
      keyPairs: Pact.crypto.genKeyPair(),
      meta: Pact.lang.mkMeta('', chainId, 0.01, 1000, 28800, creationTime())
    },
    network
  );
  if (data.result.status === "success") {
    return getReserve(data.result.data);
  }

  throw new Error("Total locked KDA fetch failed");
}

const getTotalLockedBabe = async () => {
  let data = await Pact.fetch.local(
    {
      pactCode: '(free.babena.get-balance "babena-bank")',
      keyPairs: Pact.crypto.genKeyPair(),
      meta: Pact.lang.mkMeta('', chainId, 0.01, 1000, 28800, creationTime())
    },
    network
  );
  if (data.result.status === "success") {
    return getReserve(data.result.data);
  }

  throw new Error("Total locked BABE failed");
}

function calcTVL(kdaPrice, availableKda, babenaPrice, availableBabe) {
  let totalPriceKda = 0, totalPriceBabe = 0;

  if (availableKda > 0 && kdaPrice > 0) {
    totalPriceKda = availableKda * kdaPrice;
  }

  if (availableBabe > 0 && babenaPrice > 0) {
    totalPriceBabe = availableBabe * babenaPrice;
  }

  return toUSDTBalances(totalPriceKda) ;
}

function stakingcalcTVL(kdaPrice, availableKda, babenaPrice, availableBabe) {
  let totalPriceKda = 0, totalPriceBabe = 0;

  if (availableKda > 0 && kdaPrice > 0) {
    totalPriceKda = availableKda * kdaPrice;
  }

  if (availableBabe > 0 && babenaPrice > 0) {
    totalPriceBabe = availableBabe * babenaPrice;
  }

  return toUSDTBalances(totalPriceBabe) ;
}

async function fetch() {
  const kdaPrice = await fetchKdaPrice();
  const bebePrice = await fetchBebePrice();
  const babenaPrice = bebePrice * kdaPrice;
  const availableKda = await getTotalLockedKda();
  const availableBabe = await getTotalLockedBabe();

  return calcTVL(kdaPrice, availableKda, babenaPrice, availableBabe);
}
async function stakingfetch() {
  const kdaPrice = await fetchKdaPrice();
  const bebePrice = await fetchBebePrice();
  const babenaPrice = bebePrice * kdaPrice;
  const availableKda = await getTotalLockedKda();
  const availableBabe = await getTotalLockedBabe();

  return stakingcalcTVL(kdaPrice, availableKda, babenaPrice, availableBabe);
}

module.exports = {
  misrepresentedTokens: true,
  kadena: {
    tvl: fetch,
    staking: stakingfetch
  }
  
}