const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x6aB5242fCaCd0d37c39F77Ff7EabdCcac5e8D450"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  arbitrum: {
    tvl
  }
}