const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x2544a6412bc5aec279ea0f8d017fb4a9b6673dca"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  arbitrum: {
    tvl
  }
}