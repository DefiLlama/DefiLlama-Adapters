const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// On-chain accounting per issue #19200. Counts only on-chain balances of
// underlying assets at verified Multipli vault and fund-manager addresses.
// Self-issued shares (rwaUSDi) and off-chain/custodial claims are excluded.

const avaxOwners = [
  '0xCF0Eb4ac018C06a16ED5c63484823C7805e7599D', // xUSDC vault
  '0x01e676EAA0C9780A88395c651349Cf08Fe52368e', // xUSDC fund manager
  '0x468BbabAEf852C134b584382C0fef83F2954Cd5c', // xBTC.b vault
  '0x62c2181618833b202e68b5addc4279542978Ef47', // xBTC.b fund manager
]

const monadOwners = [
  '0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009', // xUSDC vault
  '0xE1824bF952bB2E8414d12de8A9fc2cBc666D6758', // xUSDC fund manager
]

module.exports = {
  methodology: 'TVL is the on-chain balance of underlying assets (USDC, BTC.b) at verified Multipli vault and fund-manager addresses. Self-issued shares (rwaUSDi) and off-chain custodial claims are excluded.',
  avax: {
    tvl: sumTokensExport({
      owners: avaxOwners,
      tokens: [ADDRESSES.avax.USDC, ADDRESSES.avax.BTC_b],
    }),
  },
  monad: {
    tvl: sumTokensExport({
      owners: monadOwners,
      tokens: [ADDRESSES.monad.USDC],
    }),
  },
}
