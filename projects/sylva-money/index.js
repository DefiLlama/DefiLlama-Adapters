const VAULT = '0xc428439fB7B1EFE56360Eb837Ca98F551fdD9B26' // Sylva Concentrated Liquidity

async function tvl(api) {
  await api.erc4626Sum({ calls: [VAULT], isOG4626: true })
}

module.exports = {
  doublecounted: true,
  methodology: 'Counts the on-chain totalAssets of the Upshift Sylva Concentrated Liquidity vault, denominated in its underlying asset. The same vault is also included in Upshift TVL.',
  ethereum: { tvl },
}
