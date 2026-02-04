const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')
const { getUniqueAddresses } = require('../helper/utils')

const ddexMarginContractAddress = '0x241e82c79452f51fbfc89fac6d912e021db1a3b7'
const SAI = ADDRESSES.ethereum.SAI

async function tvl(api) {
  const infos = await api.fetchList({  lengthAbi: abis.getAllMarketsCount, itemAbi: abis.getMarket, target: ddexMarginContractAddress})
  const tokens = []
  infos.forEach(({ baseAsset, quoteAsset }) => {
    tokens.push(baseAsset, quoteAsset)
  })
  tokens.forEach((t, i) => {
    if (t === '0x000000000000000000000000000000000000000E')
      tokens[i] = nullAddress
  })
  return sumTokens2({ owner: ddexMarginContractAddress, tokens: getUniqueAddresses(tokens), blacklistedTokens: [SAI], api })
}

module.exports = {
  start: '2019-08-22', // 2019-08-22T18:41:45+08:00
  ethereum: { tvl }
}

const abis = {
  getMarket: "function getMarket(uint16 marketID) view returns (tuple(address baseAsset, address quoteAsset, uint256 liquidateRate, uint256 withdrawRate, uint256 auctionRatioStart, uint256 auctionRatioPerBlock, bool borrowEnable) market)",
  getAllMarketsCount: "uint256:getAllMarketsCount",
}