
const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require("../helper/coreAssets.json");

const AUCTION = '0xA9B1Eb5908CfC3cdf91F9B8B3a74108598009096'
const AUCTION_ETH_SLP = '0x0f8086d08a69ebd8e3a130a87a3b6a260723976f'

const STAKING_ADDRESS = '0x98945BC69A554F8b129b09aC8AfDc2cc2431c48E'
const STAKING_LP_ADDRESS = '0xbe5a88b573290e548759520a083a61051b258451'

const BOUNCE_V1 = '0x73282A63F0e3D7e9604575420F777361ecA3C86A'
const BOUNCE_V1_PRO = '0x6fe40f415448d930166f9110D3bBe2146383bC66'

const v1config = {
  ethereum: {
    tokensAndOwners: [[ADDRESSES.ethereum.USDT,BOUNCE_V1],[ADDRESSES.ethereum.USDC,BOUNCE_V1],[ADDRESSES.ethereum.USDT,BOUNCE_V1_PRO]],
    factory: "0x6fe40f415448d930166f9110D3bBe2146383bC66",
    fromBlock: 11774020
  }
}

module.exports = {
  ethereum: {
    tvl: async (_, _b, _cb, { api, }) => {
      console.log('tokensAndOwners', v1config.ethereum.tokensAndOwners)
      return api.sumTokens({ tokensAndOwners: v1config.ethereum.tokensAndOwners, blacklistedTokens: [] })
    },
    pool2: sumTokensExport({ owner: STAKING_LP_ADDRESS, tokens: [AUCTION_ETH_SLP] }),
    staking: sumTokensExport({ owner: STAKING_ADDRESS, tokens: [AUCTION] }),
  },
}
