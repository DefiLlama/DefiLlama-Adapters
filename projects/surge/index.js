const sui = require('../helper/chain/sui')
const ADDRESSES = require('../helper/coreAssets.json')

// Surge's V6 vault: principal is held 1:1 in the vault (no-loss design — the
// vault's total_principal field IS the TVL). Unlike LST protocols (see
// haedal/index.js) there's no rewards/fees/unstaked math needed here: the
// contract enforces that total_principal always equals the sum of active
// stakers' deposits, denominated directly in SUI mist.
const V6_VAULT = '0xcc6a5e55e3099b2b9d777b9f51b6a5807a03888c613be0b401468a94cc3f1ba5'

async function tvl(api) {
  const { fields: vault } = await sui.getObject(V6_VAULT)
  api.add(ADDRESSES.sui.SUI, vault.total_principal)
}

module.exports = {
  methodology: 'TVL is the total SUI principal staked in the Surge prize-linked staking vault (V6). Principal is held 1:1 and never used for anything other than covering staker withdrawals — enforced on-chain, verifiable via the V6_VAULT object.',
  sui: {
    tvl,
  },
}
