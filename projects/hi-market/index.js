const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contract = "0xf76550821b62702e95e181aeb77284ce70d4fe90"
const contract_era = "0x4Abb1bFcFb2af3d897B891DA265d94fb6C02B005"

async function tvl(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract, api })
}

async function tvl_era(api) {
  return sumTokens2({ tokens: [nullAddress], owner: contract_era, api })
}

module.exports = {
  methodology: `We count the ETH locked in the contracts`,
  ethereum: { tvl },
  base: { tvl },
  arbitrum: { tvl },
  era: { tvl: tvl_era },
}
