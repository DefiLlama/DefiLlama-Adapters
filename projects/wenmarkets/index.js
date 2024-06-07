const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x3bB94837A91E22A134053B9F38728E27055ec3d1"

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the MATIC on ${contract}`,
  polygon: {
    tvl
  }
}