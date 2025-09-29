const { uniTvlExport } = require('../helper/unknownTokens')

const CHAIN = 'vechain'
const FACTORY = '0x7751a8Df07F7Ae6f9E92B06a363b3c020F2830aC'

module.exports = {
  methodology: 'TVL counts liquidity across TurtleSwap pools via factory reserves.',
  misrepresentedTokens: false,
  start: 1719964800,
  ...uniTvlExport(CHAIN, FACTORY),
}
