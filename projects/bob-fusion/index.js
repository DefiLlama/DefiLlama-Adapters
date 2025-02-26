const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

const fusionLockContract = "0x61dc14b28d4dbcd6cf887e9b72018b9da1ce6ff7"

const enabledAddresses = [
  ADDRESSES.null, // ETH
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.tBTC,
  ADDRESSES.ethereum.RETH,
  ADDRESSES.ethereum.WSTETH,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.DAI,
  "0x7122985656e38BDC0302Db86685bb972b145bD3C", // STONE
  "0xbdBb63F938c8961AF31eaD3deBa5C96e6A323DD1", // eDLLR
  "0xbdab72602e9AD40FC6a6852CAf43258113B8F7a5", // eSOV
  "0xe7c3755482d0dA522678Af05945062d4427e0923", // ALEX
  ADDRESSES.ethereum.LBTC, // LBTC
]

module.exports = {
  ethereum: { tvl: sumTokensExport({ owner: fusionLockContract, tokens: enabledAddresses }) }
}