const { sumTokens } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

const ETH_EasyBTC_USD_Contract = '0xFe32277D00e57D864B8BC687d0a442D663Aa1dF6'

const BNB_EasyBTC_USD_Contract = '0xF3FB36F32Dad91627f688e7332472d69F6C985c6'
const BNB_EasyBTC_BTC_Contract = '0x38D239a8D33BF7424A1Df6d39cb8523cCc25DE0e'

const STAKE_ABI =
  "function totalStaked() view returns (uint256)";

async function ETHTvl(api) {
  const EasyBTC_USD_Staked = await api.call({  abi: STAKE_ABI, target: ETH_EasyBTC_USD_Contract})
  // usdt
  api.add(ADDRESSES.ethereum.USDT, EasyBTC_USD_Staked)
  return sumTokens({
    api
  })
}

async function BNBTvl(api) {
  const EasyBTC_USD_Staked = await api.call({  abi: STAKE_ABI, target: BNB_EasyBTC_USD_Contract})
  const EasyBTC_BTC_Staked = await api.call({  abi: STAKE_ABI, target: BNB_EasyBTC_BTC_Contract})
  // usdt
  api.add(ADDRESSES.bsc.USDT, EasyBTC_USD_Staked)
  // btc
  api.add(ADDRESSES.bsc.BTCB, EasyBTC_BTC_Staked)
  return sumTokens({ api })
}

module.exports = {
  ethereum: {
    tvl: ETHTvl,
  },
  bsc: {
    tvl: BNBTvl,
  }
};
