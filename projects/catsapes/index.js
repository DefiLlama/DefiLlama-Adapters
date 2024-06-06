const { masterchefExports } = require('../helper/unknownTokens')


const config = {
  kava: {
    SKILL_TOKEN_CONTRACT: '0x85602B00C9bd973B1Afb66EC140A62480CF812d3',
  }
}

module.exports = masterchefExports({ chain: 'kava', masterchef: config.kava.SKILL_TOKEN_CONTRACT, })