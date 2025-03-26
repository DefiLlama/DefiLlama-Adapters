const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  // USN Vault market addresses
  const owners = [
    "0x4B1ef8Eb333FAE7CdaEc847475CC47bcDB70bF3f",
    "0xBA06793bb5E3495c54330F5c5400C9AD14443586",
    "0x57ff14bD78d4B9B14E9aEC6e1D5d580d5DCa86ED",
    "0x0b4D1d74890a860a7a3dF7769114bCeA7AA8B713"
  ]
  // USN address
  const tokens = [
    '0x0469d9d1dE0ee58fA1153ef00836B9BbCb84c0B6',
  ]
  return sumTokens2({ api, owners, tokens})
}

module.exports = {
  era: {
    tvl,
  },
  methodology: `Counts the total liquidity allocated by the RFX v2 - USN Smart Liquidity Vault`,
};