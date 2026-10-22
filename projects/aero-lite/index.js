const { getUniTVL } = require('../helper/unknownTokens.js')
const { mergeExports } = require('../helper/utils')

const abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: "function allPools(uint) view returns (address)",
}

const poolFactories = [
  '0x78589E876edcEbdce72ee3436ab3c9AD3a7cEF2D',
  '0x8E6a9FCd1d638CC760Ffba397605Fe3355dE76D2',
]

const config = {
  arc: {
    factories: [
      '0xb89Df768aF2CFE637ceB352c587Fe8edAf491d03', // CL
    ],
  },
  base: { factories: ['0xC6bdE6e9F0CD71013E5FcF2dAAE2fA1c71Bb2F25', '0x9CB220581b91b0C83223012FE69688b92aD07a76', ...poolFactories] },
  optimism: { factories: ['0xf3384180f1F99Ff4448e836b7773e7B7A2D1fa3b', '0xfeaB42D90055db3a0616249f76B6002D72266778', ...poolFactories] },
  arbitrum: { factories: ['0x2f1ea2c2dEf80FCa460c0dcF205C281a8116834b', '0x88a60ee77392577c355C0acb2A8d476D5a4EC03a', ...poolFactories] },
  ethereum: { factories: ['0xAbD524b6f8dAae68314Ad2fD7698cb65b4f8D398', '0xF4Fd2E6c5B60c5b365cd1B96DD6245E6D60414c2', ...poolFactories] },
  ink: { factories: ['0xAbD524b6f8dAae68314Ad2fD7698cb65b4f8D398', '0x7660BF2aDefC687C22906112ca323d60A00358cF', ...poolFactories] },
  robinhood: { factories: ['0xAbD524b6f8dAae68314Ad2fD7698cb65b4f8D398', '0xc63d7338c178e805c544B8f897066bD3BBcBE136', ...poolFactories] },
}

const exportsList = []
Object.entries(config).forEach(([chain, { factories, blacklistedTokens }]) => {
  factories.forEach(factory => {
    exportsList.push({ [chain]: { tvl: getUniTVL({ factory, blacklistedTokens, fetchBalances: true, abis, permitFailure: true, useDefaultCoreAssets: false, }) } })
  })
})

module.exports = mergeExports(exportsList)
