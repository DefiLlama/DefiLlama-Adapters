const wigoToken = '0xE992bEAb6659BFF447893641A378FbbF031C5bD6'
const masterFarmer = '0xA1a938855735C0651A6CfE2E93a32A28A236d0E9'

const { uniTvlExports } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')
module.exports = uniTvlExports({
  'fantom': '0xC831A5cBfb4aC2Da5ed5B194385DFD9bF5bFcBa7'
}, { staking: { fantom: [masterFarmer, wigoToken] } })
