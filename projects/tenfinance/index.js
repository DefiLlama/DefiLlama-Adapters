const { staking } = require("../helper/staking");

const tenFarmAddress = "0x264A1b3F6db28De4D3dD4eD23Ab31A468B0C1A96";
const tenVault = "0xC2fB710D39f1D116FD3A70789381a3699Ff9fce0";
const tenfi = "0xd15c444f1199ae72795eba15e8c1db44e47abf62";
const tenFi_PCS = '0xFBF4cf9CdD629bF102F68BFEE43A49923f869505'.toLowerCase()

const { yieldHelper, } = require("../helper/yieldHelper")

module.exports = yieldHelper({
  project: 'ten-finance',
  chain: 'bsc',
  masterchef: tenFarmAddress,
  nativeToken: tenfi,
  blacklistedTokens: [tenFi_PCS, tenfi],
})

module.exports.bsc.staking = staking(tenVault, tenfi)