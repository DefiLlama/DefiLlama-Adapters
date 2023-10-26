const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xda78c03A7e4C44e570FDB7c6046D3e6387d5fDDC"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the Matic on the ${contract}`,
  polygon: {
    tvl
  }
}