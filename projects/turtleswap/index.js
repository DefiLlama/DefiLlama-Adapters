// projects/turtleswap/index.js
const { uniTvlExport } = require('../helper/unknownTokens')

// -- Vul dit in:
const CHAIN = 'vechain'                   // ondersteund in Llama SDK
const FACTORY = '0x7751a8Df07F7Ae6f9E92B06a363b3c020F2830aC'  // TurtleSwap V2/V3 factory

module.exports = {
  methodology: 'TVL telt de liquiditeit in TurtleSwap pools via de factory-reserves.',
  misrepresentedTokens: false,
  start: 1719964800, // YYYY-MM-DD -> Unix (voorbeeld)
  ...uniTvlExport(CHAIN, FACTORY), // helper bouwt de chain-sectie
}
