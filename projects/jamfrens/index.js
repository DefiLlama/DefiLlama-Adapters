const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x3dbea36ced3cd155605b725faf7e3f66dc5d6b2b"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the Matic on the ${contract}`,
  polygon: {
    tvl
  }
}