// Boltz is a Non-Custodial Bitcoin Bridge that let's users swap between different Bitcoin layers while staying in full control.
// Atomic Swaps ensure that users can swap between different Bitcoin layers without having to trust a third party.
// Boltz currently support the Bitcoin mainchain, the Lightning Network, the Liquid Network and Rootstock
// Providing a TVL is only possible on the Rootstock chain, as other layers are not based on the EVM model.

const ADDRESSES = require('./helper/coreAssets.json')

async function tvl(api) {
  const swapCapital = '0x1Bdf482F5da32ef51c20D9A94960385c5be9AaB7'
  return api.sumTokens({ owner: swapCapital, tokens: [ADDRESSES.null]})
}

module.exports = {
  methodology: `TVL only accounts for current Boltz RBTC balance`,
  rsk: {
    tvl,
  }
}