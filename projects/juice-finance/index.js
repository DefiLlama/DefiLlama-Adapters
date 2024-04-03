const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const LENDING_POOL_USDB = "0x4A1d9220e11a47d8Ab22Ccd82DA616740CF0920a"
const LENDING_POOL_WETH = "0x44f33bC796f7d3df55040cd3C631628B560715C2";
const COLLATERAL_MANAGER = "0x6301795aa55B90427CF74C18C8636E0443F2100b"
const COLLATERAL_MANAGER_V2 = "0x105e285f1a2370D325046fed1424D4e73F6Fa2B0"
const WETH_COLLATERAL_MANAGER = "0x23eBa06981B5c2a6f1a985BdCE41BD64D18e6dFA"
const EZETH_COLLATERAL_MANAGER = "0xc81A630806d1aF3fd7509187E1AfC501Fd46e818"
const MUNCHABLE_WETH_COLLATERAL_MANAGER = "0x4A355D57fc1A5eEB33C0a19539744A2144220027"

const EZETH = "0x2416092f143378750bb29b79eD961ab195CcEea5"

const MUNCHABLE_LOCKDROP_VAULT = "0x01F7dF622DDE3B7d234aadBE282DDA24CEAd9D21"

const vaults = [
  ["0x12c69BFA3fb3CbA75a1DEFA6e976B87E233fc7df", "0x72E4ce9b7cC5d9C017F64ad58e512C253a11d30a"],
  ['0x4bed2a922654cacc2be974689619768fabf24855', "0x0CA56aa647E83A8F0a5f7a81a2fdcA393bC68D78"],
  [EZETH, '0x741011f52B7499ca951f8b8Ee547DD3Cdd813Fda'],
]

const wethHolders = [LENDING_POOL_WETH, COLLATERAL_MANAGER, COLLATERAL_MANAGER_V2, WETH_COLLATERAL_MANAGER, MUNCHABLE_WETH_COLLATERAL_MANAGER, ].map(a => [ADDRESSES.blast.WETH, a])

async function tvl(api) {
  const thrusterv2LPs = [ // [LP, contract]
    ['0x12c69bfa3fb3cba75a1defa6e976b87e233fc7df', '0x8034b01555487C26D4e21F4E33b7A30fbc90d181'],
    ['0x12c69bfa3fb3cba75a1defa6e976b87e233fc7df', "0x72E4ce9b7cC5d9C017F64ad58e512C253a11d30a"],
  ]
  const stakedLPCalls = thrusterv2LPs.map(lp => ({ params: [lp[1], lp[0]] }))
  const v2Bals = await api.multiCall({ abi: 'function staked(address, address) view returns (uint256)', calls: stakedLPCalls, target: '0xc3ecadb7a5fab07c72af6bcfbd588b7818c4a40e' })
  const v2Tokens = thrusterv2LPs.map(lp => lp[0])
  api.add(v2Tokens, v2Bals)
  await sumTokens2({ api, resolveLP: true, tokensAndOwners: [[ADDRESSES.blast.USDB, LENDING_POOL_USDB], [EZETH, EZETH_COLLATERAL_MANAGER], ...wethHolders, ...vaults], })
}

module.exports = {
    blast: {
    tvl
  }
}
