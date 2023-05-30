const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xce93F9827813761665CE348e33768Cb1875a9704"

async function tvl(time, ethBlock, { bsc: block }) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, block, chain: 'bsc', })
}

module.exports = {
  methodology: `We count the BNB on ${contract}`,
  bsc: {
    tvl
  }
}