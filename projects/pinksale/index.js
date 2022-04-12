const utils = require('../helper/utils');

async function getTvl(nativeToken, chainId) {
  const [pinklockTvl, res] = await Promise.all([
    utils.fetchURL(`https://api.pinksale.finance/api/v1/tvl/pinklock?chain_id=${chainId}`),
    utils.fetchURL(`https://api.coingecko.com/api/v3/simple/price?ids=${nativeToken}&vs_currencies=usd`),
  ]);
  const nativeTokenPrice = res.data[nativeToken].usd;
  const nativeTokenLocked = pinklockTvl.data.tvl;
  const stableCoinLocked = pinklockTvl.data.stableCoinTvl;
  console.log({
    nativeToken,
    nativeTokenPrice,
    nativeTokenLocked,
    stableCoinLocked,
  })
  return (nativeTokenPrice * nativeTokenLocked) + stableCoinLocked;
}

async function bsc() {
  return await getTvl('binancecoin', 56);
}

async function ethereum() {
  return await getTvl('ethereum', 1);
}

async function polygon() {
  return await getTvl('matic-network', 137);
}

async function kcc() {
  return await getTvl('kucoin-shares', 321);
}

async function fantom() {
  return await getTvl('fantom', 250);
}

async function avalanche() {
  return await getTvl('avalanche-2', 43114);
}

async function cronos() {
  return await getTvl('crypto-com-chain', 25);
}

async function fetch() {
  const [bscTvl, ethTvl, polygonTvl, kccTvl, ftmTvl, avaxTvl, croTvl] = await Promise.all([
    bsc(),
    ethereum(),
    polygon(),
    kcc(),
    fantom(),
    avalanche(),
    cronos(),
  ]);
  return bscTvl + ethTvl + polygonTvl + kccTvl + ftmTvl + avaxTvl + croTvl;
}

fetch().then((tvl) => console.log(tvl))

module.exports = {
  bsc: {
    fetch: bsc,
  },
  ethereum: {
    fetch: ethereum,
  },
  polygon: {
    fetch: polygon,
  },
  kcc: {
    fetch: kcc,
  },
  avalanche: {
    fetch: avalanche,
  },
  fantom: {
    fetch: fantom,
  },
  cronos: {
    fetch: cronos,
  },
  fetch,
};