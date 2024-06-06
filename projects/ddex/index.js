const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')
const { createIncrementArray, getUniqueAddresses } = require('../helper/utils')

const ddexMarginContractAddress = '0x241e82c79452f51fbfc89fac6d912e021db1a3b7'
const SAI = ADDRESSES.ethereum.SAI

async function tvl(timestamp, block) {
  const tokens = []
  const { output: marketCount } = await sdk.api.abi.call({
    target: ddexMarginContractAddress,
    abi: abis.getAllMarketsCount, block,
  })
  const { output: res } = await sdk.api.abi.multiCall({
    target: ddexMarginContractAddress,
    abi: abis.getMarket,
    calls: createIncrementArray(marketCount).map(i => ({ params: i })),block,
  })
  res.forEach(({ output: [base, quote] }) => tokens.push(base, quote))
  tokens.forEach((t, i) => {
    if (t === '0x000000000000000000000000000000000000000E')
      tokens[i] = nullAddress
  })
  return sumTokens2({ owner: ddexMarginContractAddress, tokens: getUniqueAddresses(tokens), block, blacklistedTokens: [SAI] })
}

module.exports = {
  start: 1566470505, // 2019-08-22T18:41:45+08:00
  ethereum: { tvl }
}

const abis = {
  getMarket: "function getMarket(uint16 marketID) view returns (tuple(address baseAsset, address quoteAsset, uint256 liquidateRate, uint256 withdrawRate, uint256 auctionRatioStart, uint256 auctionRatioPerBlock, bool borrowEnable) market)",
  getAllMarketsCount: "uint256:getAllMarketsCount",
}