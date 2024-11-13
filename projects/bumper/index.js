const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const contract = "0xBabeE6d5F6EDD301B5Fae591a0D61AB702b359d0"
const oldTvl = sumTokensExport({ owner: contract, tokens: [ADDRESSES.ethereum.USDC, '0x5f18c75abdae578b483e5f43f12a39cf75b973a9'] })

const vaultTvl = sumTokensExport({
  tokensAndOwners: [
    [ADDRESSES.ethereum.WETH, '0x277b016D7Df1D8fC96F2Dcc6CE7a3789BaC7a25a'],
    [ADDRESSES.ethereum.USDC, '0x235A4998bD0ABa7CBDDc2E770ff79b3B49493fd5'],
  ]
})

module.exports = {
  methodology: `Count the USDC that has been deposited on ${contract}`,
  ethereum: {
    tvl: sdk.util.sumChainTvls([oldTvl, vaultTvl]),
    pool2: sumTokensExport({ owner: '0xD3122B06aD755f9b8F6fBA6dFb9c684c7A373e1c', tokens: ['0x11FA2Aac28F4E84b2e5B9907580Dbf44A1975912'], resolveLP: true, }),
    staking: sumTokensExport({ owner: '0x967583939a2E660567345CFEe6BE66870075B3d1', tokens: ['0x785c34312dfA6B74F6f1829f79ADe39042222168'], }),
  },
  hallmarks: [
    [1626264000, "LP Program Starts"],
    [1634212800, "LP Program Ended"],
    [1639656000, "Uniswap V3 Listing and Staking v1 Program starts"],
    [1658318400, "Alpha Testing"],
    [1677672000, "Uniswap V2 Listing and Liquidity Mining Program"],
  ]
}
