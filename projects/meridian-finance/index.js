const USDC_ARC = '0x3600000000000000000000000000000000000000'
const USYC_ARC = '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C'

const YIELD_VAULT = '0x2f685b5Ef138Ac54F4CB1155A9C5922c5A58eD25'
const FIRMATA_COMMERCE_ARC = '0x5806a1f82a1b3fcbefcd2efc5d873c2167ee3a8e'
const FIRMATA_ESCROW_ARC = '0x9a1690aaf6c33c8d97755cff00f0edca61965dfa'

async function arcTvl(api) {
  return api.sumTokens({
    tokensAndOwners: [
      [USDC_ARC, YIELD_VAULT],
      [USDC_ARC, FIRMATA_COMMERCE_ARC],
      [USDC_ARC, FIRMATA_ESCROW_ARC],
      [USYC_ARC, YIELD_VAULT],
    ],
  })
}

module.exports = {
  methodology: 'TVL is the sum of USDC and USYC deposited in Meridian Finance YieldVault, Firmata Commerce escrow, and Firmata Escrow contracts on Arc Network.',
  arc: {
    tvl: arcTvl,
  },
}
