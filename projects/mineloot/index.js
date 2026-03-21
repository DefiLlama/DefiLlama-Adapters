const { staking } = require('../helper/staking')

const LOOT = '0x00E701Eff4f9Dc647f1510f835C5d1ee7E41D28f'
const GRID_MINING = '0xA8E2F506aDcbBF18733A9F0f32e3D70b1A34d723'
const STAKING = '0x554CEAe7b091b21DdAeFe65cF79651132Ee84Ed7'
const LOCK = '0xbb9D524e28c7E7b5A9D439D5D1ba68A87788BbB6'

module.exports = {
  methodology: 'TVL is LOOT tokens held in GridMining (mined rewards), Staking (user-staked LOOT), and Lock (user-locked LOOT).',
  base: {
    tvl: () => ({}),
    staking: staking([STAKING, GRID_MINING, LOCK], LOOT),
  },
}
