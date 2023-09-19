const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x87da6930626fe0c7db8bc15587ec0e410937e5dc"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  arbitrum: {
    tvl
  }
}