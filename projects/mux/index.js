const {toUSDTBalances} = require('../helper/balances');
const BigNumber = require("bignumber.js");

const axios = require('axios');

async function muxTVL(chainID) {
  const assets = (await axios.get('https://app.mux.network/api/liquidityAsset')).data.assets;
  let chainAssetsValue = new BigNumber(0);
  assets.forEach(asset => {
    const liq = asset.liquidityOnChains[chainID]
    if (liq) {
      chainAssetsValue = chainAssetsValue.plus(liq.value);
    }
  });
  return toUSDTBalances(chainAssetsValue);
}

async function arbitrum() {
  return await muxTVL(42161)
}

async function bsc() {
  return await muxTVL(56)
}

async function fantom() {
  return await muxTVL(250)
}

async function avax() {
  return await muxTVL(43114)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: `This is the total value of all tokens in the MUXLP Pool. The liquidity pool consists of a token portfolio used for margin trading and third-party DEX mining.`,
  arbitrum: {
    tvl: arbitrum,
  },
  bsc: {
    tvl: bsc
  },
  fantom: {
    tvl: fantom
  },
  avax: {
    tvl: avax
  }
}
