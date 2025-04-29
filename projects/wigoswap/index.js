const { uniTvlExport } = require('../helper/calculateUniTvl.js')

const factory = '0xC831A5cBfb4aC2Da5ed5B194385DFD9bF5bFcBa7'
const wigoToken = '0xE992bEAb6659BFF447893641A378FbbF031C5bD6'
const masterFarmer = '0xA1a938855735C0651A6CfE2E93a32A28A236d0E9'

async function staking(api) {
  return api.sumTokens({ owner: masterFarmer, tokens: [wigoToken], })
}

module.exports = {
  methodology: 'The factory address (0xC831A5cBfb4aC2Da5ed5B194385DFD9bF5bFcBa7) is used find the pairs and sum the liquidity of the AMM. Staking accounts for the WIGO locked in MasterFarmer (0xA1a938855735C0651A6CfE2E93a32A28A236d0E9).',
  fantom: {
    staking,
    tvl: uniTvlExport(factory, 'fantom', true)
  },
}