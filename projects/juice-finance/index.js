const ADDRESSES = require('../helper/coreAssets.json')
const LENDING_POOL = "0x4A1d9220e11a47d8Ab22Ccd82DA616740CF0920a"
const COLLATERAL_VAULT = "0x6301795aa55B90427CF74C18C8636E0443F2100b"

async function tvl(timestamp, _, _1, { api }) {
  return api.sumTokens({ tokensAndOwners: [[ADDRESSES.blast.USDB, LENDING_POOL], [ADDRESSES.blast.WETH, COLLATERAL_VAULT]] })
}

module.exports = {
  misrepresentedTokens: false,
  blast: {
    tvl
  }
}