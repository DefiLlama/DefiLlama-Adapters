const VAULTS = {
  monad: ['0x792C7c5fB5C996E588b9F4A5FB201C79974e267C'], // Kintsu superMON
  hyperliquid: ['0x8fFDcd8A96d293f45aA044d10b899F9D71897E8a'], // HLPe
}

async function tvl(api) {
  const vaults = VAULTS[api.chain]
  const [assets, totals] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls: vaults }),
    api.multiCall({ abi: 'uint256:getTotalAssets', calls: vaults }),
  ])
  api.addTokens(assets, totals)
}

module.exports = {
  doublecounted: true,
  methodology: 'Counts on-chain getTotalAssets for the Qualia-curated Upshift superMON and HLPe vaults in their respective reference assets. These vaults are also counted under Upshift; superMON is jointly attributed to Ergonia.',
  monad: { tvl },
  hyperliquid: { tvl },
}
