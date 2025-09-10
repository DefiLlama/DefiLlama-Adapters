const abiMoonriver = require('./abi-moonriver.json');
const { sumTokens2 } = require('../helper/unwrapLPs')

const Contracts = {
  moonriver: {
    pools: {
      '1s3p': '0xb578a396e56388CbF398a12Dea9eb6B01b7c777f',
      '1s3pbusd': '0x008db1Cef0958e7f87A107b58F0dede796ce7962',
      '1s3pmim': '0x23A479A83e4FaC12C2096Ab1D79Ea7a788f4489E',
      '1s3pfrax': '0xF223B776C86E1ADa8fD205dBb804D1Fd6C87E05E',
      '1s3pavaxusd': '0x7179F2C31763f395082489588534F4abb3Dd4Be6',
      '1s3pwanusd': '0x02A105939Dc0C47cb6bD04f320dAa77Bd9E3Bb0D',
    },
    ignoredLps: ['0x17da5445f3cd02b3f1cd820e6de55983fe80cf85'],
  }
};


const tvl = async (api) => {
  const ownerTokens = []
  const pools = Object.values(Contracts.moonriver.pools)
  const tokens = await api.multiCall({  abi: abiMoonriver.getTokens, calls: pools})
  pools.forEach((pool, i) => ownerTokens.push([tokens[i], pool]))
  return sumTokens2({ api, ownerTokens, blacklistedTokens: pools})
};

module.exports = {
  moonriver: {
    tvl,
  },
};
