const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x3dbea36ced3cd155605b725faf7e3f66dc5d6b2b"
const contract2 = "0xda78c03A7e4C44e570FDB7c6046D3e6387d5fDDC"
const contract3 = "0xF06B6dF2e5aabE6E53Cf496E7063bECbbFb50ABf"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owners: [contract, contract2, contract3], api })
}

module.exports = {
  methodology: `We count the Matic on the ${contract}, ${contract2}, and ${contract3}`,
  polygon: {
    tvl
  }
}