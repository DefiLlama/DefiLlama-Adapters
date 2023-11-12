const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x51810698D18a7ba9e73a3D63a4Fe9200C384157A"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl
  }
}