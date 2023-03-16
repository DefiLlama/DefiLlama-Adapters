const PERC = "0x60bE1e1fE41c1370ADaF5d8e66f07Cf1C2Df2268";
const { staking } = require('../helper/staking')

module.exports = {
  ethereum: {
    tvl: () => 0,
    staking: staking('0xf64F48A4E27bBC299273532B26c83662ef776b7e', PERC)
  },
};