const { getUniTVL } = require('../helper/unknownTokens.js')
const { mergeExports } = require('../helper/utils')

const abis = {
  allPairsLength: 'uint256:allPoolsLength',
  allPairs: "function allPools(uint) view returns (address)",
}

const config = {
  arc: {
    factories: [
      '0xb89Df768aF2CFE637ceB352c587Fe8edAf491d03', // CL (lite launch)
      '0x7F83235643181E440433400a027618Cd50879751', // CL
    ],
  },
  base: {factories: ['0x9CB220581b91b0C83223012FE69688b92aD07a76']},
  optimism: {factories: ['0xfeaB42D90055db3a0616249f76B6002D72266778']},
  arbitrum: {factories: ['0x88a60ee77392577c355C0acb2A8d476D5a4EC03a']},
  ethereum: {factories: ['0xF4Fd2E6c5B60c5b365cd1B96DD6245E6D60414c2']},
  ink: {factories: ['0x7660BF2aDefC687C22906112ca323d60A00358cF']},
  robinhood: {factories: ['0xc63d7338c178e805c544B8f897066bD3BBcBE136']},
}

const exportsList = []
Object.entries(config).forEach(([chain, { factories, blacklistedTokens }]) => {
  factories.forEach(factory => {
    exportsList.push({ [chain]: { tvl: getUniTVL({ factory, blacklistedTokens, fetchBalances: true, abis, permitFailure: true, useDefaultCoreAssets: false, }) } })
  })
})

module.exports = mergeExports(exportsList)
