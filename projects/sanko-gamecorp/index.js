const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x06f1afa00990A69cA03F82D4c1A3a64A45F45fCb"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  arbitrum: {
    tvl
  }
}