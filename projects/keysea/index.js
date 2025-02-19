const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const KEYSEA_V1_CONTRACT = "0x28C0C1b47021C9d7BBD26c83eEa448F377F9600a"

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: KEYSEA_V1_CONTRACT, api })
}

module.exports = {
  methodology: `We count the ETH on ${KEYSEA_V1_CONTRACT}`,
  linea: {
    tvl
  }
}