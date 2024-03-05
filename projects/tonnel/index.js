const { sumTokensExport } = require('../helper/chain/ton')

const config = require('./config.js')
const {sleep} = require("../helper/utils");
const tonnel = "EQDNDv54v_TEU5t26rFykylsdPQsv5nsSZaH_v7JSJPtMitv"
const tonnelHolders = [
  "EQDTs-yjPLn7XzaRRq8pjp7H8Nw4y_OJ51Bk2dcrPlIYgwtV", // 10000 TONNEL
  "EQAgoyECSzCIFTFkMIvDLgdUE3D9RxGfYQQGfxy3lBBc_Ke_", // 1000 TONNEL
  "EQDzAhS3Ev8cxEBJ96MIqPjxyD_k0L3enzDWnQ3Z-4tUK1h5", // 200 TONNEL
  "EQASyc8d2DjZHrFevnF432NRLc4qwh6HGUPAbMvbofMkeRZl", // 50 TONNEL
  "EQCNoApBzMacKKdTwcvi1iOx78e98bTSaN1Gx_nnmd3Ek5Yn", // 66 TONNEL
]

Object.keys(config).forEach(async (chain) => {
  const tokenSet = new Set()
  const owners = config[chain].map(({ tokens, holders }) => {
    tokens.forEach(i => tokenSet.add(i))
    return holders
  }).flat()

  module.exports[chain] = {
    tvl: sumTokensExport({ owners, tokens: [...tokenSet], onlyWhitelistedTokens: true, })
  }
  await sleep(30000)
  if (chain === 'ton')
    module.exports.ton.staking = sumTokensExport({ owners: tonnelHolders, tokenSet: [tonnel], onlyWhitelistedTokens: true,})
})