const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x4a3720A09a90A82170779c972832eD04542deeAC"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  arbitrum: {
    tvl
  }
}
