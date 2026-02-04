const { onChainTvl } = require('../helper/balancer')

const vault = "0x25898DEe0634106C2FcBB51B3DB5b14aA1c238a4";
const launchBlock = 230182440;

module.exports = {
    methodology: 'TVL counts the external assets deposited in the vaults',
    arbitrum: {
      tvl: onChainTvl(vault, launchBlock),
    }
  };