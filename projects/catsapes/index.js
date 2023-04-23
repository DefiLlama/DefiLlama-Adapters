const { sumTokensExport } = require('../helper/unwrapLPs')
const { masterchefExports } = require('../helper/unknownTokens')


const config = {
  kava: {
    SKILL_TOKEN_CONTRACT: '0x85602B00C9bd973B1Afb66EC140A62480CF812d3',
    // STAKING: [
    //   '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b',
    //   '0x765277EebeCA2e31912C9946eAe1021199B39C61',
    //   '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
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