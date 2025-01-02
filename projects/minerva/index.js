const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

module.exports = {
  optimism: {
    staking: staking('0x21563764f5641ffcb89f25560644e39947b21be0', '0xE4d8701C69b3B94A620ff048e4226C895b67b2c0'),
    tvl: gmxExports({ vault: '0x7EF6f8abAc00689e057C9ec14E34aC232255a2fb', })
  }
}