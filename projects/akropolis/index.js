const { staking } = require('../helper/staking')

module.exports = {
  ethereum: { tvl: () => ({}), staking: staking('0x3501Ec11d205fa249f2C42f5470e137b529b35D0', '0x8Ab7404063Ec4DBcfd4598215992DC3F8EC853d7') }
};
