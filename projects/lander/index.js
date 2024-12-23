const { compoundExports2 } = require("../helper/compound");
const comptroller = '0x344655CB08a25A7b2501CafB47CdF9490cE7fad3'

function tvl(borrowed = false) {
  return async (api, ...args) => {
    const key = borrowed ? 'borrowed' : 'tvl'
    const tvl = compoundExports2({ comptroller })[key]
    return tvl(api, ...args)
  }
}

module.exports = {
  bsc: {
    tvl: tvl(),
    borrowed: tvl(true),
  }
}
