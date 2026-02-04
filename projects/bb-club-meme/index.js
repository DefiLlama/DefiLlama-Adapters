const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const factory = '0x0dB9ea3c097fC9fD709da54aA1eFcd6FFb3DdE2C';
  const memeCoins = await api.fetchList({  lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: factory })
  return api.sumTokens({owners: memeCoins, tokens: [ADDRESSES.null] })
}

module.exports = {
  bouncebit: {
    tvl
  }
}