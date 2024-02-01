const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xbe74a95d159e8e323b8c1a70f825efc85fed27c4"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl
  }
}