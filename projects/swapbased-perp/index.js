//const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

module.exports = {
  base:{
    tvl: gmxExports({ vault: '0x210b49f74040A385840a3276E81bA9010954d064', })
  }
};