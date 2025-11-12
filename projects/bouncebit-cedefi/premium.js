const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens, sumTokensExport } = require('../helper/sumTokens');

const BBTC = '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC'
const BBUSD = ADDRESSES.bouncebit.BBUSD
// const stBBTC = '0x7F150c293c97172C75983BD8ac084c187107eA19'

const stBBTC_STAKE_ABI =
  "function totalStaked() view returns (uint256)";

async function bouncebitTvl(api, ...args) {
  const stBBTCStaked = await api.call({  abi: stBBTC_STAKE_ABI, target: '0x7F26aB9263E33de947654F44C5AB439090cfAaf7'})  
  // stBBTC
  api.add(BBTC, stBBTCStaked)
  return sumTokens({
    owners: ["0xd4def93a10ada7e14cAdc6920b6CDE01148D1813", "0x426CD147ff93f31BB18F1Acd19DAb9c32d934131"],
    tokens: [BBTC, BBUSD],
    api,
    ...args
  })
}

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owners: ["0x1ddD6E5eA766511CC0f348DC8d17578a821B680F", "0xa2B283e4dbdFEA5461C36a59E3B94b3ef2883085"],
      tokens: [BBTC] // removed BBUSD because its tracked on bouncebit ethena listing
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x55a55e8b08b091bD0529bf1af05b69fF5291867D", "0xdAfd8591402c5E57DCa4B1b9e481c08548a2442E"],
      tokens: [BBTC, BBUSD]
    }),
  },
  bouncebit: {
    tvl: bouncebitTvl
  },
};
