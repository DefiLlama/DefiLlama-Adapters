// const { uniV3Export } = require("../helper/uniswapV3");

// module.exports = uniV3Export({
//   polygon: {
//     factory: "0xE7aE959bbC94BDF2E9FF28a214840aB3285d7765",
//     fromBlock: 46977039,
//   }
// });


const indexExports = require('./api')

module.exports = indexExports
module.exports.misrepresentedTokens = true
