const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xA7f3d2dEa7a53E7A9FEbBdE5Cf7C69d39D065030"

async function tvl(time, ethBlock, { kava: block }) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, block, chain: 'kava', })
}

module.exports = {
  methodology: `We count the WKAVA on ${contract}`,
  kava: {
    tvl
  }
}