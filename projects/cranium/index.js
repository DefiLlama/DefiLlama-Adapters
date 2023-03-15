const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

const arbitrumVault = '0x76cA86C73CE0F03eac0052C4FC5eacdb10D9663f';
const arbitrumStaking = '0x2b402AeDd4ccC193DC2A50c281Fb8945ddaD9760';
const arbitrumGMX = '0xfa5992A8A47aF7029e04eC6a95203AD3f301460b';

module.exports = {
  fantom: {
    staking: staking(arbitrumStaking, arbitrumGMX),
    tvl: gmxExports({ vault: arbitrumVault, })
  }
}