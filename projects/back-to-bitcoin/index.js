const { sumTokens2 } = require('../helper/unwrapLPs')

const contract = "0x1EE28d16C380B2137E63EBf92a9F5B42e63E9500"
const BTCB = '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [BTCB], owner: contract, api })
}

module.exports = {
  methodology: `We count the BTCB on ${contract}`,
  bsc: {
    tvl
  }
}
