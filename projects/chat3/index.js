const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xAd3dbD09835CF15c543Bc59d31865D659b71060e"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the MNT on ${contract}`,
  mantle: {
    tvl
  }
}