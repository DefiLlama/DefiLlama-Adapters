const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xE233198863b75Acc6e1AF43DAfF3f5918e35875E"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl
  }
}