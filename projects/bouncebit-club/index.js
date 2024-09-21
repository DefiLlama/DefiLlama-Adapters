const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
// const { getLogs } = require('../helper/cache/getLogs')

const BBTC = '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC'

// BTCFI
async function BTCFIStaking(api) {
  const totalStake = await api.call({abi: 'uint256:totalStaked', target: '0x0d5d4599eb4f48df6aeaf2f3c814f5a5302931e5'})
  api.add(BBTC, totalStake)
  return api.getBalances()
}

// Quanto
async function QuantoTvl(api) {
  return api.sumTokens({ tokensAndOwners: ['0xA19237FFc49D1b71f00DA1a82cfF79CE7789f74A'].map(i => ['0xF4c20e5004C6FDCDdA920bDD491ba8C98a9c5863', i]) })
  // const logs = await getLogs({
  //   api,
  //   target: '0xd9Fd951618a0a7f20E8594D227E3b89956480835',
  //   topics: ['0xb3d783b93c7040d6f96c922e516ecd96154f643aec5ba8fc3d143a5a4b9b2127'],
  //   eventAbi: 'event QuantoCreated(address token, address,address,address,address,address,address,address pool,address)',
  //   onlyArgs: true,
  //   fromBlock: 3947791,
  // })
  // return api.sumTokens({ tokensAndOwners: logs.map(i => [i.token, i.pool]) })
}

// Meme
async function MemeTvl(api) {
  const factory = '0x0dB9ea3c097fC9fD709da54aA1eFcd6FFb3DdE2C';
  const memeCoins = await api.fetchList({  lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: factory })
  const tokensAndOwners = memeCoins.map(i => ([ADDRESSES.null, i]));
  return sumTokens2({ api, tokensAndOwners })
}

// StableCoin
async function StableCoinTvl(api) {
  return sumTokens2({ api, owner: '0xdE1F1Ff02D565E554E63AEfe80cB6818eAaCD6A8', token: BBTC })
}

module.exports = {
  bouncebit: {
    tvl: async function(api) {
      await QuantoTvl(api)
      await MemeTvl(api)
      await StableCoinTvl(api)
      return api.getBalances()
    },
    staking: BTCFIStaking
  }
}