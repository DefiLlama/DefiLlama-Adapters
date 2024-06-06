const ADDRESSES = require('../helper/coreAssets.json')
const { compoundExports } = require('../helper/compound')
const { nullAddress } = require('../helper/tokenMapping')
const { lendingMarket } = require("../helper/methodologies");


const u = undefined
const { tvl, borrowed } = compoundExports('0x2c7b7A776b5c3517B77D05B9313f4699Fb38a8d3',u,'0x36e66547e27a5953f6ca3d46cc2663d9d6bdc59e', nullAddress, undefined, undefined, { fetchBalances: true, blacklistedTokens: ['0x53011e93f21ec7a74cdfbb7e6548f1abce306833'] })

const mapping = {
  [ADDRESSES.ethereum.USDC]: 6,
  [ADDRESSES.ethereum.USDT]: 6,
  [ADDRESSES.ethereum.WBTC]: 8,
}
async function borrowedWrapped(api) {
  const borrowedRes = await borrowed(api)
  Object.entries(mapping).forEach(([t, decimals]) => {
    const regex = new RegExp(t, 'gi')
    Object.keys(borrowedRes).forEach(key => {
      if (regex.test(key)) {
        borrowedRes[key] /= 10 ** (18 - decimals) 
      }
    })
  })
  return borrowedRes
}

module.exports = {
  methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
  ethereum: {
    tvl,
    borrowed: borrowedWrapped,
  }
}