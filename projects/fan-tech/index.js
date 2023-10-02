const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x53167401aeebFf5677C31E1DDA945628422D7Ed2"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the MNT on ${contract}`,
  mantle: {
    tvl
  }
}