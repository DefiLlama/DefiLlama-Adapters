const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x597774837debe9f074453c04cea46b532759b28a"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  base: {
    tvl
  }
}