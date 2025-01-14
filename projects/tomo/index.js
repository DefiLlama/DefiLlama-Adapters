const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0x9e813d7661d7b56cbcd3f73e958039b208925ef8"

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

module.exports = {
  methodology: `We count the ETH on ${contract}`,
  linea: {
    tvl
  }
}
