const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { masterchefExports } = require('../helper/unknownTokens')


const config = {
  kava: {
    SKILL_TOKEN_CONTRACT: '0x85602B00C9bd973B1Afb66EC140A62480CF812d3',
    // STAKING: [
    //   ADDRESSES.kava.WKAVA,
    //   ADDRESSES.shiden.ETH,
    //   ADDRESSES.telos.ETH,
    //   '0xB44a9B6905aF7c801311e8F4E76932ee959c663',
    // ]
  }
}


// Object.keys(config).forEach(chain => {
//   const { SKILL_TOKEN_CONTRACT, STAKING, } = config[chain]
//   module.exports[chain] = {
//     tvl: () => ({}),
//     staking: sumTokensExport({ tokens: STAKING, owner: SKILL_TOKEN_CONTRACT })
//   }
// })

module.exports = masterchefExports({ chain: 'kava', masterchef: config.kava.SKILL_TOKEN_CONTRACT, })