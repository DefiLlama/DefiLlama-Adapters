const utils = require('../helper/utils');

async function getTvl(nativeToken, chainId) {
  const [pinklockTvl, res] = await Promise.all([
    utils.fetchURL(`https://api.pinksale.finance/api/v1/tvl/pinklock?chain_id=${chainId}`),
    utils.fetchURL(`https://api.coingecko.com/api/v3/simple/price?ids=${nativeToken}&vs_currencies=usd`),
  ]);
  const nativeTokenPrice = res.data[nativeToken].usd;
  const nativeTokenLocked = pinklockTvl.data.tvl;
  const stableCoinLocked = pinklockTvl.data.stableCoinTvl;
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
  const [bscTvl, ethTvl, polygonTvl, ftmTvl, avaxTvl, croTvl] = await Promise.all([
    bsc(),
    ethereum(),
    polygon(),
    fantom(),
    avalanche(),
    cronos(),
  ]);
  return bscTvl + ethTvl + polygonTvl + ftmTvl + avaxTvl + croTvl;
}

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