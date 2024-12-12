const { staking } = require("../helper/staking.js");

const STAKING_BASE = '0xE420BBb4C2454f305a3335BBdCE069326985fb5b'
const FREEZER_BASE = '0x03e225D2bd32F5ecE539005B57F9B94A743ADBFB'
const VESTING_BASE = '0x42a40321843220e9811A1385D74d9798436f7002'
const JAV_BASE = '0xEdC68c4c54228D273ed50Fc450E253F685a2c6b9'

module.exports = {
  methodology: `We count the total value locked from staking and freezer of javsphers native token JAV). `,
  hallmarks: [
    [1733837635, "Migration to BASE"],
  ],
  base: {
    tvl: () => { },
    staking: staking([STAKING_BASE, FREEZER_BASE], JAV_BASE),
    vesting: staking(VESTING_BASE, JAV_BASE)
  },
  defichain_evm: {
    tvl: () => { },
    staking: () => { },
  },
  defichain: {
    tvl: () => { },
  },
}
