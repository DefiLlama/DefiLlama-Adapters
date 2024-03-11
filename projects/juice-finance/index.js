const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const LENDING_POOL = "0x4A1d9220e11a47d8Ab22Ccd82DA616740CF0920a"
const COLLATERAL_VAULT = "0x6301795aa55B90427CF74C18C8636E0443F2100b"
const COLLATERAL_VAULT_V2 = "0x105e285f1a2370D325046fed1424D4e73F6Fa2B0"

const vaults = [
  // This vault holds a Thruster LP token, but it is not being priced.
  ["0x12c69BFA3fb3CbA75a1DEFA6e976B87E233fc7df", "0x72E4ce9b7cC5d9C017F64ad58e512C253a11d30a"],
  [ADDRESSES.blast.WETH, "0x4A355D57fc1A5eEB33C0a19539744A2144220027"]
]

async function tvl(timestamp, _, _1, { api }) {
  return sumTokens2({ api, resolveLP: true, tokensAndOwners: [[ADDRESSES.blast.USDB, LENDING_POOL], [ADDRESSES.blast.WETH, COLLATERAL_VAULT], [ADDRESSES.blast.WETH, COLLATERAL_VAULT_V2], ...vaults] })
}

module.exports = {
  misrepresentedTokens: false,
  blast: {
    tvl
  }
}