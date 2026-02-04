const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x6aB5242fCaCd0d37c39F77Ff7EabdCcac5e8D450"
const contract1 = "0x4703B92dFCb0Ad403030BF783c8EC067297B55fA"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

async function tvlsei(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract1, api })
}

module.exports = {
  methodology: `We count the SEI on ${contract}`,
  arbitrum: {
    tvl
  },
  sei: {
    tvl:tvlsei
  }
}