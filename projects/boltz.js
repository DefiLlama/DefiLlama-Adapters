// Boltz is a Non-Custodial Bitcoin Bridge that let's users swap between different Bitcoin layers while staying in full control.
// Atomic Swaps ensure that users can swap between different Bitcoin layers without having to trust a third party.
// Boltz currently support the Bitcoin mainchain, the Lightning Network, the Liquid Network, Rootstock and Arbitrum.
// Providing a TVL is only possible on EVM chains (Rootstock and Arbitrum), as other layers are not based on the EVM model.

const ADDRESSES = require('./helper/coreAssets.json')

async function rskTvl(api) {
  const swapCapital = '0x1Bdf482F5da32ef51c20D9A94960385c5be9AaB7'
  return api.sumTokens({ owner: swapCapital, tokens: [ADDRESSES.null] })
}

async function arbitrumTvl(api) {
  const swapCapital = '0xa6d0956216da39aa1989066a9b22b64c30924dcd'
  const tBTC = '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40'
  return api.sumTokens({ owner: swapCapital, tokens: [tBTC] })
}

module.exports = {
  methodology: `TVL accounts for current Boltz RBTC balance on Rootstock and tBTC balance on Arbitrum`,
  rsk: {
    tvl: rskTvl,
  },
  arbitrum: {
    tvl: arbitrumTvl,
  },
}