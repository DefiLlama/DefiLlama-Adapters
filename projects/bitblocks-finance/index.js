const { uniTvlExport } = require('../helper/unknownTokens')

const FACTORY = '0x65b3cc7a7cb167221266fc93884717de2dbd074e'

module.exports = {
  ...uniTvlExport('bsc', FACTORY),
  methodology:
    'Counts the token reserves held by every BitBlocks Finance AMM pair created by the BitBlocks Factory on BNB Smart Chain.',
}
