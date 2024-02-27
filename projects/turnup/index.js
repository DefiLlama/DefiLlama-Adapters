const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x5d9388a4ea9ebfc4af8c71c0b4aa3b372fefe12b"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the BNB on ${contract}`,
  bsc: {
    tvl
  }
}