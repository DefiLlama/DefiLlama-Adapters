const { staking} = require("./helper/staking");

const UBI = '0xDd1Ad9A21Ce722C151A836373baBe42c868cE9a4'
const lpTokens = [
  '0xea7952fac7ff6e997d895c1566599b86b91444c0', // DAI_UBI_LP
  '0xe632ded5195e945a31f56d674aab0c0c9e7e812c'  // ETH_UBI_LP
] 
const stakingContracts = [
  '0xf9ae19cf447b3560afc407d9aac9e2007d4efe43', // DAI_UBI_LP
  '0x81c071e795ce29eb155c9818f06786640d0adb2b'  // ETH_UBI_LP
]  

module.exports = {
  ethereum: {
    pool2: staking(stakingContracts, lpTokens),
    tvl: () => ({}), 
  },
  methodology: `UBI/ETH and UBI/DAI LP can be staked in a uni-v2 pool2 contract`
}
