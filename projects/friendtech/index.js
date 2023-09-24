const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl
  }
}