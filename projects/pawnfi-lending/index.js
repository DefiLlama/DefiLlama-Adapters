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

// Account that drained the pools in the June 2023 exploit (borrows on 2023-06-17 across ETH, WBTC, USDT
// and USDC). Its debt will never be repaid, so it is excluded from borrowed.
const EXPLOITER = '0xb618d91fe014bfcb9c8d440468b6c78e9ada9da1'

async function borrowed(api) {
  const blacklistedTokens = await getPawnNFTTokens(api)
  const items = await api.call({ abi: ABI.cTokenMetadataAll, target: Lending, params: [LendCToken], })
  const markets = items.filter(i => !blacklistedTokens.includes(i.underlyingAssetAddress))
  const cTokens = markets.map(i => i.cToken)
  const totalBorrows = await api.multiCall({ abi: 'uint256:totalBorrows', calls: cTokens })
  const exploiterDebt = await api.multiCall({ abi: 'function borrowBalanceStored(address) view returns (uint256)', calls: cTokens.map(target => ({ target, params: [EXPLOITER] })) })
  markets.forEach((m, i) => {
    const debt = BigInt(totalBorrows[i]) - BigInt(exploiterDebt[i])
    if (debt > 0n) api.add(m.underlyingAssetAddress, debt.toString())
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

module.exports.methodology = 'TVL is the underlying held by the lending markets plus the NFTs held by the protocol. Borrowed is outstanding debt in each market, excluding the debt of the June 2023 exploiter, which is bad debt.'

module.exports.hallmarks = [
  ['2023-06-16', 'Protocol was exploited'],
]
