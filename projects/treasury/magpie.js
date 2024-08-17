const { treasuryExports } = require("../helper/treasury");
const { mergeExports } = require('../helper/utils');

const magpieTreasury = "0x6dc8ccf1b731e97834002e6ff45e4953bf9602de";
const vlpnp_staking = "0xc61D3c70CfC9dEDaA090FDD0760Eb9291253fEFF";
const vlrdp_staking = "0x07973730596E7dbA60E586CDC3dD48d2886Df9dd";
const pnp_arb = "0x2Ac2B254Bc18cD4999f64773a966E4f4869c34Ee"
const rdp_arb = "0x54bdbf3ce36f451ec61493236b8e6213ac87c0f6"
const ckp_bsc = "0x2B5D9ADea07B590b638FFc165792b2C610EdA649"
const vlckp_staking = "0x232594e7F0096ba7DDAbcD8689cB0D994694eb26"
const mgp = "0xD06716E1Ff2E492Cc5034c2E81805562dd3b45fa";

//counting staked tokens in each chain
const stakedExports = {
  arbitrum: {
    tvl: async (api) => {
      let bal_vlpnp = await api.multiCall({ abi: 'function getUserTotalLocked(address) view returns(uint256 _lockAmount)', calls: [magpieTreasury], target: vlpnp_staking, })
      api.add(pnp_arb, bal_vlpnp);
      let bal_vlrdp = await api.multiCall({ abi: 'function getUserTotalLocked(address) view returns(uint256 _lockAmount)', calls: [magpieTreasury], target: vlrdp_staking, })
      api.add(rdp_arb, bal_vlrdp);
      return api.getBalances();
    },
  },
  bsc: {
    tvl: async (api) => {
      let bal_vlckp = await api.multiCall({ abi: 'function getUserTotalLocked(address) view returns(uint256 _lockAmount)', calls: [magpieTreasury], target: vlckp_staking, })
      api.add(ckp_bsc, bal_vlckp);
      return api.getBalances();
    },
  },
}

const treasuryExportsObj = treasuryExports({
  ethereum: { owners: [magpieTreasury], },
  bsc: {
    owners: [magpieTreasury],
    ownTokens: [mgp]
  },
})

module.exports = mergeExports([treasuryExportsObj, stakedExports])
