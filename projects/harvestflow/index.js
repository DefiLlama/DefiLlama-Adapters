const { get } = require('../helper/http');
const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require("../helper/coreAssets.json");
const BigNumber = require('bignumber.js');

const toToken = value => BigNumber(value).times(1e6).toFixed(0);

const lendingNFTAddress = {
  'plume_mainnet': [
    '0xFa262942987D408f7fF12F7f3f0DcF09f07cb0e2',
    '0x12E4222d6C899Bb9b05C33293d77F9Be1AF24276'
  ],
  'polygon': '0x9d6d53b5bc498200503bc7abcbdec2b8a009460a'
}

async function withdraw(network) {
  const url = `https://harvestflow-api-production.up.railway.app/token-events/total/${network}`;
  const data = await get(url);
  return data.totalAmount
}

async function plumeTvl(_, _1, _2, { api }) {
  const network = 'plume_mainnet';
  const token = ADDRESSES.plume_mainnet.pUSD;
  const withdrawAmount = await withdraw(network);
  const sumTokensResult = await sumTokens2({
    api,
    owners: [lendingNFTAddress[network]].flat(),
    tokens: [token],
  });
  const contractBalance = sumTokensResult[`${network}:${token.toLowerCase()}`] || 0;
  const result = Math.round(withdrawAmount + contractBalance);
  const valueInSmallestUnit = toToken(result);
  api.add(token, valueInSmallestUnit);
  return api.getBalances();
}

async function polygonTvl(_, _1, _2, { api }) {
  const network = 'polygon';
  const token = ADDRESSES.polygon.USDT;
  const result = await withdraw(network); // Already withdrawed
  const valueInSmallestUnit = toToken(result);
  api.add(token, valueInSmallestUnit);  
  return api.getBalances();
}

const CONFIG = {
  plume_mainnet: { 
    tvl: plumeTvl
  },
  polygon: {
    tvl: polygonTvl
  },
};

module.exports={
  ...CONFIG,
} 