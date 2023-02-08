const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x4d86Aa688ba56e1971Baf8C2CBCb44D980587894"

async function tvl(time, ethBlock, { flare: block }) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, block, chain: 'flare', })
}

module.exports = {
  methodology: `We count the FLR on ${contract}`,
  flare: {
    tvl
  }
}