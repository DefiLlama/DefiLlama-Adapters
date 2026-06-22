const { uniTvlExport } = require('../helper/unknownTokens')

module.exports = {
  methodology: 'TVL is calculated by enumerating RocketSwap liquidity pools from its Uniswap V2 Factory and summing the Pair reserves.',
  ...uniTvlExport('anubi', '0xaf6F4e641C86A25518509BC840051A8652Af598A'),
}
