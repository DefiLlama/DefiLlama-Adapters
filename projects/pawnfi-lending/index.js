const ABI = require("../pawnfi/helper/abi.json")
const { Lending, LendCToken } = require("../pawnfi/helper/config.js")
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const { mergeExports } = require('../helper/utils')
const nftTvl = require('../pawnfi-nft/index.js')

async function getPawnNFTTokens(api) {
  const logs = await getLogs({
    api,
    target: '0x82cac2725345ea95a200187ae9a5506e48fe1c5d',
    topics: ['0x0e9af31ba332bde3bd4bd41172ead69274cb4263d5a6f2fa934a14dacefed4b1'],
    eventAbi: 'event PieceTokenCreated (address token, address pieceToken, uint256 pieceTokenLength)',
    onlyArgs: true,
    fromBlock: 17107816,
  })
  return logs.map(log => log.pieceToken)
}

async function borrowed(api) {
  const blacklistedTokens = await getPawnNFTTokens(api)
  const items = await api.call({ abi: ABI.cTokenMetadataAll, target: Lending, params: [LendCToken], })
  items.forEach((v) => {
    if (blacklistedTokens.includes(v.underlyingAssetAddress)) return
    api.add(v.underlyingAssetAddress, v.totalBorrows)
  })
}


async function tvl(api) {
  const blacklistedTokens = await getPawnNFTTokens(api)
  const items = await api.call({ abi: ABI.cTokenMetadataAll, target: Lending, params: [LendCToken], })
  return sumTokens2({ api, tokensAndOwners: items.map(i => [i.underlyingAssetAddress, i.cToken]), blacklistedTokens })
}


module.exports = mergeExports([{
  ethereum: { tvl, borrowed },
}, nftTvl])

module.exports.hallmarks = [
  ['2023-06-16', 'Protocol was exploited'],
]
