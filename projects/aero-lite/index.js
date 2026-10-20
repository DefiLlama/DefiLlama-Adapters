const { getUniTVL } = require('../helper/unknownTokens.js')
const { mergeExports } = require('../helper/utils')

const abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: "function allPools(uint) view returns (address)",
}

const config = {
  arc: {
    factories: [
      '0xb89Df768aF2CFE637ceB352c587Fe8edAf491d03', // CL
    ],
  },
  base: {factories: ['0xC6bdE6e9F0CD71013E5FcF2dAAE2fA1c71Bb2F25']},
  optimism: {factories: ['0xf3384180f1F99Ff4448e836b7773e7B7A2D1fa3b']},
  arbitrum: {factories: ['0x2f1ea2c2dEf80FCa460c0dcF205C281a8116834b']},
  ethereum: {factories: ['0xAbD524b6f8dAae68314Ad2fD7698cb65b4f8D398']},
  ink: {factories: ['0xAbD524b6f8dAae68314Ad2fD7698cb65b4f8D398']},
  robinhood: {factories: ['0xAbD524b6f8dAae68314Ad2fD7698cb65b4f8D398']},
}

const exportsList = []
Object.entries(config).forEach(([chain, { factories, blacklistedTokens }]) => {
  factories.forEach(factory => {
    exportsList.push({ [chain]: { tvl: getUniTVL({ factory, blacklistedTokens, fetchBalances: true, abis, permitFailure: true, useDefaultCoreAssets: false, }) } })
  })
})

module.exports = mergeExports(exportsList)
