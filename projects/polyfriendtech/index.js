const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x25d1bf639a350c58b03bca310ecca955fb13fad0"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  polygon: {
    tvl
  }
}