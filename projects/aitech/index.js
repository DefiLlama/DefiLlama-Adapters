const { staking } = require('../helper/staking')

const aitechStakingContract = '0x2C4dD7db5Ce6A9A2FB362F64fF189AF772C31184';
const aitechTokenContract = '0x2D060Ef4d6BF7f9e5edDe373Ab735513c0e4F944';

module.exports = {
  bsc: {
    tvl: () => ({}),
    staking: staking(aitechStakingContract, aitechTokenContract,)
  },
}
