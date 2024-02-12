const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x66fA4044757Fb7812EF5b8149649d45d607624E0"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl
  }
}